import { WILAYAH, wilayahName } from "../badminton/types";

export { WILAYAH, wilayahName };

export const DISCIPLINES = ["MS", "WS", "MD", "WD", "XD"] as const;
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

export type PingPongMatch = {
  id: string;
  sport: "Ping Pong";
  discipline: Discipline;
  tableId: string;
  table: string;
  sideA: SideSnapshot;
  sideB: SideSnapshot;
  games: GameScore[];
  status: MatchStatus;
};

export const DISCIPLINE_LABEL: Record<Discipline, string> = {
  MS: "Men's Singles",
  WS: "Women's Singles",
  MD: "Men's Doubles",
  WD: "Women's Doubles",
  XD: "Mixed Doubles",
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

export function formatGames(games: GameScore[]): string {
  return games.map((game) => `${game.a}–${game.b}`).join(" · ");
}

export function matchMeta(match: PingPongMatch): string {
  const event = match.discipline;
  return match.table ? `${match.table} · ${event}` : event;
}

export function sheetHeader(match: PingPongMatch): string {
  return match.table ? `${match.discipline} · ${match.table}` : match.discipline;
}

export function tableNameFromCourt(courtName: string): string {
  return courtName.replace(/^Court\b/, "Table");
}
