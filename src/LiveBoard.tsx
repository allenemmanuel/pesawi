import { useMemo } from "react";
import { MATCHES, type Sport } from "./data";
import { SportIcon } from "./icons";

function formatScore(home: number, away: number) {
  return `${home} — ${away}`;
}

function TeamMark({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] text-sm font-semibold text-[var(--text)]">
      {initial}
    </span>
  );
}

type LiveBoardProps = {
  sport: Sport;
  onSelectSport: (sport: Sport) => void;
};

export default function LiveBoard({ sport, onSelectSport }: LiveBoardProps) {
  const featured = useMemo(
    () => MATCHES.find((match) => match.sport === sport && match.live) ?? MATCHES.find((match) => match.sport === sport),
    [sport],
  );

  const others = useMemo(
    () => MATCHES.filter((match) => match.id !== featured?.id && match.live),
    [featured],
  );

  return (
    <>
      {!featured ? (
        <p className="rounded-[28px] bg-[var(--surface)] px-5 py-16 text-center text-[var(--muted)]">
          Tiada perlawanan.
        </p>
      ) : (
        <>
          <section className="mb-4 rounded-[28px] bg-[var(--surface)] px-4 py-8 sm:px-10 sm:py-10">
            <p className="mb-8 text-center text-sm text-[var(--muted)]">
              {featured.venue} · {featured.sport}
            </p>
            <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto_1fr]">
              <div className="flex items-center justify-center gap-3 sm:justify-end">
                <TeamMark name={featured.home} />
                <p className="text-lg font-medium sm:text-xl">{featured.home}</p>
              </div>
              <div className="text-center">
                <p className="tabular text-5xl font-semibold tracking-tight sm:text-6xl">
                  {formatScore(featured.homeScore, featured.awayScore)}
                </p>
                {featured.live && (
                  <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--live-bg)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--lime)]">
                    <span className="live-dot" />
                    LIVE
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center gap-3 sm:justify-start">
                <p className="text-lg font-medium sm:text-xl">{featured.away}</p>
                <TeamMark name={featured.away} />
              </div>
            </div>
          </section>

          <ul className="space-y-3">
            {others.map((match) => (
              <li key={match.id}>
                <button
                  type="button"
                  onClick={() => onSelectSport(match.sport)}
                  className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 rounded-2xl bg-[var(--surface)] px-4 py-4 text-left transition-colors hover:bg-[var(--surface-hover)] sm:grid-cols-[auto_minmax(9rem,12rem)_1fr_auto_1fr] sm:px-5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--live-bg)] text-[var(--lime)]">
                    <SportIcon sport={match.sport} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{match.sport}</span>
                    <span className="block truncate text-sm text-[var(--muted)] sm:hidden">
                      {match.home} vs {match.away}
                    </span>
                  </span>
                  <span className="hidden min-w-0 truncate text-sm sm:block">{match.home}</span>
                  <span className="tabular shrink-0 text-lg font-semibold text-[var(--lime)]">
                    {match.homeScore}-{match.awayScore}
                  </span>
                  <span className="col-start-3 hidden min-w-0 truncate text-right text-sm sm:col-auto sm:block">
                    {match.away}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
