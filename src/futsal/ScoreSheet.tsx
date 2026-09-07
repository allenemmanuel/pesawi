import { useEffect, useMemo, useState } from "react";
import { Chip, disabledButtonClass, ghostButtonClass, primaryButtonClass } from "../badminton/ui";
import { analyzeScore, liveStatus } from "./rules";
import { useFutsal } from "./store";
import {
  GROUP_PERIODS,
  PERIODS,
  PERIOD_LABEL,
  sheetHeader,
  wilayahName,
  type PenaltyScore,
  type Period,
} from "./types";

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

function parseOptionalCount(raw: string): number | null {
  const text = raw.trim();
  if (text === "") return null;
  if (!/^\d+$/.test(text)) return null;
  return Number(text);
}

export default function ScoreSheet({ matchId, onBack }: Props) {
  const { getMatch, saveScore, completeMatch } = useFutsal();
  const match = getMatch(matchId);
  const [goalsA, setGoalsA] = useState(() => String(match?.goalsA ?? 0));
  const [goalsB, setGoalsB] = useState(() => String(match?.goalsB ?? 0));
  const [period, setPeriod] = useState<Period>(match?.period ?? "h1");
  const [penA, setPenA] = useState(() => (match?.penalties ? String(match.penalties.a) : ""));
  const [penB, setPenB] = useState(() => (match?.penalties ? String(match.penalties.b) : ""));
  const [liveOn, setLiveOn] = useState(() => match?.status === "live");
  const [message, setMessage] = useState("");

  const parsedA = parseCount(goalsA);
  const parsedB = parseCount(goalsB);
  const parsedPenA = parseOptionalCount(penA);
  const parsedPenB = parseOptionalCount(penB);

  const penalties: PenaltyScore | undefined = useMemo(() => {
    if (parsedPenA == null && parsedPenB == null) return undefined;
    if (parsedPenA == null || parsedPenB == null) return { a: Number.NaN, b: Number.NaN };
    return { a: parsedPenA, b: parsedPenB };
  }, [parsedPenA, parsedPenB]);

  const draft = useMemo(() => {
    if (parsedA == null || parsedB == null || !match) return null;
    return {
      phase: match.phase,
      goalsA: parsedA,
      goalsB: parsedB,
      period,
      penalties,
    };
  }, [match, parsedA, parsedB, period, penalties]);

  const analysis = draft ? analyzeScore(draft) : null;
  const locked = match?.status === "complete";
  const canSave = Boolean(match) && !locked && (analysis?.canSave ?? false);
  const canComplete = !locked && (analysis?.canComplete ?? false);
  const showPenalties = match?.phase === "knockout" && parsedA != null && parsedB != null && parsedA === parsedB;
  const autoLive =
    parsedA != null && parsedB != null && liveStatus(parsedA, parsedB, period) === "live";
  const showLive = liveOn || autoLive;
  const allowedPeriods = match?.phase === "group" ? GROUP_PERIODS : PERIODS;

  useEffect(() => {
    if (!showPenalties) {
      setPenA("");
      setPenB("");
    }
  }, [showPenalties]);

  const payload = draft
    ? {
        goalsA: draft.goalsA,
        goalsB: draft.goalsB,
        period: draft.period,
        penalties: showPenalties ? draft.penalties ?? null : null,
        live: showLive,
      }
    : null;

  const payloadKey = JSON.stringify(payload);
  const savedKey = JSON.stringify(
    match
      ? {
          goalsA: match.goalsA,
          goalsB: match.goalsB,
          period: match.period,
          penalties: match.penalties ?? null,
          live: match.status === "live",
        }
      : null,
  );

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

  const issues = parsedA == null || parsedB == null ? ["Goals must be whole numbers 0 or more."] : (analysis?.issues ?? []);

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
    if (!showLive) return "Turn on Live to show this match on the projector.";
    if (match?.phase === "group") return "Complete after 2nd or FT. Draws are allowed.";
    if (showPenalties) return "Level knockout. Key penalties when the shoot-out is done.";
    return "Complete when one side leads after 2nd, FT, or ET2.";
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
          <p className="font-medium">{wilayahName(match.sideA.wilayahId)}</p>
          <p className="font-medium">{wilayahName(match.sideB.wilayahId)}</p>
        </div>
        <div className="grid grid-cols-2 items-center px-4 py-6 sm:px-6">
          <ScoreInput
            value={goalsA}
            disabled={locked}
            onChange={(value) => {
              setMessage("");
              setGoalsA(value);
            }}
            ariaLabel="Goals A"
          />
          <ScoreInput
            value={goalsB}
            disabled={locked}
            onChange={(value) => {
              setMessage("");
              setGoalsB(value);
            }}
            ariaLabel="Goals B"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          role="switch"
          aria-checked={showLive}
          disabled={locked || autoLive}
          onClick={() => {
            if (locked || autoLive) return;
            setMessage("");
            setLiveOn((prev) => !prev);
          }}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide ${
            showLive
              ? "bg-[var(--live-bg)] text-[var(--lime)]"
              : "border border-[var(--line)] text-[var(--muted)]"
          } ${locked || autoLive ? "opacity-70" : ""}`}
        >
          {showLive ? <span className="live-dot" /> : null}
          LIVE
        </button>
      </div>

      <div className="chip-row mt-6 flex gap-2 overflow-x-auto pb-1">
        {allowedPeriods.map((item) => (
          <Chip
            key={item}
            active={period === item}
            onClick={() => {
              if (locked) return;
              setMessage("");
              setPeriod(item);
            }}
          >
            {PERIOD_LABEL[item]}
          </Chip>
        ))}
      </div>

      {showPenalties ? (
        <div className="mt-6 overflow-hidden rounded-[28px] bg-[var(--surface)]">
          <p className="border-b border-[var(--line)] px-4 py-3 text-center text-sm text-[var(--muted)] sm:px-6">
            Penalty shoot-out
          </p>
          <div className="grid grid-cols-2 items-center px-4 py-6 sm:px-6">
            <ScoreInput
              value={penA}
              disabled={locked}
              onChange={(value) => {
                setMessage("");
                setPenA(value);
              }}
              ariaLabel="Penalties A"
            />
            <ScoreInput
              value={penB}
              disabled={locked}
              onChange={(value) => {
                setMessage("");
                setPenB(value);
              }}
              ariaLabel="Penalties B"
            />
          </div>
        </div>
      ) : null}

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
