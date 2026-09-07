import { WILAYAH, wilayahName } from "../badminton/types";

export { WILAYAH, wilayahName };

export const DISCIPLINES = ["MS", "WS", "MD", "WD", "XD", "MT", "WT", "XT21", "XT12"] as const;
export type Discipline = (typeof DISCIPLINES)[number];

export type MatchStatus = "scheduled" | "live" | "complete";

export type GenderFilter = "men" | "women" | "mixed";
export type FormatFilter = "singles" | "doubles" | "triples";

export type SideSnapshot = {
  wilayahId: string;
  players: string[];
};

export type PentanqueMatch = {
  id: string;
  sport: "Pentanque";
  discipline: Discipline;
  laneId: string;
  lane: string;
  sideA: SideSnapshot;
  sideB: SideSnapshot;
  pointsA: number;
  pointsB: number;
  status: MatchStatus;
};

export const DISCIPLINE_LABEL: Record<Discipline, string> = {
  MS: "Men's Singles",
  WS: "Women's Singles",
  MD: "Men's Doubles",
  WD: "Women's Doubles",
  XD: "Mixed Doubles",
  MT: "Men's Triples",
  WT: "Women's Triples",
  XT21: "Mixed Triples 2M+1W",
  XT12: "Mixed Triples 2W+1M",
};

export const GENDER_LABEL: Record<GenderFilter, string> = {
  men: "Men",
  women: "Women",
  mixed: "Mixed",
};

export const FORMAT_LABEL: Record<FormatFilter, string> = {
  singles: "Singles",
  doubles: "Doubles",
  triples: "Triples",
};

export function isDiscipline(value: unknown): value is Discipline {
  return DISCIPLINES.includes(value as Discipline);
}

export function playersPerSide(discipline: Discipline): 1 | 2 | 3 {
  if (discipline === "MS" || discipline === "WS") return 1;
  if (discipline === "MD" || discipline === "WD" || discipline === "XD") return 2;
  return 3;
}

export function genderOf(discipline: Discipline): GenderFilter {
  if (discipline === "MS" || discipline === "MD" || discipline === "MT") return "men";
  if (discipline === "WS" || discipline === "WD" || discipline === "WT") return "women";
  return "mixed";
}

export function formatOf(discipline: Discipline): FormatFilter {
  if (discipline === "MS" || discipline === "WS") return "singles";
  if (discipline === "MD" || discipline === "WD" || discipline === "XD") return "doubles";
  return "triples";
}

export function sideLine(side: SideSnapshot): string {
  return side.players.filter(Boolean).join(" / ");
}

export function matchMeta(match: PentanqueMatch): string {
  const event = match.discipline;
  return match.lane ? `${match.lane} · ${event}` : event;
}

export function sheetHeader(match: PentanqueMatch): string {
  return match.lane ? `${match.discipline} · ${match.lane}` : match.discipline;
}

export function laneNameFromCourt(courtName: string): string {
  return courtName.replace(/^Court\b/, "Lane");
}
