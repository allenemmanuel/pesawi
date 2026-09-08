import { useCallback, useEffect, useState } from "react";
import { WILAYAH, wilayahChipStyle } from "./badminton/types";
import { STANDINGS, type Standing } from "./data";
import { saveMedalRows, subscribeMedals, type MedalRow } from "./lib/medals";
import { useSession } from "./session";
import LastUpdated from "./standings/LastUpdated";

function MedalDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{ background: color }}
      aria-hidden
    />
  );
}

function wilayahForStanding(row: Standing) {
  return WILAYAH.find((item) => item.short === row.short);
}

function rowsFromStandings(standings: Standing[]): MedalRow[] {
  return WILAYAH.map((wilayah) => {
    const standing = standings.find((item) => item.short === wilayah.short);
    return {
      wilayahId: wilayah.id,
      gold: standing?.gold ?? 0,
      silver: standing?.silver ?? 0,
      bronze: standing?.bronze ?? 0,
    };
  });
}

function MedalCountInput({
  value,
  disabled,
  ariaLabel,
  onCommit,
}: {
  value: number;
  disabled?: boolean;
  ariaLabel: string;
  onCommit: (next: number) => Promise<string | null>;
}) {
  const [text, setText] = useState(String(value));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(String(value));
    setError(null);
  }, [value]);

  async function commit() {
    const trimmed = text.trim();
    if (trimmed === "") {
      setText(String(value));
      return;
    }
    const n = Number(trimmed);
    if (!Number.isInteger(n) || n < 0) {
      setError("0+");
      setText(String(value));
      return;
    }
    if (n === value) {
      setError(null);
      return;
    }
    setBusy(true);
    setError(null);
    const fail = await onCommit(n);
    setBusy(false);
    if (fail) {
      setError(fail);
      setText(String(value));
    }
  }

  return (
    <td className="relative p-0 text-center align-middle">
      <input
        type="text"
        inputMode="numeric"
        aria-label={ariaLabel}
        disabled={disabled || busy}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setError(null);
        }}
        onBlur={() => {
          void commit();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            (event.target as HTMLInputElement).blur();
          }
          if (event.key === "Escape") {
            setText(String(value));
            setError(null);
            (event.target as HTMLInputElement).blur();
          }
        }}
        className="w-full min-w-[2.5rem] bg-transparent px-2 py-3 text-center tabular outline-none focus:bg-[rgba(0,0,0,0.35)] focus:ring-1 focus:ring-[var(--gold)] disabled:opacity-60 sm:px-3 sm:py-4"
      />
      {error ? (
        <span className="absolute bottom-0 left-0 right-0 truncate text-[0.55rem] text-red-300">{error}</span>
      ) : null}
    </td>
  );
}

export default function MainStandings() {
  const [standings, setStandings] = useState<Standing[]>(STANDINGS);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const { court } = useSession();
  const editable = Boolean(court);

  useEffect(
    () =>
      subscribeMedals((snapshot) => {
        setStandings(snapshot.standings);
        setUpdatedAt(snapshot.updatedAt);
      }),
    [],
  );

  // Stamp Last updated on first scorer visit if the medals doc predates timestamps.
  useEffect(() => {
    if (!court || updatedAt != null) return;
    void saveMedalRows(rowsFromStandings(standings));
  }, [court, updatedAt, standings]);

  const commitField = useCallback(
    async (wilayahId: string, field: "gold" | "silver" | "bronze", next: number) => {
      const rows = rowsFromStandings(standings).map((row) =>
        row.wilayahId === wilayahId ? { ...row, [field]: next } : row,
      );
      const result = await saveMedalRows(rows);
      return result.ok ? null : result.error;
    },
    [standings],
  );

  return (
    <section>
      <div
        className="mb-6 flex w-full min-w-0 flex-col items-center gap-3 pt-1 text-center sm:mb-8 sm:gap-2"
        aria-label="Kedudukan Pingat — PESAWI Ke-13"
      >
        <img
          src="/landing/hero-title.png"
          alt="Pesta Sukan Antara Wilayah (PESAWI) Ke-13, 2026"
          className="mb-0 h-auto w-[12.6rem] max-w-full object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)] md:mb-[-10px]"
          draggable={false}
        />
        <h1 className="sport-live-title shrink">KEDUDUKAN PINGAT</h1>
        <p className="text-[0.8rem] font-bold uppercase tracking-[0.3em] text-[#f0c43a] sm:text-[0.95rem] [-webkit-text-stroke:0.4px_rgba(255,255,255,0.55)] [paint-order:stroke_fill] [text-shadow:0_2px_0_#6b4500,0_4px_14px_rgba(0,0,0,0.7)]">
          Kedudukan keseluruhan wilayah
        </p>
      </div>

      <div className="live-card-enter overflow-x-auto rounded-2xl border border-[var(--line)] bg-[rgba(5,9,20,0.78)] shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <table className="w-full border-collapse text-sm sm:min-w-[36rem] sm:text-base">
          <thead>
            <tr className="border-b border-[var(--line)]">
              <th className="w-px whitespace-nowrap px-3 py-3 text-left font-semibold tracking-wide sm:px-4 sm:py-4">
                WILAYAH
              </th>
              <th className="px-2 py-3 text-center font-semibold tracking-wide sm:px-3 sm:py-4">
                <span className="inline-flex items-center justify-center gap-2">
                  <MedalDot color="var(--gold)" />
                  <span className="hidden sm:inline">EMAS</span>
                </span>
              </th>
              <th className="px-2 py-3 text-center font-semibold tracking-wide sm:px-3 sm:py-4">
                <span className="inline-flex items-center justify-center gap-2">
                  <MedalDot color="var(--silver)" />
                  <span className="hidden sm:inline">PERAK</span>
                </span>
              </th>
              <th className="px-2 py-3 text-center font-semibold tracking-wide sm:px-3 sm:py-4">
                <span className="inline-flex items-center justify-center gap-2">
                  <MedalDot color="var(--bronze)" />
                  <span className="hidden sm:inline">GANGSA</span>
                </span>
              </th>
              <th className="px-3 py-3 text-center font-semibold tracking-wide text-[var(--jumlah)] sm:px-6 sm:py-4">
                <span className="sm:hidden">JML</span>
                <span className="hidden sm:inline">JUMLAH</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => {
              const wilayah = wilayahForStanding(row);
              const wilayahId = wilayah?.id;
              return (
                <tr key={row.team} className="border-b border-[var(--line)] last:border-b-0">
                  <td
                    className="w-px whitespace-nowrap px-3 py-3 font-medium tracking-wide sm:px-4 sm:py-4"
                    style={wilayah ? wilayahChipStyle(wilayah) : undefined}
                  >
                    <span className="sm:hidden">{row.short}</span>
                    <span className="hidden sm:inline">{row.team}</span>
                  </td>
                  {editable && wilayahId ? (
                    <>
                      <MedalCountInput
                        value={row.gold}
                        ariaLabel={`${row.team} emas`}
                        onCommit={(n) => commitField(wilayahId, "gold", n)}
                      />
                      <MedalCountInput
                        value={row.silver}
                        ariaLabel={`${row.team} perak`}
                        onCommit={(n) => commitField(wilayahId, "silver", n)}
                      />
                      <MedalCountInput
                        value={row.bronze}
                        ariaLabel={`${row.team} gangsa`}
                        onCommit={(n) => commitField(wilayahId, "bronze", n)}
                      />
                    </>
                  ) : (
                    <>
                      <td className="px-2 py-3 text-center tabular sm:px-3 sm:py-4">{row.gold}</td>
                      <td className="px-2 py-3 text-center tabular sm:px-3 sm:py-4">{row.silver}</td>
                      <td className="px-2 py-3 text-center tabular sm:px-3 sm:py-4">{row.bronze}</td>
                    </>
                  )}
                  <td className="px-3 py-3 text-center font-semibold tabular text-[var(--jumlah)] sm:px-6 sm:py-4">
                    {row.total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex items-center justify-start gap-3 px-1">
        <LastUpdated at={updatedAt} className="mt-0 px-0" />
      </div>
    </section>
  );
}
