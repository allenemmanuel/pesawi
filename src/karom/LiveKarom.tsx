import { useCallback, useMemo } from "react";
import SportLiveBoard from "../SportLiveBoard";
import { latestUpdatedAt } from "../lib/lastUpdated";
import RoundRobinTable from "../standings/RoundRobinTable";
import { useSession } from "../session";
import { buildKaromRoundRobin } from "./standings";
import { useKarom } from "./store";

export default function LiveKarom() {
  const { matches, setFinalScore, clearFinalScore } = useKarom();
  const { court } = useSession();

  const rows = useMemo(() => buildKaromRoundRobin(matches), [matches]);
  const lastUpdated = useMemo(() => latestUpdatedAt(matches), [matches]);

  const onCommitScore = useCallback(
    async (rowId: string, colId: string, a: number | null, b: number | null) => {
      if (a === null || b === null) {
        const result = await clearFinalScore(rowId, colId);
        return result.ok ? null : result.error;
      }
      const result = await setFinalScore(rowId, colId, a, b);
      return result.ok ? null : result.error;
    },
    [setFinalScore, clearFinalScore],
  );

  return (
    <SportLiveBoard sport="Karom">
      <RoundRobinTable
        rows={rows}
        lastUpdated={lastUpdated}
        editable={Boolean(court)}
        onCommitScore={onCommitScore}
      />
    </SportLiveBoard>
  );
}
