import { buildRoundRobin } from "../standings/buildRoundRobin";
import { gamesWonAdapter, POINTS_PER_WIN } from "../standings/adapters";
import { derivedWinner, setsWon } from "./rules";
import type { TakrawMatch } from "./types";

export { POINTS_PER_WIN };

export function buildTakrawRoundRobin(matches: TakrawMatch[]) {
  return buildRoundRobin(matches, gamesWonAdapter(derivedWinner, setsWon));
}
