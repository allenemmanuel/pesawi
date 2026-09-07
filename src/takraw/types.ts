import { WILAYAH, wilayahName } from "../badminton/types";

export { WILAYAH, wilayahName };

export const DISCIPLINES = ["MR", "WR", "MQ", "WQ", "XQ"] as const;
export type Discipline = (typeof DISCIPLINES)[number];

export type MatchStatus = "scheduled" | "live" | "complete";

export type SideSnapshot = {
  wilayahId: string;
  players: string[];
};

export type GameScore = {
  a: number;
  b: number;
};

export type TakrawMatch = {
  id: string;
  sport: "Sepak Takraw";
  discipline: Discipline;
  courtId: string;
  court: string;
  sideA: SideSnapshot;
  sideB: SideSnapshot;
  games: GameScore[];
  status: MatchStatus;
};

export const DISCIPLINE_LABEL: Record<Discipline, string> = {
  MR: "Men's Regu",
  WR: "Women's Regu",
  MQ: "Men's Quadrant",
  WQ: "Women's Quadrant",
  XQ: "Mixed Quadrant",
};

export function isDiscipline(value: unknown): value is Discipline {
  return DISCIPLINES.includes(value as Discipline);
}

export function playersPerSide(discipline: Discipline): 3 | 4 {
  return discipline === "MR" || discipline === "WR" ? 3 : 4;
}

export function sideLine(side: SideSnapshot): string {
  return side.players.filter(Boolean).join(" / ");
}

export function formatSets(games: GameScore[]): string {
  return games.map((game) => `${game.a}–${game.b}`).join(" · ");
}

export function matchMeta(match: TakrawMatch): string {
  const event = match.discipline;
  return match.court ? `${match.court} · ${event}` : event;
}

export function sheetHeader(match: TakrawMatch): string {
  return match.court ? `${match.discipline} · ${match.court}` : match.discipline;
}
