import { WILAYAH, wilayahName } from "../badminton/types";

export { WILAYAH, wilayahName };

export const DISCIPLINES = ["MS", "WS", "MP", "WP"] as const;
export type Discipline = (typeof DISCIPLINES)[number];

export type MatchStatus = "scheduled" | "live" | "complete";

export type SideSnapshot = {
  wilayahId: string;
  players: string[];
};

export type LegRecord = {
  winner: "a" | "b";
};

export type DartMatch = {
  id: string;
  sport: "Dart";
  discipline: Discipline;
  boardId: string;
  board: string;
  sideA: SideSnapshot;
  sideB: SideSnapshot;
  legsA: number;
  legsB: number;
  remainingA: number;
  remainingB: number;
  currentLeg: number;
  throwSide: "a" | "b";
  legHistory: LegRecord[];
  status: MatchStatus;
};

export const DISCIPLINE_LABEL: Record<Discipline, string> = {
  MS: "Men's Singles",
  WS: "Women's Singles",
  MP: "Men's Pairs",
  WP: "Women's Pairs",
};

export function isDiscipline(value: unknown): value is Discipline {
  return DISCIPLINES.includes(value as Discipline);
}

export function playersPerSide(discipline: Discipline): 1 | 2 {
  return discipline === "MS" || discipline === "WS" ? 1 : 2;
}

export function sideLine(side: SideSnapshot): string {
  return side.players.filter(Boolean).join(" / ");
}

export function matchMeta(match: DartMatch): string {
  const event = match.discipline;
  return match.board ? `${match.board} · ${event}` : event;
}

export function sheetHeader(match: DartMatch): string {
  return match.board ? `${match.discipline} · ${match.board}` : match.discipline;
}

export function boardNameFromCourt(courtName: string): string {
  return courtName.replace(/^Court\b/, "Board");
}

export function createInitialMatchState(): Pick<
  DartMatch,
  "legsA" | "legsB" | "remainingA" | "remainingB" | "currentLeg" | "throwSide" | "legHistory"
> {
  return {
    legsA: 0,
    legsB: 0,
    remainingA: 501,
    remainingB: 501,
    currentLeg: 1,
    throwSide: "a",
    legHistory: [],
  };
}
