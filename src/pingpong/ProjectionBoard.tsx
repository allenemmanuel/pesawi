import { useEffect, useMemo, useState } from "react";
import { ProjectionShell } from "../brand";
import { gamesWon } from "./rules";
import { usePingPong } from "./store";
import { formatGames, sideLine, wilayahName, type PingPongMatch } from "./types";

function lastGame(match: PingPongMatch) {
  return match.games[match.games.length - 1] ?? null;
}

function tableOrder(match: PingPongMatch) {
  return match.tableId ?? match.table ?? "";
}

export default function ProjectionBoard() {
  const { matches } = usePingPong();
  const [idle, setIdle] = useState(false);

  const live = useMemo(
    () =>
      matches
        .filter((match) => match.status === "live")
        .sort((a, b) => tableOrder(a).localeCompare(tableOrder(b))),
    [matches],
  );

  useEffect(() => {
    let timer = window.setTimeout(() => setIdle(true), 2500);
    const wake = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), 2500);
    };
    window.addEventListener("mousemove", wake);
    window.addEventListener("keydown", wake);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("keydown", wake);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") exitProjection();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const many = live.length > 1;

  return (
    <ProjectionShell subtitle="Live ping pong" idle={idle} onExit={exitProjection}>

      {live.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-2xl text-[var(--muted)]">
          Menunggu perlawanan LIVE
        </div>
      ) : (
        <div className={`grid flex-1 gap-5 px-6 pb-6 ${many ? "grid-cols-2" : "grid-cols-1"}`}>
          {live.map((match) => (
            <ProjectionCard key={match.id} match={match} large={!many} />
          ))}
        </div>
      )}
    </ProjectionShell>
  );
}

function ProjectionCard({ match, large }: { match: PingPongMatch; large: boolean }) {
  const won = gamesWon(match.games);
  const current = lastGame(match);

  return (
    <section className="flex min-h-0 flex-col justify-center rounded-[28px] bg-[var(--surface)] px-8 py-8">
      <p className={`text-center text-[var(--muted)] ${large ? "text-xl" : "text-base"}`}>
        {match.table} · {match.discipline}
      </p>
      <div className="mt-6 grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div className="min-w-0 text-center sm:text-right">
          <p className={`text-[var(--muted)] ${large ? "text-lg" : "text-sm"}`}>{wilayahName(match.sideA.wilayahId)}</p>
          <p className={`font-medium ${large ? "text-3xl" : "text-xl"}`}>{sideLine(match.sideA)}</p>
        </div>
        <div className="text-center">
          <p
            className={`tabular font-semibold tracking-tight ${
              large ? "text-[clamp(4.5rem,10vw,8rem)]" : "text-[clamp(2.5rem,6vw,5rem)]"
            }`}
          >
            {current ? `${current.a} — ${current.b}` : "0 — 0"}
          </p>
          <p className={`tabular mt-2 text-[var(--muted)] ${large ? "text-xl" : "text-sm"}`}>
            Games {won.a}–{won.b}
          </p>
          <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--live-bg)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--lime)]">
            <span className="live-dot" />
            LIVE
          </span>
        </div>
        <div className="min-w-0 text-center sm:text-left">
          <p className={`text-[var(--muted)] ${large ? "text-lg" : "text-sm"}`}>{wilayahName(match.sideB.wilayahId)}</p>
          <p className={`font-medium ${large ? "text-3xl" : "text-xl"}`}>{sideLine(match.sideB)}</p>
        </div>
      </div>
      <p className={`tabular mt-8 text-center text-[var(--lime)] ${large ? "text-3xl" : "text-xl"}`}>
        {formatGames(match.games) || "0–0"}
      </p>
    </section>
  );
}

export async function enterProjection() {
  window.location.hash = "/project/pingpong";
  try {
    await document.documentElement.requestFullscreen();
  } catch {
    // Browser may block if the display already covers the screen.
  }
}

export function exitProjection() {
  if (document.fullscreenElement) {
    void document.exitFullscreen();
  }
  window.location.hash = "";
}
