import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getCachedCourt,
  loginCourt,
  logoutCourt,
  subscribeCourt,
  watchAuth,
  type CourtInfo,
} from "./lib/session";

type SessionStore = {
  court: CourtInfo | null;
  login: (courtId: string, pin: string) => Promise<{ ok: true; court: CourtInfo } | { ok: false; error: string }>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionStore | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [court, setCourt] = useState<CourtInfo | null>(getCachedCourt);

  useEffect(() => {
    const stopAuth = watchAuth();
    const stopCourt = subscribeCourt(setCourt);
    return () => {
      stopAuth();
      stopCourt();
    };
  }, []);

  const value = useMemo<SessionStore>(
    () => ({
      court,
      login: async (courtId, pin) => {
        const result = await loginCourt(courtId, pin);
        if (!result.ok) return { ok: false, error: result.error };
        return { ok: true, court: result.data.court };
      },
      logout: logoutCourt,
    }),
    [court],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionStore {
  const store = useContext(SessionContext);
  if (!store) throw new Error("useSession must be used within SessionProvider");
  return store;
}
