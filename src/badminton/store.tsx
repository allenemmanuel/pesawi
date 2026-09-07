import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createMatch, patchMatchGames, postCompleteMatch, setFinalScore as writeFinalScore, clearFinalScore as writeClearFinalScore, subscribeMatches, type CourtInfo } from "./api";
import { useSession } from "../session";
import type { BadmintonMatch, Category, Discipline, GameScore, PairSnapshot } from "./types";

export type SaveResult = { ok: true; match: BadmintonMatch } | { ok: false; error: string };

type BadmintonStore = {
  matches: BadmintonMatch[];
  ready: boolean;
  court: CourtInfo | null;
  login: (courtId: string, pin: string) => Promise<{ ok: true; court: CourtInfo } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  getMatch: (id: string) => BadmintonMatch | undefined;
  addMatch: (draft: {
    discipline: Discipline;
    category: Category;
    sideA: PairSnapshot;
    sideB: PairSnapshot;
  }) => Promise<SaveResult>;
  saveGames: (id: string, games: GameScore[], live?: boolean) => Promise<SaveResult>;
  completeMatch: (id: string, games: GameScore[]) => Promise<SaveResult>;
  setFinalScore: (sideAId: string, sideBId: string, scoreA: number, scoreB: number) => Promise<SaveResult>;
  clearFinalScore: (sideAId: string, sideBId: string) => Promise<{ ok: true } | { ok: false; error: string }>;
};

const BadmintonContext = createContext<BadmintonStore | null>(null);

export function BadmintonProvider({ children }: { children: ReactNode }) {
  const { court, login, logout } = useSession();
  const [matches, setMatches] = useState<BadmintonMatch[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return subscribeMatches((rows) => {
      setMatches(rows);
      setReady(true);
    });
  }, []);

  const value = useMemo<BadmintonStore>(
    () => ({
      matches,
      ready,
      court,
      login,
      logout,
      refresh: async () => undefined,
      getMatch: (id) => matches.find((item) => item.id === id),
      addMatch: async (draft) => {
        const result = await createMatch(draft);
        if (!result.ok) return { ok: false, error: result.error };
        return { ok: true, match: result.data.match };
      },
      saveGames: async (id, games, live) => {
        const result = await patchMatchGames(id, games, live);
        if (!result.ok) return { ok: false, error: result.error };
        return { ok: true, match: result.data.match };
      },
      completeMatch: async (id, games) => {
        const result = await postCompleteMatch(id, games);
        if (!result.ok) return { ok: false, error: result.error };
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
    [matches, ready, court, login, logout],
  );

  return createElement(BadmintonContext.Provider, { value }, children);
}

export function useBadminton(): BadmintonStore {
  const store = useContext(BadmintonContext);
  if (!store) {
    throw new Error("useBadminton must be used within BadmintonProvider");
  }
  return store;
}
