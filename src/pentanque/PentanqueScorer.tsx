import { useMemo, useState } from "react";
import { useBadminton } from "../badminton/store";
import ScorerLogin from "../badminton/ScorerLogin";
import { ghostButtonClass, primaryButtonClass } from "../badminton/ui";
import { EventFilters, matchFitsFilters, type FormatChip, type GenderChip } from "./EventFilters";
import NewMatchForm from "./NewMatchForm";
import ScoreSheet from "./ScoreSheet";
import { usePentanque } from "./store";
import { laneNameFromCourt, sideLine, wilayahName, type PentanqueMatch } from "./types";

type View = { page: "list" } | { page: "new" } | { page: "sheet"; id: string };

function statusLabel(match: PentanqueMatch): string {
  if (match.status === "scheduled") return "Scheduled";
  if (match.status === "complete") return "Final";
  return "Live";
}

export default function PentanqueScorer() {
  const { matches } = usePentanque();
  const { court, logout } = useBadminton();
  const [view, setView] = useState<View>({ page: "list" });
  const [gender, setGender] = useState<GenderChip>("all");
  const [format, setFormat] = useState<FormatChip>("all");

  const rows = useMemo(
    () =>
      matches.filter((match) => {
        if (!court) return false;
        if (match.laneId !== court.id) return false;
        return matchFitsFilters(match, gender, format);
      }),
    [matches, court, gender, format],
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
          <p className="text-sm text-[var(--lime)]">{laneNameFromCourt(court.name)}</p>
          <h1 className="text-xl font-semibold">Pentanque scorer</h1>
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

      <EventFilters gender={gender} format={format} onGender={setGender} onFormat={setFormat} />

      {rows.length === 0 ? (
        <p className="rounded-2xl bg-[var(--surface)] px-5 py-12 text-center text-[var(--muted)]">
          No pentanque matches on {laneNameFromCourt(court.name)} yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((match) => (
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
                    {match.pointsA}–{match.pointsB}
                  </span>
                  <span className={`${ghostButtonClass} px-3 py-1 text-xs`}>{statusLabel(match)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
