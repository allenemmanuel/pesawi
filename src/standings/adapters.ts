import type { GameScore } from "../badminton/types";
import type { RoundRobinAdapter, RowScoreView, WilayahMatch } from "./types";

export const POINTS_PER_WIN = 2;

function rowIsA(match: WilayahMatch, rowId: string) {
  return match.sideA.wilayahId === rowId;
}

export function gamesWonAdapter<T extends WilayahMatch & { games: GameScore[] }>(
  winner: (games: GameScore[]) => "a" | "b" | null,
  won: (games: GameScore[]) => { a: number; b: number },
): RoundRobinAdapter<T> {
  return {
    pointsPerWin: POINTS_PER_WIN,
    winner: (match) => (match.status === "complete" ? winner(match.games) : null),
    scoreView(match, rowId): RowScoreView {
      const isA = rowIsA(match, rowId);
      const counts = won(match.games);
      const scoredFor = isA ? counts.a : counts.b;
      const scoredAgainst = isA ? counts.b : counts.a;
      const sideWinner = winner(match.games);
      const matchWon = sideWinner === null ? null : (sideWinner === "a") === isA;
      return {
        display: `${scoredFor}–${scoredAgainst}`,
        scoredFor,
        scoredAgainst,
        won: match.status === "complete" ? matchWon : null,
      };
    },
  };
}

export function scorePairAdapter<T extends WilayahMatch>(
  winner: (match: T) => "a" | "b" | null,
  scoreA: (match: T) => number,
  scoreB: (match: T) => number,
): RoundRobinAdapter<T> {
  return {
    pointsPerWin: POINTS_PER_WIN,
    winner: (match) => (match.status === "complete" ? winner(match) : null),
    scoreView(match, rowId): RowScoreView {
      const isA = rowIsA(match, rowId);
      const scoredFor = isA ? scoreA(match) : scoreB(match);
      const scoredAgainst = isA ? scoreB(match) : scoreA(match);
      const sideWinner = winner(match);
      const matchWon = sideWinner === null ? null : (sideWinner === "a") === isA;
      return {
        display: `${scoredFor}–${scoredAgainst}`,
        scoredFor,
        scoredAgainst,
        won: match.status === "complete" ? matchWon : null,
      };
    },
  };
}
