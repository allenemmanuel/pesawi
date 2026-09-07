import {
  createInitialMatchState,
  playersPerSide,
  type DartMatch,
  type Discipline,
  type LegRecord,
  type MatchStatus,
  type SideSnapshot,
} from "./types";

export const START_SCORE = 501;
export const LEGS_TO_WIN = 4;
export const BEST_OF_LEGS = 7;

const IMPOSSIBLE_CHECKOUTS = new Set([163, 166, 169, 172, 173, 175, 176, 178, 179]);

export type ScoreAnalysis = {
  ok: boolean;
  issues: string[];
  canSave: boolean;
  canComplete: boolean;
  winner: "a" | "b" | null;
};

export type VisitOutcome =
  | { type: "miss" }
  | { type: "score"; remaining: number }
  | { type: "checkout" }
  | { type: "bust" };

export type VisitActionResult =
  | { ok: true; match: DartMatch; outcome: VisitOutcome }
  | { ok: false; error: string };

export function formatLabel(): string {
  return `First to ${LEGS_TO_WIN} · best of ${BEST_OF_LEGS} · 501 double-out`;
}

export function legStarter(legNumber: number): "a" | "b" {
  return legNumber % 2 === 1 ? "a" : "b";
}

export function otherSide(side: "a" | "b"): "a" | "b" {
  return side === "a" ? "b" : "a";
}

export function isCheckoutable(remaining: number): boolean {
  if (!Number.isInteger(remaining) || remaining <= 0 || remaining === 1 || remaining > 170) {
    return false;
  }
  if (remaining <= 40 && remaining % 2 === 0) return true;
  if (remaining === 50) return true;
  if (IMPOSSIBLE_CHECKOUTS.has(remaining)) return false;
  return true;
}

export function isValidVisitScore(score: number): boolean {
  return Number.isInteger(score) && score >= 0 && score <= 180;
}

export function applyVisit(remaining: number, visitScore: number): VisitOutcome | { type: "invalid"; error: string } {
  if (!isValidVisitScore(visitScore)) {
    return { type: "invalid", error: "Visit score must be 0–180." };
  }
  if (visitScore === 0) return { type: "miss" };

  const next = remaining - visitScore;
  if (next < 0 || next === 1) return { type: "bust" };
  if (next === 0) {
    if (!isCheckoutable(remaining)) return { type: "bust" };
    return { type: "checkout" };
  }
  return { type: "score", remaining: next };
}

export function liveStatus(
  match: Pick<DartMatch, "legsA" | "legsB" | "legHistory" | "remainingA" | "remainingB" | "currentLeg">,
): "scheduled" | "live" {
  if (match.legsA > 0 || match.legsB > 0 || match.legHistory.length > 0) return "live";
  if (match.remainingA < START_SCORE || match.remainingB < START_SCORE) return "live";
  if (match.currentLeg > 1) return "live";
  return "scheduled";
}

export function derivedWinner(legsA: number, legsB: number): "a" | "b" | null {
  if (legsA > legsB) return "a";
  if (legsB > legsA) return "b";
  return null;
}

export function analyzeMatch(match: DartMatch): ScoreAnalysis {
  const issues: string[] = [];
  if (match.legsA > LEGS_TO_WIN || match.legsB > LEGS_TO_WIN) {
    issues.push(`Legs cannot exceed ${LEGS_TO_WIN}.`);
  }
  if (match.legsA === LEGS_TO_WIN && match.legsB === LEGS_TO_WIN) {
    issues.push(`Only one side can win ${LEGS_TO_WIN} legs.`);
  }
  const winner = derivedWinner(match.legsA, match.legsB);
  const canComplete = issues.length === 0 && winner !== null;
  return {
    ok: issues.length === 0,
    issues,
    canSave: issues.length === 0,
    canComplete,
    winner,
  };
}

export function remainingForSide(match: DartMatch, side: "a" | "b"): number {
  return side === "a" ? match.remainingA : match.remainingB;
}

function setRemaining(match: DartMatch, side: "a" | "b", remaining: number): DartMatch {
  return side === "a" ? { ...match, remainingA: remaining } : { ...match, remainingB: remaining };
}

function incrementLeg(match: DartMatch, winner: "a" | "b"): DartMatch {
  const legsA = winner === "a" ? match.legsA + 1 : match.legsA;
  const legsB = winner === "b" ? match.legsB + 1 : match.legsB;
  const legHistory: LegRecord[] = [...match.legHistory, { winner }];
  const nextLeg = match.currentLeg + 1;
  const matchWinner = derivedWinner(legsA, legsB);

  if (matchWinner) {
    return {
      ...match,
      legsA,
      legsB,
      legHistory,
      currentLeg: nextLeg,
      remainingA: START_SCORE,
      remainingB: START_SCORE,
      throwSide: legStarter(nextLeg),
      status: "complete",
    };
  }

  return {
    ...match,
    legsA,
    legsB,
    legHistory,
    currentLeg: nextLeg,
    remainingA: START_SCORE,
    remainingB: START_SCORE,
    throwSide: legStarter(nextLeg),
    status: "live",
  };
}

export function applyVisitAction(match: DartMatch, visitScore: number): VisitActionResult {
  if (match.status === "complete") {
    return { ok: false, error: "This match is locked." };
  }
  if (derivedWinner(match.legsA, match.legsB)) {
    return { ok: false, error: "Match is already won. Complete the match." };
  }

  const side = match.throwSide;
  const remaining = remainingForSide(match, side);
  const outcome = applyVisit(remaining, visitScore);
  if (outcome.type === "invalid") {
    return { ok: false, error: outcome.error };
  }

  if (outcome.type === "miss") {
    const updated: DartMatch = {
      ...match,
      throwSide: otherSide(side),
      status: liveStatus({ ...match, remainingA: match.remainingA, remainingB: match.remainingB }),
    };
    return { ok: true, match: updated, outcome };
  }

  if (outcome.type === "bust") {
    const updated: DartMatch = {
      ...match,
      throwSide: otherSide(side),
      status: "live",
    };
    return { ok: true, match: updated, outcome };
  }

  if (outcome.type === "checkout") {
    const updated = incrementLeg(match, side);
    return { ok: true, match: updated, outcome };
  }

  const updated = setRemaining({ ...match, status: "live" }, side, outcome.remaining);
  return {
    ok: true,
    match: { ...updated, throwSide: otherSide(side) },
    outcome,
  };
}

export function newDartMatchFields(): ReturnType<typeof createInitialMatchState> {
  return createInitialMatchState();
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
    const word = count === 1 ? "one player name" : `${count} player names`;
    return { ok: false, error: `Each side needs a wilayah and ${word}.` };
  }
  return { ok: true, side: { wilayahId, players: names } };
}

export const QUICK_VISIT_SCORES = [0, 26, 41, 45, 60, 81, 85, 100, 120, 140, 180] as const;

export function normalizeDartMatch(
  raw: Partial<DartMatch> & Pick<DartMatch, "id" | "sport" | "discipline" | "boardId" | "board" | "sideA" | "sideB"> & {
    status?: MatchStatus;
    legsA?: number;
    legsB?: number;
  },
): DartMatch {
  const legsA = Number(raw.legsA ?? 0);
  const legsB = Number(raw.legsB ?? 0);
  const status: MatchStatus = raw.status ?? "scheduled";
  const legHistory = Array.isArray(raw.legHistory)
    ? raw.legHistory.filter((item): item is LegRecord => item?.winner === "a" || item?.winner === "b")
    : [];

  if (
    typeof raw.remainingA === "number" &&
    typeof raw.remainingB === "number" &&
    typeof raw.currentLeg === "number" &&
    (raw.throwSide === "a" || raw.throwSide === "b")
  ) {
    return {
      id: raw.id,
      sport: raw.sport,
      discipline: raw.discipline,
      boardId: raw.boardId,
      board: raw.board,
      sideA: raw.sideA,
      sideB: raw.sideB,
      legsA,
      legsB,
      remainingA: raw.remainingA,
      remainingB: raw.remainingB,
      currentLeg: raw.currentLeg,
      throwSide: raw.throwSide,
      legHistory,
      status,
    };
  }

  const totalLegs = legsA + legsB;
  const currentLeg = status === "complete" ? totalLegs : totalLegs + 1;

  return {
    id: raw.id,
    sport: raw.sport,
    discipline: raw.discipline,
    boardId: raw.boardId,
    board: raw.board,
    sideA: raw.sideA,
    sideB: raw.sideB,
    legsA,
    legsB,
    remainingA: 501,
    remainingB: 501,
    currentLeg: Math.max(1, currentLeg),
    throwSide: legStarter(Math.max(1, currentLeg)),
    legHistory,
    status,
  };
}
