import { useEffect, useState, type FormEvent } from "react";
import { WILAYAH } from "../badminton/types";
import { Field, fieldClass, primaryButtonClass } from "../badminton/ui";
import { BrandCrest, EVENT } from "../brand";
import { DEFAULT_MEDAL_ROWS, saveMedalRows, subscribeMedals, type MedalRow } from "../lib/medals";

function rowsFromStandings(): MedalRow[] {
  return DEFAULT_MEDAL_ROWS.map((row) => ({ ...row }));
}

export default function MedalEditor() {
  const [rows, setRows] = useState<MedalRow[]>(rowsFromStandings);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return subscribeMedals((snapshot) => {
      setRows(
        WILAYAH.map((wilayah) => {
          const standing = snapshot.standings.find((item) => item.short === wilayah.short);
          return {
            wilayahId: wilayah.id,
            gold: standing?.gold ?? 0,
            silver: standing?.silver ?? 0,
            bronze: standing?.bronze ?? 0,
          };
        }),
      );
    });
  }, []);

  function update(wilayahId: string, field: "gold" | "silver" | "bronze", value: string) {
    const n = Number(value);
    setRows((current) =>
      current.map((row) => (row.wilayahId === wilayahId ? { ...row, [field]: Number.isFinite(n) ? n : 0 } : row)),
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    const result = await saveMedalRows(rows);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <BrandCrest className="mt-0.5 h-10 w-10 shrink-0" />
          <div className="min-w-0">
            <h1 className="font-display text-xl font-semibold tracking-tight">Medal table</h1>
            <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
              {EVENT.short} · {EVENT.dates}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Update gold, silver, and bronze for the live board.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="shrink-0 text-sm text-[var(--muted)] hover:text-[var(--text)]"
          onClick={() => {
            window.location.hash = "/scorer";
          }}
        >
          Sports
        </button>
      </div>

      <div className="space-y-4">
        {rows.map((row) => {
          const wilayah = WILAYAH.find((item) => item.id === row.wilayahId);
          return (
            <div key={row.wilayahId} className="rounded-2xl bg-[var(--surface)] px-4 py-4">
              <p className="mb-3 font-medium">{wilayah?.name ?? row.wilayahId}</p>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Gold">
                  <input className={fieldClass} inputMode="numeric" value={row.gold} onChange={(e) => update(row.wilayahId, "gold", e.target.value)} />
                </Field>
                <Field label="Silver">
                  <input className={fieldClass} inputMode="numeric" value={row.silver} onChange={(e) => update(row.wilayahId, "silver", e.target.value)} />
                </Field>
                <Field label="Bronze">
                  <input className={fieldClass} inputMode="numeric" value={row.bronze} onChange={(e) => update(row.wilayahId, "bronze", e.target.value)} />
                </Field>
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="mt-4 text-sm text-[var(--jumlah)]">{error}</p>}
      {saved && <p className="mt-4 text-sm text-[var(--lime)]">Saved. Live board updates now.</p>}

      <button type="submit" disabled={busy} className={`${primaryButtonClass} mt-6 h-12 w-full`}>
        {busy ? "Saving…" : "Save medals"}
      </button>
    </form>
  );
}
