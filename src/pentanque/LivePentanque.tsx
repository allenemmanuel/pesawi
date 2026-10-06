import { useCallback, useEffect, useMemo, useState } from "react";
import SportLiveBoard from "../SportLiveBoard";
import { latestUpdatedAt } from "../lib/lastUpdated";
import { savePentanqueRank, subscribePentanqueRanks, type RankOverrides } from "../lib/pentanqueRanks";
import RoundRobinTable from "../standings/RoundRobinTable";
import { useSession } from "../session";
import { buildPentanqueRoundRobin } from "./standings";
import { usePentanque } from "./store";

export default function LivePentanque() {
  const { matches, setFinalScore, clearFinalScore } = usePentanque();
  const { court } = useSession();
  const [rankOverrides, setRankOverrides] = useState<RankOverrides>({});

  useEffect(() => subscribePentanqueRanks(setRankOverrides), []);

  const rows = useMemo(() => {
    const computed = buildPentanqueRoundRobin(matches);
    return computed.map((row) => {
      const override = rankOverrides[row.wilayah.id];
      return override == null ? row : { ...row, rank: override };
    });
  }, [matches, rankOverrides]);

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

  const onCommitRank = useCallback(async (wilayahId: string, rank: number | null) => {
    const result = await savePentanqueRank(wilayahId, rank);
    return result.ok ? null : result.error;
  }, []);

  return (
    <SportLiveBoard sport="Pentanque">
      <RoundRobinTable
        rows={rows}
        lastUpdated={lastUpdated}
        editable={Boolean(court)}
        onCommitScore={onCommitScore}
        onCommitRank={onCommitRank}
      />
    </SportLiveBoard>
  );
}
