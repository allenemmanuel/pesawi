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

export type PickleballMatch = {
  id: string;
  sport: "Pickleball";
  discipline: Discipline;
  courtId: string;
  court: string;
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

const COURT_LETTERS = ["A", "B", "C", "D"] as const;

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

export function matchMeta(match: PickleballMatch): string {
  const event = match.discipline;
  return match.court ? `${match.court} · ${event}` : event;
}

export function sheetHeader(match: PickleballMatch): string {
  return match.court ? `${match.discipline} · ${match.court}` : match.discipline;
}

export function pickleballCourtName(courtName: string): string {
  const match = courtName.match(/^Court\s+(\d+)$/i);
  if (!match) return courtName;
  const index = Number(match[1]) - 1;
  const letter = COURT_LETTERS[index];
  return letter ? `Court ${letter}` : courtName;
}
