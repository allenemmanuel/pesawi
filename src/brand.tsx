import type { ReactNode } from "react";
import type { Sport } from "./data";

export const BRAND = {
  crest: "/brand/crest.webp",
  wordmark: "/brand/wordmark.webp",
  ysg: "/brand/ysg.webp",
  bg: "/brand/bg.webp",
  bgHero: "/brand/bg-hero.webp",
  logoPesawi: "/landing/logo-pesawi.png",
  logoYsg: "/landing/logo-ysg.png",
} as const;

export const EVENT = {
  name: "Pesta Sukan Antara Wilayah",
  short: "PESAWI Ke-13",
  year: "2026",
  dates: "2–6 Oktober 2026",
  venue: "Kompleks Sukan Tun Adnan, Yayasan Sabah",
  slogan: "Bersahabat Dengan Hormat, Bersaing Dengan Semangat",
} as const;

const SPORT_SLUG: Record<Sport, string> = {
  Futsal: "futsal",
  Pentanque: "pentanque",
  Karom: "karom",
  "Ping Pong": "pingpong",
  Pickleball: "pickleball",
  Badminton: "badminton",
  "Sepak Takraw": "takraw",
  Dart: "dart",
  "Bola Tampar": "bolatampar",
};

export function sportMascotSrc(sport: Sport): string {
  return `/brand/sport-${SPORT_SLUG[sport]}.webp`;
}

export function SportMascot({
  sport,
  className = "h-10 w-10",
  alt,
}: {
  sport: Sport;
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src={sportMascotSrc(sport)}
      alt={alt ?? ""}
      className={`object-contain ${className}`}
      draggable={false}
    />
  );
}

export function BrandCrest({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <img src={BRAND.crest} alt="" className={`object-contain ${className}`} draggable={false} />
  );
}

export function BrandWordmark({ className = "h-8" }: { className?: string }) {
  return (
    <img
      src={BRAND.wordmark}
      alt="PESAWI Ke-13, 2026"
      className={`object-contain ${className}`}
      draggable={false}
    />
  );
}

export function BrandYsg({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <img
      src={BRAND.ysg}
      alt="Yayasan Sabah"
      className={`object-contain ${className}`}
      draggable={false}
    />
  );
}

/** YSG + PESAWI lockup for live / scorer chrome (8080 style). */
export function AppBrandBar({
  showYsg = true,
  className = "",
}: {
  showYsg?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 items-center gap-2.5 md:gap-3 ${className}`}>
      {showYsg ? (
        <img
          src={BRAND.logoYsg}
          alt="Yayasan Sabah"
          className="h-9 w-9 shrink-0 rounded-full object-cover md:h-10 md:w-10"
          draggable={false}
        />
      ) : null}
      <img
        src={BRAND.logoPesawi}
        alt="PESAWI"
        className="h-8 w-auto shrink-0 object-contain md:h-9"
        draggable={false}
      />
      <span className="font-display hidden text-xl tracking-[0.06em] text-[var(--text)] sm:inline">
        PESAWI
      </span>
    </div>
  );
}

/** Full-width event hero — crest, wordmark, dates, venue, slogan. */
export function EventBand({ className = "" }: { className?: string }) {
  return (
    <div className={`event-band overflow-hidden rounded-2xl border border-[var(--line)] ${className}`}>
      <div
        className="event-band-inner relative px-5 py-7 sm:px-8 sm:py-9"
        style={{
          backgroundImage: `linear-gradient(105deg, color-mix(in srgb, var(--bg) 82%, transparent) 0%, color-mix(in srgb, var(--bg) 55%, transparent) 55%, color-mix(in srgb, var(--bg) 70%, transparent) 100%), url(${BRAND.bgHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-[1] flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div className="flex min-w-0 items-start gap-4 sm:items-center sm:gap-5">
            <BrandCrest className="h-16 w-16 shrink-0 sm:h-[4.75rem] sm:w-[4.75rem]" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
                {EVENT.name}
              </p>
              <p className="font-display mt-1 text-2xl font-bold tracking-tight sm:text-3xl md:text-[2rem]">
                {EVENT.short}
                <span className="mx-2 font-normal text-[var(--muted)]">·</span>
                <span className="text-[var(--lime)]">{EVENT.year}</span>
              </p>
              <p className="mt-2 text-sm text-[var(--muted)] sm:text-[0.95rem]">
                {EVENT.dates}
              </p>
              <p className="mt-0.5 truncate text-sm text-[var(--text)]/90 sm:text-[0.95rem]">
                {EVENT.venue}
              </p>
            </div>
          </div>
          <div className="flex max-w-sm flex-col gap-3 sm:items-end sm:text-right">
            <BrandYsg className="h-10 w-10 opacity-90 sm:h-11 sm:w-11" />
            <p className="text-sm leading-relaxed text-[var(--muted)] sm:text-[0.95rem]">
              {EVENT.slogan}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** @deprecated Prefer EventBand — kept as alias for any lingering imports. */
export function EventStrip({ className = "" }: { className?: string }) {
  return <EventBand className={className} />;
}

export function EventFooter({
  className = "",
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "projection";
}) {
  const muted = tone === "projection" ? "text-white/55" : "text-[var(--muted)]";
  return (
    <footer className={`text-center text-xs leading-relaxed sm:text-sm ${muted} ${className}`}>
      <p>
        {EVENT.dates}
        <span className="mx-1.5 opacity-50">·</span>
        {EVENT.venue}
      </p>
      <p className="mt-1 opacity-80">{EVENT.slogan}</p>
    </footer>
  );
}

export function LiveSportHeader({
  sport,
  title,
  scorerHash,
}: {
  sport: Sport;
  title: string;
  scorerHash: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <SportMascot sport={sport} className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
        <div className="min-w-0">
          <h1 className="font-display truncate text-4xl tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-1 truncate text-xs text-[var(--muted)] sm:text-sm">
            {EVENT.short} · {EVENT.dates} · {EVENT.venue}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          window.location.hash = scorerHash;
        }}
        className="self-start text-sm text-[var(--muted)] hover:text-[var(--gold)] sm:self-auto"
      >
        Scorer
      </button>
    </div>
  );
}

export function ProjectionBrand({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex items-center gap-4">
      <img
        src={BRAND.logoPesawi}
        alt=""
        className="h-14 w-auto shrink-0 object-contain sm:h-16"
        draggable={false}
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <img
            src={BRAND.logoYsg}
            alt="Yayasan Sabah"
            className="h-8 w-8 rounded-full object-cover opacity-95"
            draggable={false}
          />
          <span className="font-display text-xl tracking-[0.06em] sm:text-2xl">PESAWI</span>
        </div>
        <p className="mt-1.5 text-xs tracking-[0.18em] text-[var(--gold)] sm:text-sm">
          PESAWI KE-13 · {EVENT.venue}
        </p>
        <h1 className="font-display mt-0.5 text-2xl tracking-tight sm:text-3xl">{subtitle}</h1>
      </div>
    </div>
  );
}

/** Full-bleed dark projector stage — all sport boards share this shell. */
export function ProjectionShell({
  subtitle,
  idle,
  onExit,
  children,
}: {
  subtitle: string;
  idle: boolean;
  onExit: () => void;
  children: ReactNode;
}) {
  return (
    <div
      data-theme="dark"
      className={`projection-shell flex min-h-[100dvh] flex-col text-[var(--text)] ${idle ? "cursor-none" : ""}`}
    >
      <header
        className={`relative z-[1] flex items-center justify-between px-6 py-5 transition-opacity duration-500 sm:px-8 ${
          idle ? "opacity-0" : "opacity-100"
        }`}
      >
        <ProjectionBrand subtitle={subtitle} />
        <button
          type="button"
          onClick={onExit}
          className="shrink-0 rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)]"
        >
          Exit · Esc
        </button>
      </header>

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">{children}</div>

      <div
        className={`relative z-[1] px-6 pb-5 pt-2 transition-opacity duration-500 sm:px-8 ${
          idle ? "opacity-70" : "opacity-100"
        }`}
      >
        <EventFooter tone="projection" />
      </div>
    </div>
  );
}
