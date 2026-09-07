import {
  GROUP_PERIODS,
  KNOCKOUT_WIN_PERIODS,
  type FutsalMatch,
  type PenaltyScore,
  type Period,
  type Phase,
} from "./types";

export type ScoreDraft = {
  phase: Phase;
  goalsA: number;
  goalsB: number;
  period: Period;
  penalties?: PenaltyScore;
};

export type ScoreAnalysis = {
  ok: boolean;
  issues: string[];
  canSave: boolean;
  canComplete: boolean;
  showPenalties: boolean;
  winner: "a" | "b" | "draw" | null;
};

function isGoal(value: number) {
  return Number.isInteger(value) && value >= 0;
}

function penaltiesKeyed(penalties?: PenaltyScore): penalties is PenaltyScore {
  return penalties != null;
}

export function liveStatus(goalsA: number, goalsB: number, period: Period): "scheduled" | "live" {
  if (goalsA === 0 && goalsB === 0 && period === "h1") return "scheduled";
  return "live";
}

export function derivedWinner(match: Pick<FutsalMatch, "status" | "phase" | "goalsA" | "goalsB" | "penalties">) {
  if (match.status !== "complete") return null;
  if (match.goalsA > match.goalsB) return "a" as const;
  if (match.goalsB > match.goalsA) return "b" as const;
  if (match.phase === "group") return "draw" as const;
  if (match.penalties && match.penalties.a !== match.penalties.b) {
    return match.penalties.a > match.penalties.b ? ("a" as const) : ("b" as const);
  }
  return null;
}

export function analyzeScore(draft: ScoreDraft): ScoreAnalysis {
  const issues: string[] = [];
  const showPenalties = draft.phase === "knockout" && draft.goalsA === draft.goalsB;

  if (!isGoal(draft.goalsA) || !isGoal(draft.goalsB)) {
    issues.push("Goals must be whole numbers 0 or more.");
  }

  if (draft.phase === "group") {
    if (!GROUP_PERIODS.includes(draft.period)) {
      issues.push("Group matches cannot go to extra time or penalties.");
    }
    if (penaltiesKeyed(draft.penalties)) {
      issues.push("Penalties are only for knockout draws.");
    }
  }

  if (draft.phase === "knockout") {
    if (penaltiesKeyed(draft.penalties)) {
      if (draft.goalsA !== draft.goalsB) {
        issues.push("Penalty kicks are only used when the match is level.");
      }
      if (!isGoal(draft.penalties.a) || !isGoal(draft.penalties.b)) {
        issues.push("Penalty totals must be whole numbers 0 or more.");
      }
    }
  }

  const uniqueIssues = [...new Set(issues)];
  const canSave = uniqueIssues.length === 0;

  let canComplete = false;
  if (canSave) {
    if (draft.phase === "group") {
      canComplete = draft.period === "h2" || draft.period === "ft";
    } else if (draft.goalsA !== draft.goalsB) {
      canComplete = KNOCKOUT_WIN_PERIODS.includes(draft.period);
    } else if (penaltiesKeyed(draft.penalties) && draft.penalties.a !== draft.penalties.b) {
      canComplete = true;
    }
  }

  const winner = derivedWinner({
    status: canComplete ? "complete" : "live",
    phase: draft.phase,
    goalsA: draft.goalsA,
    goalsB: draft.goalsB,
    penalties: draft.penalties,
  });

  return {
    ok: uniqueIssues.length === 0,
    issues: uniqueIssues,
    canSave: uniqueIssues.length === 0 && canSave,
    canComplete: uniqueIssues.length === 0 && canComplete,
    showPenalties,
    winner: canComplete ? winner : null,
  };
}

export function analyzeMatch(match: FutsalMatch): ScoreAnalysis {
  return analyzeScore({
    phase: match.phase,
    goalsA: match.goalsA,
    goalsB: match.goalsB,
    period: match.period,
    penalties: match.penalties,
  });
}

export function cleanedPenalties(draft: ScoreDraft): PenaltyScore | undefined {
  if (draft.phase !== "knockout" || draft.goalsA !== draft.goalsB) return undefined;
  return draft.penalties;
}
