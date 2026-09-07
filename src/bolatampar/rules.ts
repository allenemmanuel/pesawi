import type { Discipline, GameScore, BolaTamparMatch, SideSnapshot } from "./types";

export const GAMES_TO_WIN_MATCH = 3;
export const POINTS_TO_WIN_SET = 25;
export const POINTS_TO_WIN_DECIDING_SET = 15;
export const MUST_WIN_BY = 2;
export const MAX_SETS = 5;

export function pointsToWinSet(index: number): number {
  return index === MAX_SETS - 1 ? POINTS_TO_WIN_DECIDING_SET : POINTS_TO_WIN_SET;
}

export function isLegalFinished(a: number, b: number, target: number): boolean {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) return false;
  if (a === b) return false;
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  if (hi < target) return false;
  if (hi === target) return lo <= target - MUST_WIN_BY;
  return lo === hi - MUST_WIN_BY;
}

export function isInProgress(a: number, b: number, target: number): boolean {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) return false;
  if (isLegalFinished(a, b, target)) return false;
  const hi = Math.max(a, b);
  const lead = Math.abs(a - b);
  return hi < target || lead < MUST_WIN_BY;
}

export function isReachable(a: number, b: number, target: number): boolean {
  return isLegalFinished(a, b, target) || isInProgress(a, b, target);
}

export function setsWon(games: GameScore[]): { a: number; b: number } {
  let a = 0;
  let b = 0;
  for (let i = 0; i < games.length; i += 1) {
    const game = games[i];
    if (!isLegalFinished(game.a, game.b, pointsToWinSet(i))) continue;
    if (game.a > game.b) a += 1;
    else b += 1;
  }
  return { a, b };
}

export function derivedWinner(games: GameScore[]): "a" | "b" | null {
  const won = setsWon(games);
  if (won.a > won.b) return "a";
  if (won.b > won.a) return "b";
  return null;
}

export function liveStatus(games: GameScore[]): "scheduled" | "live" {
  return games.length === 0 ? "scheduled" : "live";
}

export function setSlotEnabled(index: number, games: GameScore[]): boolean {
  if (index === 0) return true;
  if (index >= MAX_SETS) return false;
  const prev = games[index - 1];
  if (!prev || !isLegalFinished(prev.a, prev.b, pointsToWinSet(index - 1))) return false;
  const won = setsWon(games.slice(0, index));
  return won.a < GAMES_TO_WIN_MATCH && won.b < GAMES_TO_WIN_MATCH;
}

export type MatchAnalysis = {
  ok: boolean;
  issues: string[];
  setsWonA: number;
  setsWonB: number;
  winner: "a" | "b" | null;
  canSave: boolean;
  canComplete: boolean;
  inProgressIndex: number | null;
};

function setLabel(index: number): string {
  return `Set ${index + 1}`;
}

export function analyzeGames(games: GameScore[]): MatchAnalysis {
  const issues: string[] = [];

  if (games.length > MAX_SETS) {
    issues.push(`A match has at most ${MAX_SETS} sets.`);
  }

  const sliced = games.slice(0, MAX_SETS);
  let wonA = 0;
  let wonB = 0;
  let seenInProgress = false;
  let matchWonAt = -1;
  let inProgressIndex: number | null = null;

  for (let i = 0; i < sliced.length; i += 1) {
    const game = sliced[i];
    const target = pointsToWinSet(i);

    if (!isReachable(game.a, game.b, target)) {
      issues.push(`${setLabel(i)} ${game.a}–${game.b} is not a reachable score.`);
      continue;
    }

    if (seenInProgress) {
      issues.push(`${setLabel(i)} must stay empty while a set is still in progress.`);
    }

    if (matchWonAt >= 0) {
      issues.push(`${setLabel(i)} must stay empty after the match is already won.`);
    }

    if (isInProgress(game.a, game.b, target)) {
      seenInProgress = true;
      inProgressIndex = i;
    }

    if (isLegalFinished(game.a, game.b, target) && matchWonAt < 0) {
      if (game.a > game.b) wonA += 1;
      else wonB += 1;
      if (wonA === GAMES_TO_WIN_MATCH || wonB === GAMES_TO_WIN_MATCH) {
        matchWonAt = i;
      }
    }
  }

  const firstFour = sliced.slice(0, 4);
  const firstFourLegal =
    firstFour.length === 4 &&
    firstFour.every((game, index) => isLegalFinished(game.a, game.b, pointsToWinSet(index)));
  const fourWon = setsWon(firstFour);
  const splitAfterFour = firstFourLegal && fourWon.a === 2 && fourWon.b === 2;

  if (sliced.length >= 5 && !splitAfterFour) {
    issues.push("Set 5 is only played when Sets 1–4 are split 2–2.");
  }

  const winner = wonA >= GAMES_TO_WIN_MATCH ? "a" : wonB >= GAMES_TO_WIN_MATCH ? "b" : null;
  const uniqueIssues = [...new Set(issues)];
  const ok = uniqueIssues.length === 0;
  const canComplete = ok && winner !== null && !seenInProgress;

  return {
    ok,
    issues: uniqueIssues,
    setsWonA: wonA,
    setsWonB: wonB,
    winner,
    canSave: ok,
    canComplete,
    inProgressIndex,
  };
}

export function analyzeMatch(match: BolaTamparMatch): MatchAnalysis {
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
      return { games: [], error: `Set ${i + 1} must be whole numbers.` };
    }
    if (parsed === "empty") {
      seenEmpty = true;
      continue;
    }
    if (seenEmpty) {
      return { games: [], error: "Sets must be filled in order." };
    }
    games.push(parsed);
  }

  return { games };
}

export function validateSide(
  side: SideSnapshot | undefined,
  _discipline?: Discipline,
): { ok: true; side: SideSnapshot } | { ok: false; error: string } {
  const wilayahId = String(side?.wilayahId ?? "").trim();
  if (!wilayahId) {
    return { ok: false, error: "Each side needs a wilayah." };
  }
  return { ok: true, side: { wilayahId } };
}
