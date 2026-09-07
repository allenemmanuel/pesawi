import { useCallback, useMemo } from "react";
import SportLiveBoard from "../SportLiveBoard";
import { latestUpdatedAt } from "../lib/lastUpdated";
import RoundRobinTable from "../standings/RoundRobinTable";
import { useSession } from "../session";
import { buildBolaTamparRoundRobin } from "./standings";
import { useBolaTampar } from "./store";
import { DISCIPLINES, DISCIPLINE_LABEL, type Discipline } from "./types";

export default function LiveBolaTampar() {
  const { matches, setFinalScore, clearFinalScore } = useBolaTampar();
  const { court } = useSession();

  const byDiscipline = useMemo(() => {
    return Object.fromEntries(
      DISCIPLINES.map((discipline) => {
        const scoped = matches.filter((match) => match.discipline === discipline);
        return [
          discipline,
          {
            rows: buildBolaTamparRoundRobin(scoped),
            lastUpdated: latestUpdatedAt(scoped),
          },
        ];
      }),
    ) as Record<Discipline, { rows: ReturnType<typeof buildBolaTamparRoundRobin>; lastUpdated: number | null }>;
  }, [matches]);

  const commitFor = useCallback(
    (discipline: Discipline) => async (rowId: string, colId: string, a: number | null, b: number | null) => {
      if (a === null || b === null) {
        const result = await clearFinalScore(rowId, colId, discipline);
        return result.ok ? null : result.error;
      }
      const result = await setFinalScore(rowId, colId, a, b, discipline);
      return result.ok ? null : result.error;
    },
    [setFinalScore, clearFinalScore],
  );

  return (
    <SportLiveBoard sport="Bola Tampar">
      <div className="flex flex-col gap-10 sm:gap-12">
        {DISCIPLINES.map((discipline) => (
          <RoundRobinTable
            key={discipline}
            title={DISCIPLINE_LABEL[discipline]}
            rows={byDiscipline[discipline].rows}
            lastUpdated={byDiscipline[discipline].lastUpdated}
            editable={Boolean(court)}
            onCommitScore={commitFor(discipline)}
          />
        ))}
      </div>
    </SportLiveBoard>
  );
}
