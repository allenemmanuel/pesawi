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

export type KaromMatch = {
  id: string;
  sport: "Karom";
  discipline: Discipline;
  boardId: string;
  board: string;
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

export function matchMeta(match: KaromMatch): string {
  const event = match.discipline;
  return match.board ? `${match.board} · ${event}` : event;
}

export function sheetHeader(match: KaromMatch): string {
  return match.board ? `${match.discipline} · ${match.board}` : match.discipline;
}

export function boardNameFromCourt(courtName: string): string {
  return courtName.replace(/^Court\b/, "Board");
}
