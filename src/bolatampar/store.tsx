import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createMatch, patchMatchGames, postCompleteMatch, setFinalScore as writeFinalScore, clearFinalScore as writeClearFinalScore, subscribeMatches } from "./api";
import type { Discipline, GameScore, BolaTamparMatch, SideSnapshot } from "./types";

export type SaveResult = { ok: true; match: BolaTamparMatch } | { ok: false; error: string };
export type ClearResult = { ok: true } | { ok: false; error: string };

type BolaTamparStore = {
  matches: BolaTamparMatch[];
  ready: boolean;
  refresh: () => Promise<void>;
  getMatch: (id: string) => BolaTamparMatch | undefined;
  addMatch: (draft: {
    discipline: Discipline;
    sideA: SideSnapshot;
    sideB: SideSnapshot;
  }) => Promise<SaveResult>;
  saveGames: (id: string, games: GameScore[]) => Promise<SaveResult>;
  completeMatch: (id: string, games: GameScore[]) => Promise<SaveResult>;
  setFinalScore: (
    sideAId: string,
    sideBId: string,
    scoreA: number,
    scoreB: number,
    discipline: Discipline,
  ) => Promise<SaveResult>;
  clearFinalScore: (sideAId: string, sideBId: string, discipline: Discipline) => Promise<ClearResult>;
};

const BolaTamparContext = createContext<BolaTamparStore | null>(null);

export function BolaTamparProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<BolaTamparMatch[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return subscribeMatches((rows) => {
      setMatches(rows);
      setReady(true);
    });
  }, []);

  const refresh = useCallback(async () => undefined, []);

  const value = useMemo<BolaTamparStore>(
    () => ({
      matches,
      ready,
      refresh,
      getMatch: (id) => matches.find((item) => item.id === id),
      addMatch: async (draft) => {
        const result = await createMatch(draft);
        if (!result.ok) return { ok: false, error: result.error };
        await refresh();
        return { ok: true, match: result.data.match };
      },
      saveGames: async (id, games) => {
        const result = await patchMatchGames(id, games);
        if (!result.ok) return { ok: false, error: result.error };
        await refresh();
        return { ok: true, match: result.data.match };
      },
      completeMatch: async (id, games) => {
        const result = await postCompleteMatch(id, games);
        if (!result.ok) return { ok: false, error: result.error };
        await refresh();
        return { ok: true, match: result.data.match };
      },
      setFinalScore: async (sideAId, sideBId, scoreA, scoreB, discipline) => {
        const result = await writeFinalScore(sideAId, sideBId, scoreA, scoreB, discipline);
        if (!result.ok) return { ok: false, error: result.error };
        return { ok: true, match: result.data.match };
      },
      clearFinalScore: async (sideAId, sideBId, discipline) => {
        const result = await writeClearFinalScore(sideAId, sideBId, discipline);
        if (!result.ok) return { ok: false, error: result.error };
        return { ok: true };
      },

    }),
    [matches, ready, refresh],
  );

  return createElement(BolaTamparContext.Provider, { value }, children);
}

export function useBolaTampar(): BolaTamparStore {
  const store = useContext(BolaTamparContext);
  if (!store) {
    throw new Error("useBolaTampar must be used within BolaTamparProvider");
  }
  return store;
}
