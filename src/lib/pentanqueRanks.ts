import { deleteField, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { writeError } from "./session";

/** Manual RANK overrides for the Petanque round-robin table only. */
export type RankOverrides = Record<string, number>;

const REF = doc(db, "meta", "pentanqueRanks");

function readOverrides(data: Record<string, unknown> | undefined): RankOverrides {
  const raw = data?.ranks;
  if (raw == null || typeof raw !== "object") return {};
  const out: RankOverrides = {};
  for (const [wilayahId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "number" && Number.isInteger(value) && value > 0) out[wilayahId] = value;
  }
  return out;
}

export function subscribePentanqueRanks(onChange: (overrides: RankOverrides) => void) {
  return onSnapshot(
    REF,
    (snap) => onChange(readOverrides(snap.data())),
    () => onChange({}),
  );
}

/** Pass null to drop the override and fall back to the computed rank. */
export async function savePentanqueRank(wilayahId: string, rank: number | null) {
  try {
    await setDoc(REF, { ranks: { [wilayahId]: rank ?? deleteField() }, updatedAt: Date.now() }, { merge: true });
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: writeError(error) };
  }
}
