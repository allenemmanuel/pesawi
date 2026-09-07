import { useCallback } from "react";
import SportLiveBoard from "../SportLiveBoard";
import { useSession } from "../session";
import RoundRobin from "./RoundRobin";
import { useBadminton } from "./store";

export default function LiveBadminton() {
  const { matches, setFinalScore, clearFinalScore } = useBadminton();
  const { court } = useSession();

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
    <SportLiveBoard sport="Badminton">
      <RoundRobin
        matches={matches}
        editable={Boolean(court)}
        onCommitScore={onCommitScore}
      />
    </SportLiveBoard>
  );
}
