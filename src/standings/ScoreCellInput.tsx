import { useEffect, useState } from "react";
import { parseFinalScore } from "../lib/finalScore";

type Props = {
  display: string;
  live?: boolean;
  disabled?: boolean;
  /** Pass null scores to clear / delete the result. */
  onCommit: (a: number | null, b: number | null) => Promise<string | null>;
};

/** Editable score cell for inline RR entry. Clear the field and blur/Enter to remove a score. */
export default function ScoreCellInput({ display, live, disabled, onCommit }: Props) {
  const [value, setValue] = useState(display);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(display);
    setError(null);
  }, [display]);

  async function commit() {
    const trimmed = value.trim();
    if (!trimmed) {
      if (!display) {
        setError(null);
        return;
      }
      setBusy(true);
      setError(null);
      const fail = await onCommit(null, null);
      setBusy(false);
      if (fail) {
        setError(fail);
        setValue(display);
      }
      return;
    }
    if (trimmed === display || trimmed.replace(/-/g, "–") === display) {
      setError(null);
      return;
    }
    const parsed = parseFinalScore(trimmed);
    if (!parsed) {
      setError("Use e.g. 3-1");
      setValue(display);
      return;
    }
    setBusy(true);
    setError(null);
    const fail = await onCommit(parsed.a, parsed.b);
    setBusy(false);
    if (fail) {
      setError(fail);
      setValue(display);
    }
  }

  return (
    <td className="p-0 text-center align-middle">
      <div className="relative flex min-h-11 flex-col items-center justify-center px-0.5 py-1">
        <input
          type="text"
          inputMode="numeric"
          aria-label="Score"
          disabled={disabled || busy}
          value={value}
          placeholder="—"
          title="Clear the field and press Enter to remove a score"
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
              setValue(display);
              setError(null);
              (event.target as HTMLInputElement).blur();
            }
          }}
          className={`w-full min-w-0 rounded border border-transparent bg-transparent px-1 py-2 text-center tabular font-semibold outline-none focus:border-[var(--gold)] focus:bg-[rgba(0,0,0,0.35)] disabled:opacity-60 ${
            live ? "text-[var(--lime)]" : "text-[var(--text)]"
          }`}
        />
        {error ? <span className="absolute bottom-0 left-0 right-0 truncate text-[0.55rem] text-red-300">{error}</span> : null}
      </div>
    </td>
  );
}
