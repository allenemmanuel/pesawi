# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

PESAWI V2 — a live scoring + standings web app for *Pesta Sukan Antara Wilayah (PESAWI) Ke-13, 2026*, a Sabah (Malaysia) inter-region multi-sport games. Public spectators see live scores, standings tables and a medal tally; scoring stations ("desks") log in with a PIN to enter results; projector views feed the big screens. **UI copy is in Malay.**

Stack: React 19 + Vite + Tailwind v4 + TypeScript, Firebase (Firestore, Auth, one Cloud Function). Hosted on Firebase Hosting (`pesawi.web.app`, `pesawi-14e45.web.app`) and Vercel (`pesawi.vercel.app`, auto-deploys on push to `main`).

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server, bound to `--host` so phones / projectors on the LAN can reach it |
| `npm run build` | `tsc -b && vite build` → `dist/`. **This is also the only typecheck / lint** — TS errors fail it |
| `npm run preview` | Serve the built `dist/` |
| `npm run brand:optimize` | Regenerate optimized brand images from `materials/` via `scripts/optimize-brand.mjs` (sharp) |
| `npm run deploy` | `npm run build && firebase deploy` — pushes hosting **+ functions + Firestore rules/indexes** to project `pesawi-14e45` |
| `firebase deploy --only hosting` | Hosting only (both sites: `pesawi-14e45`, `pesawi`) |
| `firebase deploy --only functions` | The `loginCourt` function only |

There is **no test runner and no ESLint config**. To verify a change, run `npm run build`, or `npx tsc -b` for a type-check only (no bundle). `tsconfig.json` is strict and rejects unused locals/params and fallthrough cases.

There is also **no CI** — no `.github/workflows`. The only automated check is Vercel rebuilding the site on every push to `main`, so run `npm run build` locally *before* pushing.

`functions/` is a separate plain-JS package (Node 22), deployed independently of the SPA.

## Environment

`.env` holds 7 `VITE_FIREBASE_*` keys (see `.env.example`). `src/lib/firebase.ts` also carries hardcoded fallbacks joined with `||` (not `??` — deliberate, so a *blank* injected env var still falls back). The app runs against `pesawi-14e45` with no `.env` present. When configuring a host's env vars, set all 7 or none — a partial/blank set breaks Firebase init.

## Architecture

### Per-sport module pattern

The 9 sports (`src/data.ts` `SPORTS`: Futsal, Pentanque, Karom, Ping Pong, Pickleball, Badminton, Sepak Takraw, Dart, Bola Tampar) each live in `src/<sport>/` as a near-identical ~13-file template:

- **`rules.ts`** — the pure scoring/validation engine. `analyzeGames`/`analyzeScore` returns `{ ok, issues, canSave, canComplete, winner }`; `derivedWinner(...)`; `isLegalFinished(a, b)`. No I/O — this is where a sport's actual rules live.
- **`api.ts`** — Firestore CRUD for that sport. Every mutation calls `requireCourt()` and re-runs `rules.ts` server-side (`postCompleteMatch` needs `canComplete`). Built on `src/lib/matches.ts` helpers.
- **`store.tsx`** — React context (`<XProvider>` + `useX()`), subscribes to live matches, exposes actions wrapping `api.ts`.
- **`ScoreSheet.tsx`** — scorer input UI. **`Live*.tsx`** — public live table. **`ProjectionBoard.tsx`** — projector view. `NewMatchForm.tsx`, `EventFilters.tsx`, `standings.ts`, `sample.ts`, `types.ts`.

Adding or changing a sport means replicating this whole set **and** registering it in `src/App.tsx` (provider tree, `scorerSport()`, `SCORER_TO_VIEW`, `LiveView`, the `#/project` switch), `src/data.ts` `SPORTS`, `src/SportLiveBoard.tsx` maps, and `src/badminton/courts.ts` `SPORT_HASH`. `badminton/` is the reference implementation and also hosts a few shared pieces (`courts.ts`, `types.ts` `WILAYAH`).

### Data model

One flat top-level Firestore collection **`matches`**; every doc is discriminated by a `sport` string field and queried `where("sport", "==", <Name>)` (`src/lib/matches.ts`). **A winner is never stored** — `status` is `"scheduled" | "live" | "complete"` and the winner is derived from the scores on read (`derivedWinner`). Also: `courts/{courtId}` (session state, written only by the Cloud Function) and `meta/medals` (the manually-maintained medal tally, unrelated to match results).

`firestore.rules`: everything is world-readable; `matches` writes require an active court session *and* a court-id field on the doc (`courtId`/`tableId`/…); `meta` writes require a session whose `courtId` matches.

`firestore.indexes.json` is intentionally empty — every query is single-field (`where("sport", "==", …)`), so no composite indexes are needed. Don't go looking for missing index config.

### Auth = court/desk sessions, not user accounts

There are no users. A scoring station ("desk", e.g. `desk-dart`, `desk-pingat` — see `src/badminton/courts.ts` `COURTS`) signs in with a PIN. `ScorerLogin` → `src/lib/session.ts` `loginCourt()` → calls the **`loginCourt` callable Cloud Function** (`functions/index.js`), which checks the PIN (`SCORER_PIN`/`COURT_PIN_1` env, default `"1001"`), writes a fresh `sessionId` onto `courts/{id}`, and mints a Firebase **custom token** with `courtId` + `sessionId` claims. The client then `signInWithCustomToken`. Only one live session per desk — a new login revokes the previous refresh token. `requireCourt()` gates every write client-side; `firestore.rules` re-checks the same `sessionId` server-side.

On a desk's **first** login the function also seeds baseline data (the `courts/*` docs and an empty `meta/medals`) if it's missing — idempotent, so this is the only place that initial setup happens.

### Two result-entry paths (they validate differently)

1. **Score sheet** — `ScoreSheet.tsx` → `store` → `api.ts` `postCompleteMatch`/`patchMatchGames`. Full `rules.ts` validation; "Complete" is blocked without a winner.
2. **Inline round-robin grid** — `src/standings/ScoreCellInput.tsx` → `Live*.tsx` `onCommitScore` → `api.ts` `setFinalScore`. Near-zero validation: parses `"3-1"` via `src/lib/finalScore.ts` and, for game-based sports, fabricates games with `synthesizeGameWins`, then writes `status:"complete"` directly.

Deleting an inline-grid result goes through one shared helper, `src/lib/clearFinalScore.ts` (`clearSportPairResult`), which each sport's `api.ts` re-exports as `clearFinalScore`.

### Two standings engines

- **Generic** `src/standings/buildRoundRobin.ts` + `adapters.ts` — used by every sport **except futsal**. Win/loss only, `POINTS_PER_WIN = 2`, **no draw concept**: a completed match with no `derivedWinner` is silently ignored. Rendered by `src/standings/RoundRobinTable.tsx`. Each sport plugs in via an adapter from `adapters.ts`: `gamesWonAdapter` for games-won sports (badminton, ping pong, pickleball, takraw, karom, bola tampar) or `scorePairAdapter` for single-number sports (pentanque points, dart legs).
- **Futsal** `src/futsal/standings.ts` — football-style 3/1/0 with a `draws` count, goal difference and head-to-head tiebreakers; its own `RoundRobin.tsx` with a "Seri" column.

### Routing

Hash-based, no router library. `src/App.tsx` `useHash()`: `#/scorer/<sport>` = scorer login/UI, `#/scorer/medals` = medal editor, `#/project/<sport>` = projection board; anything else = the public site, whose tab state is React-only (`TOP_TABS`). Entry: `src/main.tsx` → `src/App.tsx`.

`#/project/<sport>` boards `return` early in `AppShell`, before any site header/nav — they render full-screen for a projector with no chrome. Keep that in mind when editing `App.tsx`'s top-level branching.

## Conventions

- New UI strings should be **Malay**, matching existing copy ("Utama", "Pingat", "Sukan", "Wilayah").
- The 5 competing regions ("wilayah") are `WILAYAH` in `src/badminton/types.ts`; reuse it, don't redefine.
- `public/landing/` assets are referenced by root-absolute path (`/landing/…`). Projector/landing styles are in `src/main-landing.css` (including the `@media (max-width: 460px)` mobile background).
- `data/*.json` at the repo root are gitignored local snapshots — not imported by the app.
