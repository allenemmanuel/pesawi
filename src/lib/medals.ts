import { doc, onSnapshot, runTransaction, setDoc } from "firebase/firestore";
import { WILAYAH } from "../badminton/types";
import type { Standing } from "../data";
import { db } from "./firebase";
import { writeError } from "./session";

export type MedalRow = {
  wilayahId: string;
  gold: number;
  silver: number;
  bronze: number;
};

export type MedalsSnapshot = {
  standings: Standing[];
  updatedAt: number | null;
};

const REF = doc(db, "meta", "medals");

function rankRows(rows: MedalRow[]): Standing[] {
  const named = rows.map((row) => {
    const wilayah = WILAYAH.find((item) => item.id === row.wilayahId);
    return {
      team: (wilayah?.name ?? row.wilayahId).toUpperCase(),
      short: wilayah?.short ?? row.wilayahId.slice(0, 3).toUpperCase(),
      gold: row.gold,
      silver: row.silver,
      bronze: row.bronze,
      total: row.gold + row.silver + row.bronze,
      rank: 0,
    };
  });
  named.sort((a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze || a.team.localeCompare(b.team));
  let rank = 0;
  return named.map((row, index) => {
    const prev = named[index - 1];
    const tied = prev != null && prev.gold === row.gold && prev.silver === row.silver && prev.bronze === row.bronze;
    rank = tied ? rank : index + 1;
    return { ...row, rank };
  });
}

export const DEFAULT_MEDAL_ROWS: MedalRow[] = WILAYAH.map((wilayah) => ({
  wilayahId: wilayah.id,
  gold: 0,
  silver: 0,
  bronze: 0,
}));

export function subscribeMedals(onChange: (snapshot: MedalsSnapshot) => void) {
  return onSnapshot(
    REF,
    (snap) => {
      const data = snap.data();
      const rows = data?.rows as MedalRow[] | undefined;
      const updatedAt = typeof data?.updatedAt === "number" ? data.updatedAt : null;
      // Older medal docs had no stamp — signed-in desks can backfill on visit.
      if (snap.exists() && updatedAt == null) {
        void setDoc(REF, { updatedAt: Date.now() }, { merge: true }).catch(() => undefined);
      }
      onChange({
        standings: rankRows(rows?.length ? rows : DEFAULT_MEDAL_ROWS),
        updatedAt,
      });
    },
    () => onChange({ standings: rankRows(DEFAULT_MEDAL_ROWS), updatedAt: null }),
  );
}

export async function saveMedalRows(rows: MedalRow[]) {
  try {
    await setDoc(REF, { rows, updatedAt: Date.now() });
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: writeError(error) };
  }
}

export async function saveMedalField(wilayahId: string, field: "gold" | "silver" | "bronze", value: number) {
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(REF);
      const existing = (snap.data()?.rows as MedalRow[] | undefined) ?? DEFAULT_MEDAL_ROWS;
      const hasRow = existing.some((row) => row.wilayahId === wilayahId);
      const rows = hasRow
        ? existing.map((row) => (row.wilayahId === wilayahId ? { ...row, [field]: value } : row))
        : [...existing, { wilayahId, gold: 0, silver: 0, bronze: 0, [field]: value }];
      tx.set(REF, { rows, updatedAt: Date.now() });
    });
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: writeError(error) };
  }
}
