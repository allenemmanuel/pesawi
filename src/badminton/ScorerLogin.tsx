import { useState, type FormEvent } from "react";
import { BrandCrest, BrandWordmark, BrandYsg, EVENT, EventFooter } from "../brand";
import { COURTS, deskFromHash } from "./courts";
import { useBadminton } from "./store";
import { Field, fieldClass, primaryButtonClass } from "./ui";

export default function ScorerLogin() {
  const { login } = useBadminton();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const deepLinkDesk = deskFromHash(window.location.hash);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const courtId = deepLinkDesk?.id ?? COURTS[0]?.id ?? "";
    if (!courtId) {
      setError("Scorer boards are not configured.");
      return;
    }
    setBusy(true);
    setError("");
    const result = await login(courtId, pin);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (deepLinkDesk) {
      window.location.hash = deepLinkDesk.hash;
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-sm flex-col px-1 py-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-3">
          <BrandCrest className="h-16 w-16" />
          <BrandYsg className="h-12 w-12 opacity-90" />
        </div>
        <BrandWordmark className="mt-4 h-10" />
        <h1 className="font-display mt-5 text-3xl font-semibold tracking-tight">Scorer</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {EVENT.dates} · {EVENT.venue}
        </p>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--muted)]">
          {deepLinkDesk ? `Enter the scorer PIN for ${deepLinkDesk.name}.` : "Enter the scorer PIN."}
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <Field label="PIN">
          <input
            className={`${fieldClass} h-14 text-center text-2xl tracking-[0.4em]`}
            inputMode="numeric"
            autoComplete="one-time-code"
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="••••"
          />
        </Field>
      </div>

      {error && <p className="mt-4 text-sm text-[var(--jumlah)]">{error}</p>}

      <button
        type="submit"
        disabled={busy || pin.length < 4}
        className={`${primaryButtonClass} mt-8 h-14 w-full text-base`}
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>

      <EventFooter className="mt-10" />
    </form>
  );
}
