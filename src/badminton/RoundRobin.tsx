import type { BadmintonMatch } from "./types";
import { buildBadmintonRoundRobin } from "./standings";
import { latestUpdatedAt } from "../lib/lastUpdated";
import RoundRobinTable from "../standings/RoundRobinTable";

type Props = {
  matches: BadmintonMatch[];
  editable?: boolean;
  onCommitScore?: (rowId: string, colId: string, a: number | null, b: number | null) => Promise<string | null>;
};

export default function RoundRobin({ matches, editable, onCommitScore }: Props) {
  return (
    <RoundRobinTable
      rows={buildBadmintonRoundRobin(matches)}
      lastUpdated={latestUpdatedAt(matches)}
      editable={editable}
      onCommitScore={onCommitScore}
    />
  );
}
