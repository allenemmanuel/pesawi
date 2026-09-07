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
import { createMatch, patchMatchScore, postCompleteMatch, setFinalScore as writeFinalScore, clearFinalScore as writeClearFinalScore, subscribeMatches, type ScorePayload } from "./api";
import type { Discipline, FutsalMatch, Phase } from "./types";

export type SaveResult = { ok: true; match: FutsalMatch } | { ok: false; error: string };
export type ClearResult = { ok: true } | { ok: false; error: string };

type FutsalStore = {
  matches: FutsalMatch[];
  ready: boolean;
  refresh: () => Promise<void>;
  getMatch: (id: string) => FutsalMatch | undefined;
  addMatch: (draft: {
    discipline: Discipline;
    phase: Phase;
    sideA: { wilayahId: string };
    sideB: { wilayahId: string };
  }) => Promise<SaveResult>;
  saveScore: (id: string, payload: ScorePayload) => Promise<SaveResult>;
  completeMatch: (id: string, payload: ScorePayload) => Promise<SaveResult>;
  setFinalScore: (
    sideAId: string,
    sideBId: string,
    scoreA: number,
    scoreB: number,
    discipline: Discipline,
  ) => Promise<SaveResult>;
  clearFinalScore: (sideAId: string, sideBId: string, discipline: Discipline) => Promise<ClearResult>;
};

const FutsalContext = createContext<FutsalStore | null>(null);

export function FutsalProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<FutsalMatch[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return subscribeMatches((rows) => {
      setMatches(rows);
      setReady(true);
    });
  }, []);

  const refresh = useCallback(async () => undefined, []);

  const value = useMemo<FutsalStore>(
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
      saveScore: async (id, payload) => {
        const result = await patchMatchScore(id, payload);
        if (!result.ok) return { ok: false, error: result.error };
        await refresh();
        return { ok: true, match: result.data.match };
      },
      completeMatch: async (id, payload) => {
        const result = await postCompleteMatch(id, payload);
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

  return createElement(FutsalContext.Provider, { value }, children);
}

export function useFutsal(): FutsalStore {
  const store = useContext(FutsalContext);
  if (!store) {
    throw new Error("useFutsal must be used within FutsalProvider");
  }
  return store;
}
