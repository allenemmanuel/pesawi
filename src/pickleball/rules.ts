import { playersPerSide, type Discipline, type GameScore, type PickleballMatch, type SideSnapshot } from "./types";

export const GAMES_TO_WIN_MATCH = 2;
export const POINTS_TO_WIN_GAME = 11;
export const MUST_WIN_BY = 2;
export const MAX_GAMES = 3;

export function isLegalFinished(a: number, b: number): boolean {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) return false;
  if (a === b) return false;
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  if (hi < POINTS_TO_WIN_GAME) return false;
  if (hi === POINTS_TO_WIN_GAME) return lo <= POINTS_TO_WIN_GAME - MUST_WIN_BY;
  return lo === hi - MUST_WIN_BY;
}

export function isInProgress(a: number, b: number): boolean {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) return false;
  if (isLegalFinished(a, b)) return false;
  const hi = Math.max(a, b);
  const lead = Math.abs(a - b);
  return hi < POINTS_TO_WIN_GAME || lead < MUST_WIN_BY;
}

export function isReachable(a: number, b: number): boolean {
  return isLegalFinished(a, b) || isInProgress(a, b);
}

export function gamesWon(games: GameScore[]): { a: number; b: number } {
  let a = 0;
  let b = 0;
  for (const game of games) {
    if (!isLegalFinished(game.a, game.b)) continue;
    if (game.a > game.b) a += 1;
    else b += 1;
  }
  return { a, b };
}

export function derivedWinner(games: GameScore[]): "a" | "b" | null {
  const won = gamesWon(games);
  if (won.a > won.b) return "a";
  if (won.b > won.a) return "b";
  return null;
}

export function liveStatus(games: GameScore[]): "scheduled" | "live" {
  return games.length === 0 ? "scheduled" : "live";
}

export function gameSlotEnabled(index: number, games: GameScore[]): boolean {
  if (index === 0) return true;
  if (index >= MAX_GAMES) return false;
  const prev = games[index - 1];
  if (!prev || !isLegalFinished(prev.a, prev.b)) return false;
  const won = gamesWon(games.slice(0, index));
  return won.a < GAMES_TO_WIN_MATCH && won.b < GAMES_TO_WIN_MATCH;
}

export type MatchAnalysis = {
  ok: boolean;
  issues: string[];
  gamesWonA: number;
  gamesWonB: number;
  winner: "a" | "b" | null;
  canSave: boolean;
  canComplete: boolean;
  inProgressIndex: number | null;
};

function gameLabel(index: number): string {
  return `Game ${index + 1}`;
}

export function analyzeGames(games: GameScore[]): MatchAnalysis {
  const issues: string[] = [];

  if (games.length > MAX_GAMES) {
    issues.push(`A match has at most ${MAX_GAMES} games.`);
  }

  const sliced = games.slice(0, MAX_GAMES);
  let wonA = 0;
  let wonB = 0;
  let seenInProgress = false;
  let matchWonAt = -1;
  let inProgressIndex: number | null = null;

  for (let i = 0; i < sliced.length; i += 1) {
    const game = sliced[i];

    if (!isReachable(game.a, game.b)) {
      issues.push(`${gameLabel(i)} ${game.a}–${game.b} is not a reachable score.`);
      continue;
    }

    if (seenInProgress) {
      issues.push(`${gameLabel(i)} must stay empty while a game is still in progress.`);
    }

    if (matchWonAt >= 0) {
      issues.push(`${gameLabel(i)} must stay empty after the match is already won.`);
    }

    if (isInProgress(game.a, game.b)) {
      seenInProgress = true;
      inProgressIndex = i;
    }

    if (isLegalFinished(game.a, game.b) && matchWonAt < 0) {
      if (game.a > game.b) wonA += 1;
      else wonB += 1;
      if (wonA === GAMES_TO_WIN_MATCH || wonB === GAMES_TO_WIN_MATCH) {
        matchWonAt = i;
      }
    }
  }

  const firstTwoLegal =
    sliced.length >= 2 &&
    isLegalFinished(sliced[0].a, sliced[0].b) &&
    isLegalFinished(sliced[1].a, sliced[1].b);
  const splitAfterTwo =
    firstTwoLegal &&
    ((sliced[0].a > sliced[0].b ? 1 : 0) + (sliced[1].a > sliced[1].b ? 1 : 0) === 1);

  if (sliced.length >= 3 && !splitAfterTwo) {
    issues.push("Game 3 is only played when Games 1 and 2 are split 1–1.");
  }

  const winner = wonA >= GAMES_TO_WIN_MATCH ? "a" : wonB >= GAMES_TO_WIN_MATCH ? "b" : null;
  const uniqueIssues = [...new Set(issues)];
  const ok = uniqueIssues.length === 0;
  const canComplete = ok && winner !== null && !seenInProgress;

  return {
    ok,
    issues: uniqueIssues,
    gamesWonA: wonA,
    gamesWonB: wonB,
    winner,
    canSave: ok,
    canComplete,
    inProgressIndex,
  };
}

export function analyzeMatch(match: PickleballMatch): MatchAnalysis {
  return analyzeGames(match.games);
}

export type ParsedSlot = { a: number; b: number } | "empty" | "invalid";

export function parseSlot(aRaw: string, bRaw: string): ParsedSlot {
  const aText = aRaw.trim();
  const bText = bRaw.trim();
  if (aText === "" && bText === "") return "empty";

  const a = aText === "" ? 0 : Number(aText);
  const b = bText === "" ? 0 : Number(bText);
  if (!Number.isInteger(a) || !Number.isInteger(b)) return "invalid";
  return { a, b };
}

export function slotsToGames(
  slots: Array<{ a: string; b: string }>,
): { games: GameScore[]; error?: string } {
  const games: GameScore[] = [];
  let seenEmpty = false;

  for (let i = 0; i < slots.length; i += 1) {
    const parsed = parseSlot(slots[i].a, slots[i].b);
    if (parsed === "invalid") {
      return { games: [], error: `Game ${i + 1} must be whole numbers.` };
    }
    if (parsed === "empty") {
      seenEmpty = true;
      continue;
    }
    if (seenEmpty) {
      return { games: [], error: "Games must be filled in order." };
    }
    games.push(parsed);
  }

  return { games };
}

export function cleanedPlayers(players: unknown, count: number): string[] | null {
  if (!Array.isArray(players) || players.length !== count) return null;
  const names = players.map((item) => String(item ?? "").trim());
  if (names.some((name) => name.length === 0)) return null;
  return names;
}

export function validateSide(
  side: SideSnapshot | undefined,
  discipline: Discipline,
): { ok: true; side: SideSnapshot } | { ok: false; error: string } {
  const count = playersPerSide(discipline);
  const names = cleanedPlayers(side?.players, count);
  const wilayahId = String(side?.wilayahId ?? "");
  if (!wilayahId || !names) {
    const word = count === 1 ? "one player name" : "two player names";
    return { ok: false, error: `Each side needs a wilayah and ${word}.` };
  }
  return { ok: true, side: { wilayahId, players: names } };
}
