import { WILAYAH, wilayahName } from "../badminton/types";

export { WILAYAH, wilayahName };

export const DISCIPLINES = ["men", "women"] as const;
export type Discipline = (typeof DISCIPLINES)[number];

export type MatchStatus = "scheduled" | "live" | "complete";

export type SideSnapshot = {
  wilayahId: string;
};

export type GameScore = {
  a: number;
  b: number;
};

export type BolaTamparMatch = {
  id: string;
  sport: "Bola Tampar";
  discipline: Discipline;
  courtId: string;
  court: string;
  sideA: SideSnapshot;
  sideB: SideSnapshot;
  games: GameScore[];
  status: MatchStatus;
};

export const DISCIPLINE_LABEL: Record<Discipline, string> = {
  men: "Bola Tampar Lelaki",
  women: "Bola Tampar Wanita",
};

const COURT_LETTERS = ["A", "B", "C", "D"] as const;

export function isDiscipline(value: unknown): value is Discipline {
  return DISCIPLINES.includes(value as Discipline);
}

export function formatSets(games: GameScore[]): string {
  return games.map((game) => `${game.a}–${game.b}`).join(" · ");
}

export function matchMeta(match: BolaTamparMatch): string {
  const event = DISCIPLINE_LABEL[match.discipline];
  return match.court ? `${match.court} · ${event}` : event;
}

export function sheetHeader(match: BolaTamparMatch): string {
  const event = DISCIPLINE_LABEL[match.discipline];
  return match.court ? `${event} · ${match.court}` : event;
}

export function volleyballCourtName(courtName: string): string {
  const match = courtName.match(/^Court\s+(\d+)$/i);
  if (!match) return courtName;
  const index = Number(match[1]) - 1;
  const letter = COURT_LETTERS[index];
  return letter ? `Court ${letter}` : courtName;
}
