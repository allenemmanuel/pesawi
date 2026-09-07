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
import type { Discipline, PentanqueMatch, SideSnapshot } from "./types";

export type SaveResult = { ok: true; match: PentanqueMatch } | { ok: false; error: string };

type PentanqueStore = {
  matches: PentanqueMatch[];
  ready: boolean;
  refresh: () => Promise<void>;
  getMatch: (id: string) => PentanqueMatch | undefined;
  addMatch: (draft: {
    discipline: Discipline;
    sideA: SideSnapshot;
    sideB: SideSnapshot;
  }) => Promise<SaveResult>;
  saveScore: (id: string, payload: ScorePayload) => Promise<SaveResult>;
  completeMatch: (id: string, payload: ScorePayload) => Promise<SaveResult>;
  setFinalScore: (sideAId: string, sideBId: string, scoreA: number, scoreB: number) => Promise<SaveResult>;
  clearFinalScore: (sideAId: string, sideBId: string) => Promise<{ ok: true } | { ok: false; error: string }>;
};

const PentanqueContext = createContext<PentanqueStore | null>(null);

export function PentanqueProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<PentanqueMatch[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return subscribeMatches((rows) => {
      setMatches(rows);
      setReady(true);
    });
  }, []);

  const refresh = useCallback(async () => undefined, []);

  const value = useMemo<PentanqueStore>(
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

  return createElement(PentanqueContext.Provider, { value }, children);
}

export function usePentanque(): PentanqueStore {
  const store = useContext(PentanqueContext);
  if (!store) {
    throw new Error("usePentanque must be used within PentanqueProvider");
  }
  return store;
}
