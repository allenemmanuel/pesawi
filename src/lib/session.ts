import { httpsCallable } from "firebase/functions";
import { onAuthStateChanged, signInWithCustomToken, signOut } from "firebase/auth";
import { COURTS } from "../badminton/courts";
import { auth, functions } from "./firebase";

export type CourtInfo = { id: string; name: string };

type LoginResponse = { token: string; court: CourtInfo };

let cachedCourt: CourtInfo | null = null;
const listeners = new Set<(court: CourtInfo | null) => void>();

function setCourt(court: CourtInfo | null) {
  cachedCourt = court;
  for (const listen of listeners) listen(court);
}

export function getCachedCourt() {
  return cachedCourt;
}

export function subscribeCourt(listen: (court: CourtInfo | null) => void) {
  listeners.add(listen);
  listen(cachedCourt);
  return () => {
    listeners.delete(listen);
  };
}

export function listCourts(): CourtInfo[] {
  return COURTS.map(({ id, name }) => ({ id, name }));
}

function courtFromClaims(claims: Record<string, unknown>): CourtInfo | null {
  const courtId = typeof claims.courtId === "string" ? claims.courtId : "";
  if (!courtId) return null;
  const known = COURTS.find((item) => item.id === courtId);
  return { id: courtId, name: known?.name ?? courtId };
}

export async function requireCourt(): Promise<{ ok: true; court: CourtInfo } | { ok: false; error: string }> {
  const user = auth.currentUser;
  if (!user) return { ok: false, error: "Sign in with the scorer PIN." };
  const token = await user.getIdTokenResult();
  const court = courtFromClaims(token.claims);
  if (!court) return { ok: false, error: "Sign in with the scorer PIN." };
  cachedCourt = court;
  return { ok: true, court };
}

export function writeError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  if (code.includes("permission-denied")) return "Cannot edit that data. Sign in again.";
  if (code.includes("functions/not-found")) return "Scorer login is not deployed yet. Run firebase deploy --only functions.";
  if (code.includes("unavailable") || code.includes("network")) return "Cannot reach Firebase.";
  const message = typeof error === "object" && error && "message" in error ? String(error.message) : "";
  return message.replace(/^FirebaseError:\s*/i, "") || "Request failed.";
}

export async function loginCourt(courtId: string, pin: string) {
  try {
    const call = httpsCallable<{ courtId: string; pin: string }, LoginResponse>(functions, "loginCourt");
    const result = await call({ courtId, pin });
    await signInWithCustomToken(auth, result.data.token);
    setCourt(result.data.court);
    return { ok: true as const, data: { token: result.data.token, court: result.data.court } };
  } catch (error) {
    return { ok: false as const, error: writeError(error), status: 401 };
  }
}

export async function logoutCourt() {
  await signOut(auth);
  setCourt(null);
}

export function watchAuth() {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setCourt(null);
      return;
    }
    const token = await user.getIdTokenResult();
    setCourt(courtFromClaims(token.claims));
  });
}
