import { useState, type FormEvent } from "react";
import { useBadminton } from "../badminton/store";
import { Field, fieldClass, ghostButtonClass, primaryButtonClass } from "../badminton/ui";
import { useFutsal } from "./store";
import {
  DISCIPLINES,
  DISCIPLINE_LABEL,
  PHASES,
  PHASE_LABEL,
  WILAYAH,
  type Discipline,
  type Phase,
} from "./types";

type Props = {
  onCancel: () => void;
  onCreated: (id: string) => void;
};

export default function NewMatchForm({ onCancel, onCreated }: Props) {
  const { addMatch } = useFutsal();
  const { court } = useBadminton();
  const [discipline, setDiscipline] = useState<Discipline>("men-open");
  const [phase, setPhase] = useState<Phase>("group");
  const [sideA, setSideA] = useState("kota-kinabalu");
  const [sideB, setSideB] = useState("tawau");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const result = await addMatch({
      discipline,
      phase,
      sideA: { wilayahId: sideA },
      sideB: { wilayahId: sideB },
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onCreated(result.match.id);
  }

  return (
    <form onSubmit={onSubmit} className="pb-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button type="button" onClick={onCancel} className="text-sm text-[var(--muted)]">
          Back
        </button>
        <h1 className="text-xl font-semibold">New match</h1>
        <span className="w-10" />
      </div>

      <p className="mb-4 rounded-2xl bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
        Court is locked to <span className="font-medium text-[var(--text)]">{court?.name ?? "this court"}</span>
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <select
            className={`${fieldClass} h-12`}
            value={discipline}
            onChange={(event) => setDiscipline(event.target.value as Discipline)}
          >
            {DISCIPLINES.map((item) => (
              <option key={item} value={item}>
                {DISCIPLINE_LABEL[item]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Phase">
          <select
            className={`${fieldClass} h-12`}
            value={phase}
            onChange={(event) => setPhase(event.target.value as Phase)}
          >
            {PHASES.map((item) => (
              <option key={item} value={item}>
                {PHASE_LABEL[item]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <WilayahField label="Wilayah A" value={sideA} onChange={setSideA} />
        <WilayahField label="Wilayah B" value={sideB} onChange={setSideB} />
      </div>

      {error && <p className="mt-4 text-sm text-[var(--jumlah)]">{error}</p>}

      <div className="mt-8 flex gap-3">
        <button type="submit" disabled={busy} className={`${primaryButtonClass} h-12 flex-1`}>
          {busy ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onCancel} className={ghostButtonClass}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function WilayahField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="rounded-2xl bg-[var(--surface)] p-5">
      <legend className="px-1 text-sm font-medium">{label}</legend>
      <Field label="Wilayah">
        <select className={`${fieldClass} h-12`} value={value} onChange={(event) => onChange(event.target.value)}>
          {WILAYAH.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </Field>
    </fieldset>
  );
}
