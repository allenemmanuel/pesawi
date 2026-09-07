export const SPORTS = [
  "Futsal",
  "Pentanque",
  "Karom",
  "Ping Pong",
  "Pickleball",
  "Badminton",
  "Sepak Takraw",
  "Dart",
  "Bola Tampar",
] as const;

export type Sport = (typeof SPORTS)[number];

export type Match = {
  id: string;
  sport: Sport;
  venue: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  live: boolean;
};

export type Standing = {
  rank: number;
  team: string;
  short: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
};

export const STANDINGS: Standing[] = [
  { rank: 1, team: "KOTA KINABALU", short: "KK", gold: 0, silver: 0, bronze: 0, total: 0 },
  { rank: 2, team: "TAWAU", short: "TWU", gold: 0, silver: 0, bronze: 0, total: 0 },
  { rank: 3, team: "SANDAKAN/KOTA MARUDU", short: "SDK/KM", gold: 0, silver: 0, bronze: 0, total: 0 },
  { rank: 4, team: "LAHAD DATU", short: "LDU", gold: 0, silver: 0, bronze: 0, total: 0 },
  { rank: 5, team: "KENINGAU/BEAUFORT", short: "KGU/BFT", gold: 0, silver: 0, bronze: 0, total: 0 },
];

export const MATCHES: Match[] = [];
