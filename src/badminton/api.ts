import type { BadmintonMatch, Category, Discipline, GameScore, PairSnapshot } from "./types";
import { analyzeGames } from "./rules";
import { courtName } from "./courts";
import { clearSportPairResult } from "../lib/clearFinalScore";
import { orientScores, sameWilayahPair, synthesizeGameWins } from "../lib/finalScore";
import {
  fail,
  listSportMatches,
  newMatchId,
  ok,
  patchMatch,
  readMatch,
  subscribeSportMatches,
  writeMatch,
} from "../lib/matches";
import { listCourts, loginCourt, logoutCourt, requireCourt, writeError } from "../lib/session";

export type CourtInfo = { id: string; name: string };

export function getToken() {
  return null;
}

export function setToken(_token: string | null) {}

export function fetchCourts(): Promise<{ ok: true; data: { courts: CourtInfo[] } } | { ok: false; error: string; status: number }> {
  return Promise.resolve(ok({ courts: listCourts() }));
}

export function loginScorer(courtId: string, pin: string) {
  return loginCourt(courtId, pin);
}

export async function fetchMe() {
  const court = await requireCourt();
  if (!court.ok) return fail(court.error, 401);
  return ok({ court: court.court });
}

export async function logoutScorer() {
  await logoutCourt();
  return ok({ ok: true as const });
}

export function fetchMatches() {
  return listSportMatches<BadmintonMatch>("Badminton");
}

export function subscribeMatches(onChange: (matches: BadmintonMatch[]) => void) {
  return subscribeSportMatches<BadmintonMatch>("Badminton", onChange);
}

export async function createMatch(draft: {
  discipline: Discipline;
  category: Category;
  sideA: PairSnapshot;
  sideB: PairSnapshot;
}) {
  const session = await requireCourt();
  if (!session.ok) return fail(session.error, 401);
  if (!draft.discipline || !draft.category) return fail("Choose discipline and category.");
  for (const pair of [draft.sideA, draft.sideB]) {
    if (!pair?.wilayahId || !pair.player1?.trim() || !pair.player2?.trim()) {
      return fail("Each pair needs a wilayah and two player names.");
    }
  }
  const match: BadmintonMatch = {
    id: newMatchId("bd"),
    sport: "Badminton",
    discipline: draft.discipline,
    category: draft.category,
    courtId: session.court.id,
    court: courtName(session.court.id),
    sideA: draft.sideA,
    sideB: draft.sideB,
    games: [],
    status: "scheduled",
  };
  try {
    await writeMatch(match);
    return ok({ match });
  } catch (error) {
    return fail(writeError(error), 403);
  }
}

export async function patchMatchGames(id: string, games: GameScore[], live?: boolean) {
  const session = await requireCourt();
  if (!session.ok) return fail(session.error, 401);
  const current = await readMatch<BadmintonMatch>(id);
  if (!current) return fail("Match not found.", 404);
  if (current.courtId !== session.court.id) return fail("This match belongs to another court.", 403);
  if (current.status === "complete") return fail("This match is locked.", 409);
  const analysis = analyzeGames(games);
  if (!analysis.canSave) return fail(analysis.issues[0] ?? "Score cannot be saved.");
  const status = games.length > 0 || live ? "live" : "scheduled";
  try {
    const match = await patchMatch<BadmintonMatch>(id, { games, status });
    return ok({ match });
  } catch (error) {
    return fail(writeError(error), 403);
  }
}

export async function postCompleteMatch(id: string, games: GameScore[]) {
  const session = await requireCourt();
  if (!session.ok) return fail(session.error, 401);
  const current = await readMatch<BadmintonMatch>(id);
  if (!current) return fail("Match not found.", 404);
  if (current.courtId !== session.court.id) return fail("This match belongs to another court.", 403);
  const analysis = analyzeGames(games);
  if (!analysis.canComplete) {
    return fail(analysis.issues[0] ?? "Complete only when one side has won 2 games.");
  }
  try {
    const match = await patchMatch<BadmintonMatch>(id, { games, status: "complete" });
    return ok({ match });
  } catch (error) {
    return fail(writeError(error), 403);
  }
}

function placeholderPair(wilayahId: string): PairSnapshot {
  return { wilayahId, player1: "—", player2: "—" };
}

/** Inline RR: freeform score. */
export async function setFinalScore(sideAId: string, sideBId: string, scoreA: number, scoreB: number) {
  const session = await requireCourt();
  if (!session.ok) return fail(session.error, 401);
  if (!sideAId || !sideBId || sideAId === sideBId) return fail("Pick two different wilayah.");
  if (scoreA === 0 && scoreB === 0) return fail("Enter a score for at least one side.");
  const gamesForTyped = synthesizeGameWins(scoreA, scoreB);
  if (!gamesForTyped) return fail("Enter a valid score (e.g. 3-1).");

  const listed = await listSportMatches<BadmintonMatch>("Badminton");
  if (!listed.ok) return fail(listed.error, listed.status);
  const existing = listed.data.matches
    .filter((match) => sameWilayahPair(sideAId, sideBId, match))
    .sort((a, b) => b.id.localeCompare(a.id))[0];

  try {
    if (existing) {
      const oriented = orientScores(sideAId, sideBId, scoreA, scoreB, existing);
      const games = synthesizeGameWins(oriented.scoreA, oriented.scoreB);
      if (!games) return fail("Enter a valid score (e.g. 3-1).");
      const match = await patchMatch<BadmintonMatch>(existing.id, { games, status: "complete" });
      return ok({ match });
    }

    const match: BadmintonMatch = {
      id: newMatchId("bd"),
      sport: "Badminton",
      discipline: "MD",
      category: "open",
      courtId: session.court.id,
      court: courtName(session.court.id),
      sideA: placeholderPair(sideAId),
      sideB: placeholderPair(sideBId),
      games: gamesForTyped,
      status: "complete",
    };
    await writeMatch(match);
    return ok({ match });
  } catch (error) {
    return fail(writeError(error), 403);
  }
}

export async function clearFinalScore(sideAId: string, sideBId: string) {
  return clearSportPairResult<BadmintonMatch>("Badminton", sideAId, sideBId);
}
