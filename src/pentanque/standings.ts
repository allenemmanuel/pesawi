import { buildRoundRobin } from "../standings/buildRoundRobin";
import { scorePairAdapter, POINTS_PER_WIN } from "../standings/adapters";
import { derivedWinner } from "./rules";
import type { PentanqueMatch } from "./types";

export { POINTS_PER_WIN };

export function buildPentanqueRoundRobin(matches: PentanqueMatch[]) {
  return buildRoundRobin(
    matches,
    scorePairAdapter<PentanqueMatch>(
      derivedWinner,
      (match) => match.pointsA,
      (match) => match.pointsB,
    ),
  );
}
