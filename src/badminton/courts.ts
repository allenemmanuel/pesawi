import { SPORTS, type Sport } from "../data";

export type ScorerDesk = {
  id: string;
  name: string;
  hash: string;
};

const SPORT_HASH: Record<Sport, string> = {
  Futsal: "/scorer/futsal",
  Pentanque: "/scorer/pentanque",
  Karom: "/scorer/karom",
  "Ping Pong": "/scorer/pingpong",
  Pickleball: "/scorer/pickleball",
  Badminton: "/scorer/badminton",
  "Sepak Takraw": "/scorer/takraw",
  Dart: "/scorer/dart",
  "Bola Tampar": "/scorer/bolatampar",
};

/** Scorer login desks (replaces physical courts). */
export const COURTS: readonly ScorerDesk[] = [
  { id: "desk-pingat", name: "Pingat", hash: "/scorer/medals" },
  ...SPORTS.map((sport) => ({
    id: `desk-${sport.toLowerCase().replace(/\s+/g, "-")}`,
    name: sport,
    hash: SPORT_HASH[sport],
  })),
] as const;

export type CourtId = (typeof COURTS)[number]["id"];

export function courtName(id: string): string {
  return COURTS.find((desk) => desk.id === id)?.name ?? id;
}

export function deskFromHash(hash: string): ScorerDesk | undefined {
  const path = hash.replace(/^#/, "");
  return COURTS.find((desk) => desk.hash === path || path.startsWith(desk.hash));
}
