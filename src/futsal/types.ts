import { WILAYAH, wilayahChipStyle, wilayahName } from "../badminton/types";

export { WILAYAH, wilayahChipStyle, wilayahName };

export const DISCIPLINES = ["men-open", "men-veteran", "women"] as const;
export type Discipline = (typeof DISCIPLINES)[number];

export const PHASES = ["group", "knockout"] as const;
export type Phase = (typeof PHASES)[number];

export const PERIODS = ["h1", "ht", "h2", "ft", "et1", "et2", "pen"] as const;
export type Period = (typeof PERIODS)[number];

export type MatchStatus = "scheduled" | "live" | "complete";

export type PenaltyScore = {
  a: number;
  b: number;
};

export type FutsalMatch = {
  id: string;
  sport: "Futsal";
  discipline: Discipline;
  phase: Phase;
  courtId: string;
  court: string;
  sideA: { wilayahId: string };
  sideB: { wilayahId: string };
  goalsA: number;
  goalsB: number;
  period: Period;
  penalties?: PenaltyScore;
  status: MatchStatus;
};

export const DISCIPLINE_LABEL: Record<Discipline, string> = {
  "men-open": "Futsal Lelaki Terbuka",
  "men-veteran": "Futsal Lelaki Veteran",
  women: "Futsal Wanita",
};

export function isDiscipline(value: unknown): value is Discipline {
  return DISCIPLINES.includes(value as Discipline);
}

export const PHASE_LABEL: Record<Phase, string> = {
  group: "Group",
  knockout: "Knockout",
};

export const PERIOD_LABEL: Record<Period, string> = {
  h1: "1st",
  ht: "HT",
  h2: "2nd",
  ft: "FT",
  et1: "ET1",
  et2: "ET2",
  pen: "Pens",
};

export const GROUP_PERIODS: Period[] = ["h1", "ht", "h2", "ft"];
export const KNOCKOUT_WIN_PERIODS: Period[] = ["h2", "ft", "et2"];

export function publicPeriodLabel(period: Period): string {
  if (period === "et1" || period === "et2") return "ET";
  return PERIOD_LABEL[period];
}

export function matchMeta(match: FutsalMatch): string {
  const event = `${DISCIPLINE_LABEL[match.discipline]} · ${PHASE_LABEL[match.phase]}`;
  return match.court ? `${match.court} · ${event}` : event;
}

export function sheetHeader(match: FutsalMatch): string {
  return `${DISCIPLINE_LABEL[match.discipline]} · ${PHASE_LABEL[match.phase]}${match.court ? ` · ${match.court}` : ""}`;
}

export function publicScoreNote(match: FutsalMatch): string | null {
  if (match.penalties && match.goalsA === match.goalsB) {
    return `a.e.t. · ${match.penalties.a}–${match.penalties.b} pens`;
  }
  if (match.period === "et1" || match.period === "et2") return "a.e.t.";
  return null;
}
