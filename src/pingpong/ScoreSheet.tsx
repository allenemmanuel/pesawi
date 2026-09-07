import { useEffect, useMemo, useState } from "react";
import { disabledButtonClass, ghostButtonClass, primaryButtonClass } from "../badminton/ui";
import {
  GAMES_TO_WIN_MATCH,
  MAX_GAMES,
  MUST_WIN_BY,
  POINTS_TO_WIN_GAME,
  analyzeGames,
  gameSlotEnabled,
  slotsToGames,
} from "./rules";
import { usePingPong } from "./store";
import { sheetHeader, sideLine, wilayahName } from "./types";

type Props = {
  matchId: string;
  onBack: () => void;
};

type Slot = { a: string; b: string };

const SLOT_INDEXES = Array.from({ length: MAX_GAMES }, (_, index) => index);

function gamesToSlots(games: { a: number; b: number }[]): Slot[] {
  return SLOT_INDEXES.map((index) => {
    const game = games[index];
    return game ? { a: String(game.a), b: String(game.b) } : { a: "", b: "" };
  });
}

export default function ScoreSheet({ matchId, onBack }: Props) {
  const { getMatch, saveGames, completeMatch } = usePingPong();
  const match = getMatch(matchId);
  const [slots, setSlots] = useState<Slot[]>(() => gamesToSlots(match?.games ?? []));
  const [message, setMessage] = useState("");

  const parsed = useMemo(() => slotsToGames(slots), [slots]);
  const analysis = parsed.error ? null : analyzeGames(parsed.games);

  useEffect(() => {
    if (parsed.error) return;
    setSlots((prev) => {
      const next = prev.map((slot, index) => {
        if (gameSlotEnabled(index, parsed.games)) return slot;
        if (!slot.a && !slot.b) return slot;
        return { a: "", b: "" };
      });
      return next.some((slot, index) => slot.a !== prev[index].a || slot.b !== prev[index].b) ? next : prev;
    });
  }, [parsed.error, parsed.games]);

  const locked = match?.status === "complete";
  const canSave = Boolean(match) && !locked && !parsed.error && (analysis?.canSave ?? false);
  const canComplete = !locked && !parsed.error && (analysis?.canComplete ?? false);
  const gamesKey = JSON.stringify(parsed.games);
  const savedKey = JSON.stringify(match?.games ?? []);

  useEffect(() => {
    if (!match || !canSave || locked || parsed.error || gamesKey === savedKey) return;
    const timer = window.setTimeout(() => {
      void saveGames(matchId, parsed.games).then((result) => {
        if (!result.ok) setMessage(result.error);
        else setMessage("Live board updated.");
      });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [match, canSave, locked, parsed.error, parsed.games, gamesKey, savedKey, matchId, saveGames]);

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

  const issues = parsed.error ? [parsed.error] : (analysis?.issues ?? []);

  function setScore(gameIndex: number, side: "a" | "b", value: string) {
    setMessage("");
    setSlots((prev) =>
      prev.map((slot, index) => (index === gameIndex ? { ...slot, [side]: value } : slot)),
    );
  }

  async function onSave() {
    if (parsed.error) {
      setMessage(parsed.error);
      return;
    }
    const result = await saveGames(matchId, parsed.games);
    setMessage(result.ok ? "Saved. Live board updated." : result.error);
  }

  async function onComplete() {
    if (parsed.error) {
      setMessage(parsed.error);
      return;
    }
    const result = await completeMatch(matchId, parsed.games);
    setMessage(result.ok ? "Match complete." : result.error);
  }

  function hint() {
    if (locked) return "Match locked.";
    if (analysis?.canComplete) return "Ready to complete.";
    if (analysis?.inProgressIndex != null) {
      return `Game ${(analysis.inProgressIndex ?? 0) + 1} is in progress. First to ${POINTS_TO_WIN_GAME}, win by ${MUST_WIN_BY}. Complete when one side has ${GAMES_TO_WIN_MATCH} games.`;
    }
    return `First to ${POINTS_TO_WIN_GAME}, win by ${MUST_WIN_BY}. Complete when one side has ${GAMES_TO_WIN_MATCH} games.`;
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
        <span className="w-12" />
      </div>

      <div className="overflow-hidden rounded-[28px] bg-[var(--surface)]">
        <div className="grid grid-cols-[5rem_1fr_1fr] border-b border-[var(--line)] px-4 py-4 text-center text-sm text-[var(--muted)] sm:grid-cols-[7rem_1fr_1fr] sm:px-6">
          <span />
          <span>
            <span className="block font-medium text-[var(--text)]">{wilayahName(match.sideA.wilayahId)}</span>
            <span>{sideLine(match.sideA)}</span>
          </span>
          <span>
            <span className="block font-medium text-[var(--text)]">{wilayahName(match.sideB.wilayahId)}</span>
            <span>{sideLine(match.sideB)}</span>
          </span>
        </div>

        {SLOT_INDEXES.map((index) => {
          const disabled = locked || !gameSlotEnabled(index, parsed.error ? [] : parsed.games);
          return (
            <div
              key={index}
              className="grid grid-cols-[5rem_1fr_1fr] items-center border-b border-[var(--line)] px-4 py-4 last:border-b-0 sm:grid-cols-[7rem_1fr_1fr] sm:px-6"
            >
              <p className="text-sm text-[var(--muted)]">Game {index + 1}</p>
              <ScoreInput
                value={slots[index]?.a ?? ""}
                disabled={disabled}
                onChange={(value) => setScore(index, "a", value)}
                ariaLabel={`Game ${index + 1} side A`}
              />
              <ScoreInput
                value={slots[index]?.b ?? ""}
                disabled={disabled}
                onChange={(value) => setScore(index, "b", value)}
                ariaLabel={`Game ${index + 1} side B`}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="tabular text-lg font-semibold">
            {analysis ? `${analysis.gamesWonA} — ${analysis.gamesWonB}` : "—"}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">Games won</p>
          {issues.length > 0 ? (
            <p className="mt-2 text-sm text-[var(--jumlah)]">{issues[0]}</p>
          ) : (
            <p className="mt-2 text-sm text-[var(--muted)]">{hint()}</p>
          )}
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
      onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, "").slice(0, 3))}
      className="mx-auto h-16 w-24 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-center text-3xl font-semibold tabular outline-none focus:border-[var(--lime)] disabled:opacity-40"
    />
  );
}
