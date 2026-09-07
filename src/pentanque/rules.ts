import { playersPerSide, type Discipline, type PentanqueMatch, type SideSnapshot } from "./types";

export const POINTS_TO_WIN = 13;

export type ScoreDraft = {
  pointsA: number;
  pointsB: number;
};

export type ScoreAnalysis = {
  ok: boolean;
  issues: string[];
  canSave: boolean;
  canComplete: boolean;
  winner: "a" | "b" | null;
};

function isPoints(value: number) {
  return Number.isInteger(value) && value >= 0;
}

export function liveStatus(pointsA: number, pointsB: number): "scheduled" | "live" {
  if (pointsA === 0 && pointsB === 0) return "scheduled";
  return "live";
}

export function derivedWinner(
  match: Pick<PentanqueMatch, "status" | "pointsA" | "pointsB">,
): "a" | "b" | null {
  if (match.status !== "complete") return null;
  if (match.pointsA > match.pointsB) return "a";
  if (match.pointsB > match.pointsA) return "b";
  return null;
}

export function analyzeScore(draft: ScoreDraft): ScoreAnalysis {
  const issues: string[] = [];

  if (!isPoints(draft.pointsA) || !isPoints(draft.pointsB)) {
    issues.push("Points must be whole numbers 0 or more.");
  } else if (draft.pointsA >= POINTS_TO_WIN && draft.pointsB >= POINTS_TO_WIN) {
    issues.push("Only one side can reach 13 or more.");
  }

  const uniqueIssues = [...new Set(issues)];
  const canSave = uniqueIssues.length === 0;
  const canComplete =
    canSave &&
    ((draft.pointsA >= POINTS_TO_WIN && draft.pointsB < POINTS_TO_WIN) ||
      (draft.pointsB >= POINTS_TO_WIN && draft.pointsA < POINTS_TO_WIN));

  const winner = derivedWinner({
    status: canComplete ? "complete" : "live",
    pointsA: draft.pointsA,
    pointsB: draft.pointsB,
  });

  return {
    ok: uniqueIssues.length === 0,
    issues: uniqueIssues,
    canSave,
    canComplete,
    winner: canComplete ? winner : null,
  };
}

export function analyzeMatch(match: PentanqueMatch): ScoreAnalysis {
  return analyzeScore({ pointsA: match.pointsA, pointsB: match.pointsB });
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
