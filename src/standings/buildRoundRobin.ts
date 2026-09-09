import { WILAYAH } from "../badminton/types";
import type { RoundRobinAdapter, RoundRobinCell, RoundRobinRow, WilayahMatch } from "./types";

function matchesBetween<T extends WilayahMatch>(matches: T[], a: string, b: string) {
  return matches.filter((match) => {
    const ids = [match.sideA.wilayahId, match.sideB.wilayahId];
    return ids.includes(a) && ids.includes(b);
  });
}

function cellFromPair<T extends WilayahMatch>(
  related: T[],
  rowId: string,
  adapter: RoundRobinAdapter<T>,
): RoundRobinCell {
  const complete = related.filter(
    (match) => match.status === "complete" && (adapter.winner(match) !== null || adapter.isDraw(match)),
  );
  const live = related.filter((match) => match.status === "live");
  const matchIds = [...live, ...complete].map((match) => match.id);

  if (complete.length === 0 && live.length === 0) {
    return { kind: "empty", display: "", live: false, won: null, matchIds: [] };
  }

  const decided = complete.map((match) => adapter.scoreView(match, rowId));
  const liveViews = live.map((match) => adapter.scoreView(match, rowId));
  const wins = decided.filter((item) => item.won).length;
  const losses = decided.filter((item) => item.won === false).length;

  if (complete.length <= 1 && live.length === 0) {
    const view = decided[0];
    return {
      kind: "result",
      display: view.display,
      live: false,
      won: view.won,
      matchIds,
    };
  }

  if (complete.length === 0 && live.length === 1) {
    const view = liveViews[0];
    return {
      kind: "result",
      display: view.display,
      live: true,
      won: null,
      matchIds,
    };
  }

  const display =
    complete.length > 0
      ? `${wins}–${losses}`
      : `${liveViews.reduce((sum, item) => sum + item.scoredFor, 0)}–${liveViews.reduce((sum, item) => sum + item.scoredAgainst, 0)}`;

  return {
    kind: "result",
    display,
    live: live.length > 0,
    won: complete.length === 0 || wins === losses ? null : wins > losses,
    matchIds,
  };
}

export function buildRoundRobin<T extends WilayahMatch>(
  matches: T[],
  adapter: RoundRobinAdapter<T>,
): RoundRobinRow[] {
  const rows: RoundRobinRow[] = WILAYAH.map((wilayah) => {
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let scoredFor = 0;
    let scoredAgainst = 0;

    const cells = WILAYAH.map((opponent): RoundRobinCell => {
      if (wilayah.id === opponent.id) {
        return { kind: "self", display: "", live: false, won: null, matchIds: [] };
      }

      const related = matchesBetween(matches, wilayah.id, opponent.id);
      const complete = related.filter(
        (match) => match.status === "complete" && (adapter.winner(match) !== null || adapter.isDraw(match)),
      );

      for (const match of complete) {
        const view = adapter.scoreView(match, wilayah.id);
        if (adapter.isDraw(match)) draws += 1;
        else if (view.won) wins += 1;
        else losses += 1;
        scoredFor += view.scoredFor;
        scoredAgainst += view.scoredAgainst;
      }

      return cellFromPair(related, wilayah.id, adapter);
    });

    return {
      wilayah,
      wins,
      draws,
      losses,
      points: wins * adapter.pointsPerWin + draws * adapter.pointsPerDraw,
      scoredFor,
      scoredAgainst,
      rank: 0,
      cells,
    };
  });

  const ranked = [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    const diff = b.scoredFor - b.scoredAgainst - (a.scoredFor - a.scoredAgainst);
    if (diff !== 0) return diff;
    return WILAYAH.findIndex((item) => item.id === a.wilayah.id) - WILAYAH.findIndex((item) => item.id === b.wilayah.id);
  });

  ranked.forEach((row, index) => {
    row.rank = index + 1;
  });

  return rows;
}
