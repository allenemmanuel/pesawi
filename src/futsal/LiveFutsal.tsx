import { useCallback, useMemo } from "react";
import SportLiveBoard from "../SportLiveBoard";
import { useSession } from "../session";
import RoundRobin from "./RoundRobin";
import { useFutsal } from "./store";
import { DISCIPLINES, DISCIPLINE_LABEL, type Discipline } from "./types";

export default function LiveFutsal() {
  const { matches, setFinalScore, clearFinalScore } = useFutsal();
  const { court } = useSession();

  const byDiscipline = useMemo(() => {
    const group = matches.filter((match) => match.phase === "group");
    return Object.fromEntries(
      DISCIPLINES.map((discipline) => [
        discipline,
        group.filter((match) => match.discipline === discipline),
      ]),
    ) as Record<Discipline, typeof group>;
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
    <SportLiveBoard sport="Futsal">
      <div className="flex flex-col gap-10 sm:gap-12">
        {DISCIPLINES.map((discipline) => (
          <RoundRobin
            key={discipline}
            title={DISCIPLINE_LABEL[discipline]}
            matches={byDiscipline[discipline]}
            editable={Boolean(court)}
            onCommitScore={commitFor(discipline)}
          />
        ))}
      </div>
    </SportLiveBoard>
  );
}
