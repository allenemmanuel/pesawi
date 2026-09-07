import type { BolaTamparMatch } from "./types";

export const SAMPLE_MATCHES: BolaTamparMatch[] = [
  {
    id: "bt-men-live",
    sport: "Bola Tampar",
    discipline: "men",
    courtId: "court-2",
    court: "Court B",
    sideA: { wilayahId: "sandakan" },
    sideB: { wilayahId: "tawau" },
    games: [
      { a: 25, b: 22 },
      { a: 20, b: 25 },
      { a: 21, b: 18 },
    ],
    status: "live",
  },
  {
    id: "bt-women-final",
    sport: "Bola Tampar",
    discipline: "women",
    courtId: "court-1",
    court: "Court A",
    sideA: { wilayahId: "kota-kinabalu" },
    sideB: { wilayahId: "keningau" },
    games: [
      { a: 25, b: 22 },
      { a: 20, b: 25 },
      { a: 25, b: 21 },
      { a: 23, b: 25 },
      { a: 15, b: 13 },
    ],
    status: "complete",
  },
];
