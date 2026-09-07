import { buildRoundRobin } from "../standings/buildRoundRobin";
import { gamesWonAdapter, POINTS_PER_WIN } from "../standings/adapters";
import { derivedWinner, gamesWon } from "./rules";
import type { PingPongMatch } from "./types";

export { POINTS_PER_WIN };

export function buildPingPongRoundRobin(matches: PingPongMatch[]) {
  return buildRoundRobin(matches, gamesWonAdapter(derivedWinner, gamesWon));
}
