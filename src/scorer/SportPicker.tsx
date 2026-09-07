import { useBadminton } from "../badminton/store";
import { BrandCrest, EVENT, SportMascot } from "../brand";
import type { Sport } from "../data";

const SPORTS: { sport: Sport; hash: string; label: string }[] = [
  { sport: "Badminton", hash: "/scorer/badminton", label: "Badminton" },
  { sport: "Futsal", hash: "/scorer/futsal", label: "Futsal" },
  { sport: "Pentanque", hash: "/scorer/pentanque", label: "Pentanque" },
  { sport: "Karom", hash: "/scorer/karom", label: "Karom" },
  { sport: "Ping Pong", hash: "/scorer/pingpong", label: "Ping Pong" },
  { sport: "Pickleball", hash: "/scorer/pickleball", label: "Pickleball" },
  { sport: "Sepak Takraw", hash: "/scorer/takraw", label: "Sepak Takraw" },
  { sport: "Dart", hash: "/scorer/dart", label: "Dart" },
  { sport: "Bola Tampar", hash: "/scorer/bolatampar", label: "Bola Tampar" },
];

export default function SportPicker() {
  const { court, logout } = useBadminton();

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <BrandCrest className="mt-0.5 h-10 w-10 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--lime)]">{court?.name ?? "Scorer"}</p>
            <h1 className="font-display text-xl font-semibold tracking-tight">Scorer</h1>
            <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
              {EVENT.short} · {EVENT.dates}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">Choose a board to edit.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            void logout();
          }}
          className="shrink-0 text-sm text-[var(--muted)] hover:text-[var(--text)]"
        >
          Sign out
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          window.location.hash = "/scorer/medals";
        }}
        className="mb-4 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)]/50 px-5 py-3.5 text-left text-sm font-medium transition-colors hover:bg-[var(--surface-hover)]"
      >
        Edit medal table
      </button>

      <div className="space-y-2.5">
        {SPORTS.map((item) => (
          <button
            key={item.hash}
            type="button"
            onClick={() => {
              window.location.hash = item.hash;
            }}
            className="flex w-full items-center gap-3 rounded-2xl bg-[var(--surface)] px-5 py-4 text-left transition-colors hover:bg-[var(--surface-hover)]"
          >
            <SportMascot sport={item.sport} className="h-12 w-12 shrink-0" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
