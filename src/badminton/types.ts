export const DISCIPLINES = ["MD", "WD", "XD"] as const;
export type Discipline = (typeof DISCIPLINES)[number];

export const CATEGORIES = ["open", "veteran"] as const;
export type Category = (typeof CATEGORIES)[number];

export type PairSnapshot = {
  wilayahId: string;
  player1: string;
  player2: string;
};

export type GameScore = {
  a: number;
  b: number;
};

export type MatchStatus = "scheduled" | "live" | "complete";

export type BadmintonMatch = {
  id: string;
  sport: "Badminton";
  discipline: Discipline;
  category: Category;
  courtId: string;
  court: string;
  sideA: PairSnapshot;
  sideB: PairSnapshot;
  games: GameScore[];
  status: MatchStatus;
};

export const WILAYAH = [
  { id: "kota-kinabalu", name: "Kota Kinabalu", short: "KK", color: "#6ea8e8", ink: "#10243f" },
  { id: "tawau", name: "Tawau", short: "TWU", color: "#e07a7a", ink: "#3d1212" },
  { id: "sandakan", name: "Sandakan/Kota Marudu", short: "SDK/KM", color: "#6cbc7a", ink: "#14301c" },
  { id: "lahad-datu", name: "Lahad Datu", short: "LDU", color: "#e0bc3a", ink: "#3d3208" },
  { id: "keningau", name: "Keningau/Beaufort", short: "KGU/BFT", color: "#e09a4a", ink: "#3d280c" },
] as const;

export type WilayahId = (typeof WILAYAH)[number]["id"];

export function wilayahChipStyle(wilayah: (typeof WILAYAH)[number]): {
  backgroundColor: string;
  color: string;
} {
  return { backgroundColor: wilayah.color, color: wilayah.ink };
}

export const DISCIPLINE_LABEL: Record<Discipline, string> = {
  MD: "MD",
  WD: "WD",
  XD: "XD",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  open: "Open",
  veteran: "Veteran",
};

export function wilayahName(id: string): string {
  return WILAYAH.find((item) => item.id === id)?.name ?? id;
}

export function pairLine(pair: PairSnapshot): string {
  return `${pair.player1} / ${pair.player2}`;
}

export function formatGames(games: GameScore[]): string {
  return games.map((game) => `${game.a}–${game.b}`).join(" · ");
}
