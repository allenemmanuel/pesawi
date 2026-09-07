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
import { createMatch, patchMatchVisit, postCompleteMatch, setFinalScore as writeFinalScore, clearFinalScore as writeClearFinalScore, subscribeMatches } from "./api";
import type { Discipline, DartMatch, SideSnapshot } from "./types";

export type SaveResult = { ok: true; match: DartMatch; outcome?: string } | { ok: false; error: string };

type DartStore = {
  matches: DartMatch[];
  ready: boolean;
  refresh: () => Promise<void>;
  getMatch: (id: string) => DartMatch | undefined;
  addMatch: (draft: {
    discipline: Discipline;
    sideA: SideSnapshot;
    sideB: SideSnapshot;
  }) => Promise<SaveResult>;
  submitVisit: (id: string, score: number) => Promise<SaveResult>;
  completeMatch: (id: string) => Promise<SaveResult>;
  setFinalScore: (sideAId: string, sideBId: string, scoreA: number, scoreB: number) => Promise<SaveResult>;
  clearFinalScore: (sideAId: string, sideBId: string) => Promise<{ ok: true } | { ok: false; error: string }>;
};

const DartContext = createContext<DartStore | null>(null);

export function DartProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<DartMatch[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return subscribeMatches((rows) => {
      setMatches(rows);
      setReady(true);
    });
  }, []);

  const refresh = useCallback(async () => undefined, []);

  const value = useMemo<DartStore>(
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
      submitVisit: async (id, score) => {
        const result = await patchMatchVisit(id, score);
        if (!result.ok) return { ok: false, error: result.error };
        await refresh();
        return { ok: true, match: result.data.match, outcome: result.data.outcome };
      },
      completeMatch: async (id) => {
        const result = await postCompleteMatch(id);
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

  return createElement(DartContext.Provider, { value }, children);
}

export function useDart(): DartStore {
  const store = useContext(DartContext);
  if (!store) {
    throw new Error("useDart must be used within DartProvider");
  }
  return store;
}
