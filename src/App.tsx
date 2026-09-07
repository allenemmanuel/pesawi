import { useEffect, useRef, useState } from "react";
import { SPORTS, type Sport } from "./data";
import MainBanner from "./MainBanner";
import MainStandings from "./MainStandings";
import { BadmintonProvider, useBadminton } from "./badminton/store";
import ScorerLogin from "./badminton/ScorerLogin";
import LiveBadminton from "./badminton/LiveBadminton";
import ProjectionBoard from "./badminton/ProjectionBoard";
import FutsalProjectionBoard from "./futsal/ProjectionBoard";
import LiveFutsal from "./futsal/LiveFutsal";
import { FutsalProvider } from "./futsal/store";
import LivePentanque from "./pentanque/LivePentanque";
import PentanqueProjectionBoard from "./pentanque/ProjectionBoard";
import { PentanqueProvider } from "./pentanque/store";
import LiveKarom from "./karom/LiveKarom";
import KaromProjectionBoard from "./karom/ProjectionBoard";
import { KaromProvider } from "./karom/store";
import LivePingPong from "./pingpong/LivePingPong";
import PingPongProjectionBoard from "./pingpong/ProjectionBoard";
import { PingPongProvider } from "./pingpong/store";
import LivePickleball from "./pickleball/LivePickleball";
import PickleballProjectionBoard from "./pickleball/ProjectionBoard";
import { PickleballProvider } from "./pickleball/store";
import LiveTakraw from "./takraw/LiveTakraw";
import TakrawProjectionBoard from "./takraw/ProjectionBoard";
import { TakrawProvider } from "./takraw/store";
import LiveDart from "./dart/LiveDart";
import DartProjectionBoard from "./dart/ProjectionBoard";
import { DartProvider } from "./dart/store";
import LiveBolaTampar from "./bolatampar/LiveBolaTampar";
import BolaTamparProjectionBoard from "./bolatampar/ProjectionBoard";
import { BolaTamparProvider } from "./bolatampar/store";
import SportPicker from "./scorer/SportPicker";
import { EventFooter, SportMascot } from "./brand";
import { MainIcon, MedalTableIcon } from "./icons";
import { SessionProvider, useSession } from "./session";
import { SPORT_SCORER_HASH } from "./SportLiveBoard";
import "./main-landing.css";

type View = "home" | "pingat" | Sport;

const TOP_TABS: { id: View; label: string }[] = [
  { id: "home", label: "Utama" },
  { id: "pingat", label: "Pingat" },
  ...SPORTS.map((sport) => ({
    id: sport as View,
    label:
      sport === "Sepak Takraw"
        ? "Takraw"
        : sport === "Bola Tampar"
          ? "Tampar"
          : sport === "Ping Pong"
            ? "P.Pong"
            : sport,
  })),
];

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

export default function App() {
  return (
    <SessionProvider>
      <BadmintonProvider>
        <FutsalProvider>
          <PentanqueProvider>
            <KaromProvider>
              <PingPongProvider>
                <PickleballProvider>
                  <TakrawProvider>
                    <DartProvider>
                      <BolaTamparProvider>
                        <AppShell />
                      </BolaTamparProvider>
                    </DartProvider>
                  </TakrawProvider>
                </PickleballProvider>
              </PingPongProvider>
            </KaromProvider>
          </PentanqueProvider>
        </FutsalProvider>
      </BadmintonProvider>
    </SessionProvider>
  );
}

function scorerSport(
  hash: string,
): "picker" | "medals" | "badminton" | "futsal" | "pentanque" | "karom" | "pingpong" | "pickleball" | "takraw" | "dart" | "bolatampar" {
  if (hash.startsWith("#/scorer/medals")) return "medals";
  if (hash.startsWith("#/scorer/futsal")) return "futsal";
  if (hash.startsWith("#/scorer/pentanque")) return "pentanque";
  if (hash.startsWith("#/scorer/karom")) return "karom";
  if (hash.startsWith("#/scorer/pingpong")) return "pingpong";
  if (hash.startsWith("#/scorer/pickleball")) return "pickleball";
  if (hash.startsWith("#/scorer/takraw")) return "takraw";
  if (hash.startsWith("#/scorer/dart")) return "dart";
  if (hash.startsWith("#/scorer/bolatampar")) return "bolatampar";
  if (hash.startsWith("#/scorer/badminton")) return "badminton";
  return "picker";
}

const SCORER_TO_VIEW: Record<
  Exclude<ReturnType<typeof scorerSport>, "picker" | "medals">,
  Sport
> = {
  futsal: "Futsal",
  pentanque: "Pentanque",
  karom: "Karom",
  pingpong: "Ping Pong",
  pickleball: "Pickleball",
  badminton: "Badminton",
  takraw: "Sepak Takraw",
  dart: "Dart",
  bolatampar: "Bola Tampar",
};

function adminHashForView(view: View) {
  if (view === "home") return "/scorer";
  if (view === "pingat") return "/scorer/medals";
  return SPORT_SCORER_HASH[view];
}

function AdminControl({ view }: { view: View }) {
  const { court, logout } = useSession();

  if (court) {
    return (
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="hidden text-xs text-[var(--muted)] sm:inline">Editing {court.name}</span>
        <button
          type="button"
          onClick={() => {
            void logout();
          }}
          className="text-sm text-[var(--muted)] hover:text-[var(--gold)]"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        window.location.hash = adminHashForView(view);
      }}
      className="text-sm font-medium tracking-wide text-[var(--muted)] hover:text-[var(--gold)]"
    >
      Admin
    </button>
  );
}

function AppShell() {
  const [view, setView] = useState<View>("home");
  const mainRef = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const hash = useHash();
  const { court } = useBadminton();
  const scorer = hash.startsWith("#/scorer");
  const project = hash.startsWith("#/project");
  const scorerKind = scorerSport(hash);

  function selectView(next: View) {
    setView(next);
    mainRef.current?.scrollTo({ top: 0 });
  }

  function goHome() {
    setView("home");
    window.setTimeout(() => {
      mainRef.current?.scrollTo({ top: 0 });
    }, 50);
  }

  useEffect(() => {
    document.documentElement.dataset.theme = "dark";
  }, []);

  // After court login on a sport/medals scorer route, return to the live table.
  useEffect(() => {
    if (!scorer || !court) return;
    if (scorerKind === "picker") return;
    if (scorerKind === "medals") {
      setView("pingat");
      window.location.hash = "";
      return;
    }
    const next = SCORER_TO_VIEW[scorerKind];
    setView(next);
    window.location.hash = "";
  }, [scorer, court, scorerKind]);

  useEffect(() => {
    document.title = project
      ? "PESAWI — Live"
      : scorer
        ? "PESAWI — Court scorer"
        : view === "home"
          ? "PESAWI Ke-13, 2026"
          : view === "pingat"
            ? "PESAWI — Kedudukan Pingat"
            : `PESAWI — ${view}`;
  }, [view, scorer, project]);

  useEffect(() => {
    const row = tabsRef.current;
    if (!row) return;
    const active = row.querySelector<HTMLElement>("[data-active='true']");
    active?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [view]);

  if (project) {
    if (hash.startsWith("#/project/futsal")) return <FutsalProjectionBoard />;
    if (hash.startsWith("#/project/pentanque")) return <PentanqueProjectionBoard />;
    if (hash.startsWith("#/project/karom")) return <KaromProjectionBoard />;
    if (hash.startsWith("#/project/pingpong")) return <PingPongProjectionBoard />;
    if (hash.startsWith("#/project/pickleball")) return <PickleballProjectionBoard />;
    if (hash.startsWith("#/project/takraw")) return <TakrawProjectionBoard />;
    if (hash.startsWith("#/project/dart")) return <DartProjectionBoard />;
    if (hash.startsWith("#/project/bolatampar")) return <BolaTamparProjectionBoard />;
    return <ProjectionBoard />;
  }

  if (scorer) {
    const sport = scorerKind;
    return (
      <div className="min-h-[100dvh] bg-[var(--bg)] text-[var(--text)] app-shell">
        <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col px-4 pb-8 pt-4">
          <header className="mb-5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src="/landing/logo-pesawi.png"
                alt=""
                className="h-8 w-auto object-contain"
                draggable={false}
              />
              <button
                type="button"
                onClick={() => {
                  window.location.hash = "";
                  selectView("home");
                }}
                className="text-sm text-[var(--muted)] hover:text-[var(--gold)]"
              >
                Laman utama
              </button>
            </div>
          </header>
          <div className="flex-1">
            {!court ? (
              <ScorerLogin />
            ) : sport === "picker" ? (
              <SportPicker />
            ) : (
              <p className="text-sm text-[var(--muted)]">Returning to live table…</p>
            )}
          </div>
          {court ? <EventFooter className="mt-10" /> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="site-app flex min-h-[100dvh] flex-col" data-theme="dark">
      {/* Phone only: sticky brand + sport chips */}
      <header className="mobile-chrome sticky top-0 z-30 shrink-0 md:hidden">
        <div className="relative flex h-12 items-center justify-center px-3">
          <button
            type="button"
            className="brand-lockup"
            onClick={() => selectView("home")}
            aria-label="PESAWI laman utama"
          >
            <img src="/landing/logo-ysg.png" alt="" className="brand-ysg brand-ysg--sm" />
            <img src="/landing/logo-pesawi.png" alt="PESAWI" className="brand-pesawi brand-pesawi--sm" />
          </button>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AdminControl view={view} />
          </div>
        </div>

        <div
          ref={tabsRef}
          className="chip-row top-tabs flex gap-2 overflow-x-auto px-3 pb-2.5 pt-0.5"
          role="tablist"
          aria-label="Navigasi pantas"
        >
          {TOP_TABS.map((item) => {
            const active = item.id === view;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                data-active={active ? "true" : "false"}
                onClick={() => selectView(item.id)}
                className={`top-tab flex shrink-0 items-center gap-1.5 whitespace-nowrap ${active ? "is-active" : ""}`}
              >
                {item.id === "home" ? (
                  <MainIcon className="h-4 w-4 shrink-0" />
                ) : item.id === "pingat" ? (
                  <MedalTableIcon className="h-4 w-4 shrink-0" />
                ) : (
                  <SportMascot sport={item.id} className="h-5 w-5 shrink-0" />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Desktop site header */}
      <div className="hidden md:block">
        <SiteHeader
          view={view}
          onHome={() => goHome()}
          onSelectSport={(sport) => selectView(sport)}
          onPingat={() => selectView("pingat")}
        />
      </div>

      <main ref={mainRef} className="grid min-h-0 flex-1 grid-rows-[1fr] overflow-y-auto">
        {view === "home" ? (
          <MainBanner />
        ) : view === "pingat" ? (
          <div className="arena-page">
            <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
              <MainStandings />
            </div>
          </div>
        ) : (
          <LiveView sport={view} />
        )}
      </main>
    </div>
  );
}

function LiveView({ sport }: { sport: Sport }) {
  if (sport === "Badminton") return <LiveBadminton />;
  if (sport === "Futsal") return <LiveFutsal />;
  if (sport === "Pentanque") return <LivePentanque />;
  if (sport === "Karom") return <LiveKarom />;
  if (sport === "Ping Pong") return <LivePingPong />;
  if (sport === "Pickleball") return <LivePickleball />;
  if (sport === "Sepak Takraw") return <LiveTakraw />;
  if (sport === "Dart") return <LiveDart />;
  if (sport === "Bola Tampar") return <LiveBolaTampar />;
  return null;
}

function SiteHeader({
  view,
  onHome,
  onSelectSport,
  onPingat,
}: {
  view: View;
  onHome: () => void;
  onSelectSport: (sport: Sport) => void;
  onPingat: () => void;
}) {
  const [sukanOpen, setSukanOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sukanOpen) return;
    function close(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSukanOpen(false);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [sukanOpen]);

  return (
    <header className="site-header site-header--flow">
      <button type="button" className="brand-lockup" onClick={onHome} aria-label="PESAWI laman utama">
        <img src="/landing/logo-ysg.png" alt="Yayasan Sabah" className="brand-ysg" />
        <img src="/landing/logo-pesawi.png" alt="PESAWI" className="brand-pesawi" />
      </button>
      <nav className="site-nav" aria-label="Navigasi utama">
        <button type="button" onClick={onHome}>
          Utama
        </button>
        <div className="site-nav-dropdown" ref={dropdownRef}>
          <button
            type="button"
            className="site-nav-dropdown-trigger"
            aria-expanded={sukanOpen}
            aria-haspopup="true"
            onClick={() => setSukanOpen((open) => !open)}
          >
            Sukan
            <span className="site-nav-caret" aria-hidden />
          </button>
          {sukanOpen ? (
            <div className="site-nav-dropdown-menu" role="menu">
              {SPORTS.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  role="menuitem"
                  className="site-nav-dropdown-item"
                  onClick={() => {
                    setSukanOpen(false);
                    onSelectSport(sport);
                  }}
                >
                  <SportMascot sport={sport} className="h-5 w-5 shrink-0" />
                  <span>{sport}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <button type="button" onClick={onPingat}>
          Pingat
        </button>
      </nav>
      <div className="site-header-actions justify-self-end">
        <AdminControl view={view} />
      </div>
    </header>
  );
}
