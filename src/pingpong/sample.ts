import type { PingPongMatch } from "./types";

export const SAMPLE_MATCHES: PingPongMatch[] = [
  {
    id: "pp-ms-live",
    sport: "Ping Pong",
    discipline: "MS",
    tableId: "court-1",
    table: "Table 1",
    sideA: { wilayahId: "kota-kinabalu", players: ["Mei"] },
    sideB: { wilayahId: "tawau", players: ["Jo"] },
    games: [
      { a: 11, b: 7 },
      { a: 9, b: 11 },
      { a: 11, b: 9 },
    ],
    status: "live",
  },
  {
    id: "pp-xd-final",
    sport: "Ping Pong",
    discipline: "XD",
    tableId: "court-2",
    table: "Table 2",
    sideA: { wilayahId: "sandakan", players: ["N. Tan", "Cathy Ng"] },
    sideB: { wilayahId: "lahad-datu", players: ["Irfan Malik", "Hana Zulkifli"] },
    games: [
      { a: 11, b: 5 },
      { a: 11, b: 8 },
      { a: 11, b: 9 },
    ],
    status: "complete",
  },
];
