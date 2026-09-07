import type { KaromMatch } from "./types";

export const SAMPLE_MATCHES: KaromMatch[] = [
  {
    id: "kr-ms-live",
    sport: "Karom",
    discipline: "MS",
    boardId: "court-4",
    board: "Board 4",
    sideA: { wilayahId: "kota-kinabalu", players: ["Haziq"] },
    sideB: { wilayahId: "tawau", players: ["Rafi"] },
    games: [
      { a: 25, b: 18 },
      { a: 18, b: 25 },
    ],
    status: "live",
  },
  {
    id: "kr-xd-final",
    sport: "Karom",
    discipline: "XD",
    boardId: "court-1",
    board: "Board 1",
    sideA: { wilayahId: "sandakan", players: ["N. Tan", "Cathy Ng"] },
    sideB: { wilayahId: "lahad-datu", players: ["Irfan Malik", "Hana Zulkifli"] },
    games: [
      { a: 25, b: 12 },
      { a: 26, b: 23 },
    ],
    status: "complete",
  },
];
