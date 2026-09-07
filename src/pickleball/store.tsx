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
import type { Discipline, GameScore, PickleballMatch, SideSnapshot } from "./types";

export type SaveResult = { ok: true; match: PickleballMatch } | { ok: false; error: string };

type PickleballStore = {
  matches: PickleballMatch[];
  ready: boolean;
  refresh: () => Promise<void>;
  getMatch: (id: string) => PickleballMatch | undefined;
  addMatch: (draft: {
    discipline: Discipline;
    sideA: SideSnapshot;
    sideB: SideSnapshot;
  }) => Promise<SaveResult>;
  saveGames: (id: string, games: GameScore[]) => Promise<SaveResult>;
  completeMatch: (id: string, games: GameScore[]) => Promise<SaveResult>;
  setFinalScore: (sideAId: string, sideBId: string, scoreA: number, scoreB: number) => Promise<SaveResult>;
  clearFinalScore: (sideAId: string, sideBId: string) => Promise<{ ok: true } | { ok: false; error: string }>;
};

const PickleballContext = createContext<PickleballStore | null>(null);

export function PickleballProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<PickleballMatch[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return subscribeMatches((rows) => {
      setMatches(rows);
      setReady(true);
    });
  }, []);

  const refresh = useCallback(async () => undefined, []);

  const value = useMemo<PickleballStore>(
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
      setFinalScore: async (sideAId, sideBId, scoreA, scoreB) => {
        const result = await writeFinalScore(sideAId, sideBId, scoreA, scoreB);
        if (!result.ok) return { ok: false, error: result.error };
        return { ok: true, match: result.data.match };
      },
      clearFinalScore: async (sideAId, sideBId) => {
        const result = await writeClearFinalScore(sideAId, sideBId);
        if (!result.ok) return { ok: false, error: result.error };
        return { ok: true };
      },

    }),
    [matches, ready, refresh],
  );

  return createElement(PickleballContext.Provider, { value }, children);
}

export function usePickleball(): PickleballStore {
  const store = useContext(PickleballContext);
  if (!store) {
    throw new Error("usePickleball must be used within PickleballProvider");
  }
  return store;
}
