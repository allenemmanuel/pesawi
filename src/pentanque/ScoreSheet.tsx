import { useEffect, useMemo, useState } from "react";
import { disabledButtonClass, ghostButtonClass, primaryButtonClass } from "../badminton/ui";
import { POINTS_TO_WIN, analyzeScore } from "./rules";
import { usePentanque } from "./store";
import { sheetHeader, sideLine, wilayahName } from "./types";

type Props = {
  matchId: string;
  onBack: () => void;
};

function parseCount(raw: string): number | null {
  const text = raw.trim();
  if (text === "") return 0;
  if (!/^\d+$/.test(text)) return null;
  return Number(text);
}

export default function ScoreSheet({ matchId, onBack }: Props) {
  const { getMatch, saveScore, completeMatch } = usePentanque();
  const match = getMatch(matchId);
  const [pointsA, setPointsA] = useState(() => String(match?.pointsA ?? 0));
  const [pointsB, setPointsB] = useState(() => String(match?.pointsB ?? 0));
  const [message, setMessage] = useState("");

  const parsedA = parseCount(pointsA);
  const parsedB = parseCount(pointsB);

  const draft = useMemo(() => {
    if (parsedA == null || parsedB == null || !match) return null;
    return { pointsA: parsedA, pointsB: parsedB };
  }, [match, parsedA, parsedB]);

  const analysis = draft ? analyzeScore(draft) : null;
  const locked = match?.status === "complete";
  const canSave = Boolean(match) && !locked && (analysis?.canSave ?? false);
  const canComplete = !locked && (analysis?.canComplete ?? false);

  const payload = draft ? { pointsA: draft.pointsA, pointsB: draft.pointsB } : null;
  const payloadKey = JSON.stringify(payload);
  const savedKey = JSON.stringify(match ? { pointsA: match.pointsA, pointsB: match.pointsB } : null);

  useEffect(() => {
    if (!match || !payload || !canSave || locked || payloadKey === savedKey) return;
    const timer = window.setTimeout(() => {
      void saveScore(matchId, payload).then((result) => {
        if (!result.ok) setMessage(result.error);
        else setMessage("Live board updated.");
      });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [match, payload, canSave, locked, payloadKey, savedKey, matchId, saveScore]);

  if (!match) {
    return (
      <p className="text-[var(--muted)]">
        Match not found.{" "}
        <button type="button" onClick={onBack} className="text-[var(--lime)]">
          Back
        </button>
      </p>
    );
  }

  const issues =
    parsedA == null || parsedB == null ? ["Points must be whole numbers 0 or more."] : (analysis?.issues ?? []);

  async function onSave() {
    if (!payload) {
      setMessage(issues[0] ?? "Score cannot be saved.");
      return;
    }
    const result = await saveScore(matchId, payload);
    setMessage(result.ok ? "Saved. Live board updated." : result.error);
  }

  async function onComplete() {
    if (!payload) {
      setMessage(issues[0] ?? "Match is not ready to complete.");
      return;
    }
    const result = await completeMatch(matchId, payload);
    setMessage(result.ok ? "Match complete." : result.error);
  }

  function hint() {
    if (locked) return "Match locked.";
    if (issues[0]) return issues[0];
    if (analysis?.canComplete) return "Ready to complete.";
    return `First to ${POINTS_TO_WIN}. Complete when one side has ${POINTS_TO_WIN} or more.`;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
          Back
        </button>
        <div className="text-center">
          <p className="text-lg font-semibold">{sheetHeader(match)}</p>
          <p className="text-sm text-[var(--muted)]">
            {wilayahName(match.sideA.wilayahId)} vs {wilayahName(match.sideB.wilayahId)}
          </p>
        </div>
        <span className="w-16" />
      </div>

      <div className="overflow-hidden rounded-[28px] bg-[var(--surface)]">
        <div className="grid grid-cols-2 border-b border-[var(--line)] px-4 py-4 text-center sm:px-6">
          <div className="min-w-0 px-2">
            <p className="font-medium">{wilayahName(match.sideA.wilayahId)}</p>
            <p className="mt-1 truncate text-sm text-[var(--muted)]">{sideLine(match.sideA)}</p>
          </div>
          <div className="min-w-0 px-2">
            <p className="font-medium">{wilayahName(match.sideB.wilayahId)}</p>
            <p className="mt-1 truncate text-sm text-[var(--muted)]">{sideLine(match.sideB)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 items-center px-4 py-6 sm:px-6">
          <ScoreInput
            value={pointsA}
            disabled={locked}
            onChange={(value) => {
              setMessage("");
              setPointsA(value);
            }}
            ariaLabel="Points A"
          />
          <ScoreInput
            value={pointsB}
            disabled={locked}
            onChange={(value) => {
              setMessage("");
              setPointsB(value);
            }}
            ariaLabel="Points B"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="tabular text-lg font-semibold">
            {parsedA ?? "—"} — {parsedB ?? "—"}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">{hint()}</p>
          {message && <p className="mt-2 text-sm text-[var(--lime)]">{message}</p>}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => void onSave()} disabled={!canSave} className={canSave ? ghostButtonClass : disabledButtonClass}>
            Save
          </button>
          <button
            type="button"
            onClick={() => void onComplete()}
            disabled={!canComplete}
            className={canComplete ? primaryButtonClass : disabledButtonClass}
          >
            Complete match
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreInput({
  value,
  disabled,
  onChange,
  ariaLabel,
}: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <input
      inputMode="numeric"
      aria-label={ariaLabel}
      disabled={disabled}
      value={value}
      onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, "").slice(0, 2))}
      className="mx-auto h-16 w-24 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-center text-3xl font-semibold tabular outline-none focus:border-[var(--lime)] disabled:opacity-40"
    />
  );
}
