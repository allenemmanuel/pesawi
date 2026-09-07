import { derivedWinner } from "./rules";
import { WILAYAH, type FutsalMatch } from "./types";

export const POINTS_WIN = 3;
export const POINTS_DRAW = 1;

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
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  rank: number;
  cells: RoundRobinCell[];
};

function groupMatches(matches: FutsalMatch[]) {
  return matches.filter((match) => match.phase === "group");
}

function matchesBetween(matches: FutsalMatch[], a: string, b: string) {
  return matches.filter((match) => {
    const ids = [match.sideA.wilayahId, match.sideB.wilayahId];
    return ids.includes(a) && ids.includes(b);
  });
}

function fromRow(match: FutsalMatch, rowId: string) {
  const rowIsA = match.sideA.wilayahId === rowId;
  const goalsFor = rowIsA ? match.goalsA : match.goalsB;
  const goalsAgainst = rowIsA ? match.goalsB : match.goalsA;
  const winner = derivedWinner(match);
  let result: "win" | "draw" | "loss" | null = null;
  if (match.status === "complete") {
    if (winner === "draw") result = "draw";
    else if (winner && (winner === "a") === rowIsA) result = "win";
    else if (winner) result = "loss";
  }
  return { goalsFor, goalsAgainst, result };
}

function cellFromPair(related: FutsalMatch[], rowId: string): RoundRobinCell {
  const complete = related.filter((match) => match.status === "complete");
  const live = related.filter((match) => match.status === "live");
  const matchIds = [...live, ...complete].map((match) => match.id);

  if (complete.length === 0 && live.length === 0) {
    return { kind: "empty", display: "", live: false, won: null, matchIds: [] };
  }

  const latest = (live[0] ?? complete[0]) as FutsalMatch;
  const view = fromRow(latest, rowId);
  const won = view.result === "win" ? true : view.result === "loss" ? false : null;

  return {
    kind: "result",
    display: `${view.goalsFor}–${view.goalsAgainst}`,
    live: latest.status === "live",
    won,
    matchIds,
  };
}

function headToHead(
  matches: FutsalMatch[],
  aId: string,
  bId: string,
): { points: number; goalDiff: number; goalsFor: number } {
  let points = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  for (const match of matchesBetween(matches, aId, bId).filter((item) => item.status === "complete")) {
    const view = fromRow(match, aId);
    if (view.result === "win") points += POINTS_WIN;
    if (view.result === "draw") points += POINTS_DRAW;
    goalsFor += view.goalsFor;
    goalsAgainst += view.goalsAgainst;
  }
  return { points, goalDiff: goalsFor - goalsAgainst, goalsFor };
}

export function buildRoundRobin(matches: FutsalMatch[]): RoundRobinRow[] {
  const pool = groupMatches(matches);

  const rows: RoundRobinRow[] = WILAYAH.map((wilayah) => {
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    const cells = WILAYAH.map((opponent): RoundRobinCell => {
      if (wilayah.id === opponent.id) {
        return { kind: "self", display: "", live: false, won: null, matchIds: [] };
      }

      const related = matchesBetween(pool, wilayah.id, opponent.id);
      for (const match of related.filter((item) => item.status === "complete")) {
        const view = fromRow(match, wilayah.id);
        if (view.result === "win") wins += 1;
        else if (view.result === "draw") draws += 1;
        else if (view.result === "loss") losses += 1;
        goalsFor += view.goalsFor;
        goalsAgainst += view.goalsAgainst;
      }

      return cellFromPair(related, wilayah.id);
    });

    return {
      wilayah,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      goalDiff: goalsFor - goalsAgainst,
      points: wins * POINTS_WIN + draws * POINTS_DRAW,
      rank: 0,
      cells,
    };
  });

  const ranked = [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    const aH2h = headToHead(pool, a.wilayah.id, b.wilayah.id);
    const bH2h = headToHead(pool, b.wilayah.id, a.wilayah.id);
    if (bH2h.points !== aH2h.points) return bH2h.points - aH2h.points;
    if (bH2h.goalDiff !== aH2h.goalDiff) return bH2h.goalDiff - aH2h.goalDiff;
    if (bH2h.goalsFor !== aH2h.goalsFor) return bH2h.goalsFor - aH2h.goalsFor;
    return WILAYAH.findIndex((item) => item.id === a.wilayah.id) - WILAYAH.findIndex((item) => item.id === b.wilayah.id);
  });

  ranked.forEach((row, index) => {
    row.rank = index + 1;
  });

  return rows;
}
