import type { WILAYAH } from "../badminton/types";

export type RoundRobinCell = {
  kind: "self" | "empty" | "result";
  display: string;
  live: boolean;
  won: boolean | null;
  matchIds: string[];
};

export type RoundRobinRow = {
  wilayah: (typeof WILAYAH)[number];
  wins: number;
  draws: number;
  losses: number;
  points: number;
  scoredFor: number;
  scoredAgainst: number;
  rank: number;
  cells: RoundRobinCell[];
};

export type WilayahSide = {
  wilayahId: string;
};

export type WilayahMatch = {
  id: string;
  status: "scheduled" | "live" | "complete";
  sideA: WilayahSide;
  sideB: WilayahSide;
};

export type RowScoreView = {
  display: string;
  scoredFor: number;
  scoredAgainst: number;
  won: boolean | null;
};

export type RoundRobinAdapter<T extends WilayahMatch> = {
  pointsPerWin: number;
  pointsPerDraw: number;
  winner: (match: T) => "a" | "b" | null;
  /** True when a completed match ended level (equal, non-zero score). */
  isDraw: (match: T) => boolean;
  scoreView: (match: T, rowId: string) => RowScoreView;
};
