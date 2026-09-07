import { buildRoundRobin } from "../standings/buildRoundRobin";
import { scorePairAdapter, POINTS_PER_WIN } from "../standings/adapters";
import { derivedWinner } from "./rules";
import type { DartMatch } from "./types";

export { POINTS_PER_WIN };

export function buildDartRoundRobin(matches: DartMatch[]) {
  return buildRoundRobin(
    matches,
    scorePairAdapter(
      (match) => derivedWinner(match.legsA, match.legsB),
      (match) => match.legsA,
      (match) => match.legsB,
    ),
  );
}
