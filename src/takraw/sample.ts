import type { TakrawMatch } from "./types";

export const SAMPLE_MATCHES: TakrawMatch[] = [
  {
    id: "st-mr-live",
    sport: "Sepak Takraw",
    discipline: "MR",
    courtId: "court-1",
    court: "Court 1",
    sideA: { wilayahId: "kota-kinabalu", players: ["Harimau", "A. Lim", "B. Chong"] },
    sideB: { wilayahId: "tawau", players: ["Rajawali", "Haziq Rahman", "Rafi Noor"] },
    games: [
      { a: 15, b: 12 },
      { a: 11, b: 15 },
    ],
    status: "live",
  },
  {
    id: "st-xq-final",
    sport: "Sepak Takraw",
    discipline: "XQ",
    courtId: "court-2",
    court: "Court 2",
    sideA: {
      wilayahId: "sandakan",
      players: ["N. Tan", "Cathy Ng", "C. Ong", "Priya Nair"],
    },
    sideB: {
      wilayahId: "lahad-datu",
      players: ["Irfan Malik", "Hana Zulkifli", "Farid Salleh", "Azman Lee"],
    },
    games: [
      { a: 15, b: 12 },
      { a: 17, b: 14 },
    ],
    status: "complete",
  },
];
