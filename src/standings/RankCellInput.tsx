import { useEffect, useState } from "react";

type Props = {
  rank: number;
  className?: string;
  /** Pass null to clear the override and fall back to the computed rank. */
  onCommit: (rank: number | null) => Promise<string | null>;
};

/** Editable RANK cell. Clear the field and blur/Enter to go back to the automatic rank. */
export default function RankCellInput({ rank, className = "", onCommit }: Props) {
  const [value, setValue] = useState(String(rank));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(String(rank));
    setError(null);
  }, [rank]);

  async function commit() {
    const trimmed = value.trim();
    const next = trimmed === "" ? null : Number(trimmed);
    if (next !== null && (!Number.isInteger(next) || next < 1)) {
      setError("1+");
      setValue(String(rank));
      return;
    }
    if (next === rank) {
      setError(null);
      return;
    }
    setBusy(true);
    setError(null);
    const fail = await onCommit(next);
    setBusy(false);
    if (fail) {
      setError(fail);
      setValue(String(rank));
    }
  }

  return (
    <td className={`p-0 text-center align-middle ${className}`}>
      <div className="relative flex min-h-11 flex-col items-center justify-center px-0.5 py-1">
        <input
          type="text"
          inputMode="numeric"
          aria-label="Rank"
          disabled={busy}
          value={value}
          title="Clear the field and press Enter to use the automatic rank"
          onChange={(event) => {
            setValue(event.target.value);
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
              setValue(String(rank));
              setError(null);
              (event.target as HTMLInputElement).blur();
            }
          }}
          className="w-full min-w-0 rounded border border-transparent bg-transparent px-1 py-2 text-center tabular font-bold text-[var(--jumlah)] outline-none focus:border-[var(--gold)] focus:bg-[rgba(0,0,0,0.35)] disabled:opacity-60"
        />
        {error ? <span className="absolute bottom-0 left-0 right-0 truncate text-[0.55rem] text-red-300">{error}</span> : null}
      </div>
    </td>
  );
}
