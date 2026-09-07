import type { ReactNode } from "react";

type ChipProps = {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
};

export function Chip({ active, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "btn-gold"
          : "border border-[var(--line)] bg-[var(--chip)] text-[var(--text)] hover:border-[var(--gold)]"
      }`}
    >
      {children}
    </button>
  );
}

type FieldProps = {
  label: string;
  children: ReactNode;
};

export function Field({ label, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}

export const fieldClass =
  "w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-[var(--text)] outline-none focus:border-[var(--lime)]";

export const primaryButtonClass =
  "btn-gold rounded-full px-5 py-2.5 text-sm font-semibold";

export const ghostButtonClass =
  "rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-medium text-[var(--text)] hover:border-[var(--gold)] hover:text-[var(--gold)]";

export const disabledButtonClass =
  "rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-medium text-[var(--muted)] opacity-50";
