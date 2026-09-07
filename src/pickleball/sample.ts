import type { PickleballMatch } from "./types";

export const SAMPLE_MATCHES: PickleballMatch[] = [
  {
    id: "pk-wd-live",
    sport: "Pickleball",
    discipline: "WD",
    courtId: "court-1",
    court: "Court A",
    sideA: { wilayahId: "keningau", players: ["Siti Aminah", "Aina Yusuf"] },
    sideB: { wilayahId: "kota-kinabalu", players: ["Nora Aziz", "Kay Wong"] },
    games: [
      { a: 11, b: 8 },
      { a: 9, b: 11 },
    ],
    status: "live",
  },
  {
    id: "pk-xd-final",
    sport: "Pickleball",
    discipline: "XD",
    courtId: "court-2",
    court: "Court B",
    sideA: { wilayahId: "sandakan", players: ["N. Tan", "Cathy Ng"] },
    sideB: { wilayahId: "lahad-datu", players: ["Irfan Malik", "Hana Zulkifli"] },
    games: [
      { a: 11, b: 5 },
      { a: 11, b: 8 },
    ],
    status: "complete",
  },
];
