import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import { writeError } from "./session";

const MATCHES = "matches";

function asMatch<T extends { id: string }>(id: string, data: DocumentData): T {
  return { ...(data as T), id };
}

export function subscribeSportMatches<T extends { id: string }>(sport: string, onChange: (matches: T[]) => void) {
  const q = query(collection(db, MATCHES), where("sport", "==", sport));
  return onSnapshot(
    q,
    (snap) => {
      onChange(snap.docs.map((item) => asMatch<T>(item.id, item.data())));
    },
    () => onChange([]),
  );
}

export async function listSportMatches<T extends { id: string }>(sport: string) {
  try {
    const snap = await getDocs(query(collection(db, MATCHES), where("sport", "==", sport)));
    return { ok: true as const, data: { matches: snap.docs.map((item) => asMatch<T>(item.id, item.data())) } };
  } catch (error) {
    return { ok: false as const, error: writeError(error), status: 0 };
  }
}

export async function readMatch<T extends { id: string }>(id: string) {
  const snap = await getDoc(doc(db, MATCHES, id));
  if (!snap.exists()) return null;
  return asMatch<T>(snap.id, snap.data());
}

export async function writeMatch<T extends { id: string }>(match: T) {
  const stamped = { ...match, updatedAt: Date.now() };
  await setDoc(doc(db, MATCHES, stamped.id), { ...stamped });
  return stamped as T & { updatedAt: number };
}

export async function patchMatch<T extends { id: string }>(id: string, patch: Partial<T>) {
  await updateDoc(doc(db, MATCHES, id), { ...patch, updatedAt: Date.now() } as DocumentData);
  const next = await readMatch<T & { updatedAt?: number }>(id);
  if (!next) throw new Error("Match not found.");
  return next;
}

export async function deleteMatch(id: string) {
  await deleteDoc(doc(db, MATCHES, id));
}

export function newMatchId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function fail(error: string, status = 400) {
  return { ok: false as const, error, status };
}

export function ok<T>(data: T) {
  return { ok: true as const, data };
}
