import { useState } from "react";
import { disabledButtonClass, ghostButtonClass, primaryButtonClass } from "../badminton/ui";
import {
  QUICK_VISIT_SCORES,
  START_SCORE,
  analyzeMatch,
  formatLabel,
  isValidVisitScore,
} from "./rules";
import { useDart } from "./store";
import { sheetHeader, sideLine, wilayahName } from "./types";

type Props = {
  matchId: string;
  onBack: () => void;
};

function outcomeMessage(outcome: string | undefined, matchLegs: { a: number; b: number }): string {
  if (outcome === "bust") return "Bust — no score, other side throws.";
  if (outcome === "miss") return "No score — other side throws.";
  if (outcome === "checkout") return `Leg won · match ${matchLegs.a}–${matchLegs.b}.`;
  if (outcome === "score") return "Visit saved.";
  return "";
}

export default function ScoreSheet({ matchId, onBack }: Props) {
  const { getMatch, submitVisit, completeMatch } = useDart();
  const match = getMatch(matchId);
  const [customScore, setCustomScore] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

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

  const locked = match.status === "complete";
  const analysis = analyzeMatch(match);
  const canComplete = !locked && analysis.canComplete && match.status === "live";
  const throwing = match.throwSide;
  const inLeg = !locked && !analysis.winner;

  async function onVisit(score: number) {
    if (locked || busy) return;
    if (!isValidVisitScore(score)) {
      setMessage("Visit score must be 0–180.");
      return;
    }
    setBusy(true);
    const result = await submitVisit(matchId, score);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setCustomScore("");
    setMessage(outcomeMessage(result.outcome, { a: result.match.legsA, b: result.match.legsB }));
  }

  async function onComplete() {
    if (!canComplete) return;
    setBusy(true);
    const result = await completeMatch(matchId);
    setBusy(false);
    setMessage(result.ok ? "Match complete." : result.error);
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
          Back
        </button>
        <div className="text-center">
          <p className="text-lg font-semibold">{sheetHeader(match)}</p>
          <p className="text-sm text-[var(--muted)]">{formatLabel()}</p>
        </div>
        <span className="w-16" />
      </div>

      <div className="mb-6 rounded-[28px] bg-[var(--surface)] px-5 py-6 text-center">
        <p className="text-sm text-[var(--muted)]">Match legs</p>
        <p className="tabular mt-1 text-4xl font-semibold">
          {match.legsA} — {match.legsB}
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {locked ? "Final" : `Leg ${match.currentLeg} · ${START_SCORE} double-out`}
        </p>
      </div>

      <div className="overflow-hidden rounded-[28px] bg-[var(--surface)]">
        <div className="grid grid-cols-2 border-b border-[var(--line)] px-4 py-4 text-center sm:px-6">
          <SidePanel
            label={wilayahName(match.sideA.wilayahId)}
            players={sideLine(match.sideA)}
            remaining={match.remainingA}
            active={inLeg && throwing === "a"}
          />
          <SidePanel
            label={wilayahName(match.sideB.wilayahId)}
            players={sideLine(match.sideB)}
            remaining={match.remainingB}
            active={inLeg && throwing === "b"}
          />
        </div>

        {inLeg && (
          <div className="px-4 py-6 sm:px-6">
            <p className="mb-4 text-center text-sm text-[var(--muted)]">
              {throwing === "a" ? wilayahName(match.sideA.wilayahId) : wilayahName(match.sideB.wilayahId)} to throw
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_VISIT_SCORES.map((score) => (
                <button
                  key={score}
                  type="button"
                  disabled={busy}
                  onClick={() => void onVisit(score)}
                  className="min-w-[3.5rem] rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-3 text-lg font-semibold tabular hover:border-[var(--lime)] disabled:opacity-40"
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-3">
              <input
                inputMode="numeric"
                aria-label="Custom visit score"
                disabled={busy}
                value={customScore}
                onChange={(event) => setCustomScore(event.target.value.replace(/[^\d]/g, "").slice(0, 3))}
                placeholder="Score"
                className="h-12 w-24 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-center text-xl font-semibold tabular outline-none focus:border-[var(--lime)] disabled:opacity-40"
              />
              <button
                type="button"
                disabled={busy || customScore === ""}
                onClick={() => void onVisit(Number(customScore))}
                className={busy || customScore === "" ? disabledButtonClass : primaryButtonClass}
              >
                Add visit
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {message && <p className="text-sm text-[var(--lime)]">{message}</p>}
          {locked && <p className="text-sm text-[var(--muted)]">Match locked.</p>}
          {!locked && !inLeg && analysis.winner && (
            <p className="text-sm text-[var(--muted)]">Match won — confirm complete.</p>
          )}
        </div>
        {canComplete && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void onComplete()}
            className={busy ? disabledButtonClass : ghostButtonClass}
          >
            Complete match
          </button>
        )}
      </div>
    </div>
  );
}

function SidePanel({
  label,
  players,
  remaining,
  active,
}: {
  label: string;
  players: string;
  remaining: number;
  active: boolean;
}) {
  return (
    <div className={`min-w-0 px-2 py-2 ${active ? "rounded-2xl bg-[var(--live-bg)]" : ""}`}>
      <p className="font-medium">{label}</p>
      <p className="mt-1 truncate text-sm text-[var(--muted)]">{players}</p>
      <p className={`tabular mt-3 text-3xl font-semibold ${active ? "text-[var(--lime)]" : ""}`}>{remaining}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">remaining</p>
    </div>
  );
}
