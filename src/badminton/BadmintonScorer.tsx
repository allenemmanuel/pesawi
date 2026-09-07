import { useMemo, useState } from "react";
import NewMatchForm from "./NewMatchForm";
import ScoreSheet from "./ScoreSheet";
import ScorerLogin from "./ScorerLogin";
import { EventFilters, type CategoryFilter, type DisciplineFilter } from "./EventFilters";
import { gamesWon } from "./rules";
import { useBadminton } from "./store";
import {
  CATEGORY_LABEL,
  formatGames,
  pairLine,
  wilayahName,
  type BadmintonMatch,
} from "./types";
import { ghostButtonClass, primaryButtonClass } from "./ui";

type View = { page: "list" } | { page: "new" } | { page: "sheet"; id: string };

function statusLabel(match: BadmintonMatch): string {
  if (match.status === "scheduled") return "Scheduled";
  if (match.status === "complete") return "Final";
  return "Live";
}

export default function BadmintonScorer() {
  const { matches, court, logout } = useBadminton();
  const [view, setView] = useState<View>({ page: "list" });
  const [discipline, setDiscipline] = useState<DisciplineFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");

  const rows = useMemo(
    () =>
      matches.filter((match) => {
        if (!court) return false;
        if (match.courtId !== court.id) return false;
        if (discipline !== "all" && match.discipline !== discipline) return false;
        if (category !== "all" && match.category !== category) return false;
        return true;
      }),
    [matches, court, discipline, category],
  );

  if (!court) {
    return <ScorerLogin />;
  }

  if (view.page === "new") {
    return (
      <NewMatchForm
        onCancel={() => setView({ page: "list" })}
        onCreated={(id) => setView({ page: "sheet", id })}
      />
    );
  }

  if (view.page === "sheet") {
    return (
      <ScoreSheet
        key={view.id}
        matchId={view.id}
        onBack={() => setView({ page: "list" })}
      />
    );
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--lime)]">{court.name}</p>
          <h1 className="text-xl font-semibold">Court scorer</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => {
              window.location.hash = "/scorer";
            }}
            className="text-sm text-[var(--muted)]"
          >
            Sports
          </button>
          <button
            type="button"
            onClick={() => {
              void logout();
            }}
            className="text-sm text-[var(--muted)]"
          >
            Sign out
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setView({ page: "new" })}
        className={`${primaryButtonClass} mb-6 h-12 w-full`}
      >
        New match
      </button>

      <EventFilters
        discipline={discipline}
        category={category}
        onDiscipline={setDiscipline}
        onCategory={setCategory}
      />

      {rows.length === 0 ? (
        <p className="rounded-2xl bg-[var(--surface)] px-5 py-12 text-center text-[var(--muted)]">
          No matches on {court.name} yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((match) => {
            const won = gamesWon(match.games);
            return (
              <li key={match.id}>
                <button
                  type="button"
                  onClick={() => setView({ page: "sheet", id: match.id })}
                  className="flex w-full flex-col gap-2 rounded-2xl bg-[var(--surface)] px-5 py-4 text-left"
                >
                  <span className="text-sm text-[var(--muted)]">
                    {match.discipline} · {CATEGORY_LABEL[match.category]}
                  </span>
                  <span className="font-medium">
                    {wilayahName(match.sideA.wilayahId)} vs {wilayahName(match.sideB.wilayahId)}
                  </span>
                  <span className="text-sm text-[var(--muted)]">
                    {pairLine(match.sideA)} · {pairLine(match.sideB)}
                  </span>
                  <span className="flex items-center justify-between gap-3">
                    <span className="tabular text-[var(--lime)]">
                      {match.games.length > 0 ? `${won.a}–${won.b} · ${formatGames(match.games)}` : "Not started"}
                    </span>
                    <span className={`${ghostButtonClass} px-3 py-1 text-xs`}>{statusLabel(match)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
