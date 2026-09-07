import { useMemo, useState } from "react";
import { useBadminton } from "../badminton/store";
import ScorerLogin from "../badminton/ScorerLogin";
import { ghostButtonClass, primaryButtonClass } from "../badminton/ui";
import { EventFilters, type DisciplineFilter } from "./EventFilters";
import NewMatchForm from "./NewMatchForm";
import ScoreSheet from "./ScoreSheet";
import { gamesWon } from "./rules";
import { usePingPong } from "./store";
import { formatGames, sideLine, tableNameFromCourt, wilayahName, type PingPongMatch } from "./types";

type View = { page: "list" } | { page: "new" } | { page: "sheet"; id: string };

function statusLabel(match: PingPongMatch): string {
  if (match.status === "scheduled") return "Scheduled";
  if (match.status === "complete") return "Final";
  return "Live";
}

export default function PingPongScorer() {
  const { matches } = usePingPong();
  const { court, logout } = useBadminton();
  const [view, setView] = useState<View>({ page: "list" });
  const [discipline, setDiscipline] = useState<DisciplineFilter>("all");

  const rows = useMemo(
    () =>
      matches.filter((match) => {
        if (!court) return false;
        if (match.tableId !== court.id) return false;
        if (discipline !== "all" && match.discipline !== discipline) return false;
        return true;
      }),
    [matches, court, discipline],
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
    return <ScoreSheet key={view.id} matchId={view.id} onBack={() => setView({ page: "list" })} />;
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--lime)]">{tableNameFromCourt(court.name)}</p>
          <h1 className="text-xl font-semibold">Ping Pong scorer</h1>
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

      <EventFilters discipline={discipline} onDiscipline={setDiscipline} />

      {rows.length === 0 ? (
        <p className="rounded-2xl bg-[var(--surface)] px-5 py-12 text-center text-[var(--muted)]">
          No ping pong matches on {tableNameFromCourt(court.name)} yet.
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
                  <span className="text-sm text-[var(--muted)]">{match.discipline}</span>
                  <span className="font-medium">
                    {wilayahName(match.sideA.wilayahId)} vs {wilayahName(match.sideB.wilayahId)}
                  </span>
                  <span className="truncate text-sm text-[var(--muted)]">
                    {sideLine(match.sideA)} vs {sideLine(match.sideB)}
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
