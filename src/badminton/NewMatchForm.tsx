import { useState, type FormEvent } from "react";
import { useBadminton } from "./store";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  DISCIPLINES,
  WILAYAH,
  type Category,
  type Discipline,
  type PairSnapshot,
} from "./types";
import { Field, fieldClass, ghostButtonClass, primaryButtonClass } from "./ui";

type Props = {
  onCancel: () => void;
  onCreated: (id: string) => void;
};

const emptyPair: PairSnapshot = { wilayahId: "kota-kinabalu", player1: "", player2: "" };

export default function NewMatchForm({ onCancel, onCreated }: Props) {
  const { addMatch, court } = useBadminton();
  const [discipline, setDiscipline] = useState<Discipline>("MD");
  const [category, setCategory] = useState<Category>("open");
  const [sideA, setSideA] = useState<PairSnapshot>(emptyPair);
  const [sideB, setSideB] = useState<PairSnapshot>({ ...emptyPair, wilayahId: "tawau" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function updatePair(side: "a" | "b", field: keyof PairSnapshot, value: string) {
    const setter = side === "a" ? setSideA : setSideB;
    setter((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const result = await addMatch({
      discipline,
      category,
      sideA: {
        wilayahId: sideA.wilayahId,
        player1: sideA.player1.trim(),
        player2: sideA.player2.trim(),
      },
      sideB: {
        wilayahId: sideB.wilayahId,
        player1: sideB.player1.trim(),
        player2: sideB.player2.trim(),
      },
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
        <Field label="Discipline">
          <select
            className={`${fieldClass} h-12`}
            value={discipline}
            onChange={(event) => setDiscipline(event.target.value as Discipline)}
          >
            {DISCIPLINES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category">
          <select
            className={`${fieldClass} h-12`}
            value={category}
            onChange={(event) => setCategory(event.target.value as Category)}
          >
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {CATEGORY_LABEL[item]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <PairFields label="Pair A" pair={sideA} onChange={(field, value) => updatePair("a", field, value)} />
        <PairFields label="Pair B" pair={sideB} onChange={(field, value) => updatePair("b", field, value)} />
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

function PairFields({
  label,
  pair,
  onChange,
}: {
  label: string;
  pair: PairSnapshot;
  onChange: (field: keyof PairSnapshot, value: string) => void;
}) {
  return (
    <fieldset className="rounded-2xl bg-[var(--surface)] p-5">
      <legend className="px-1 text-sm font-medium">{label}</legend>
      <div className="space-y-4">
        <Field label="Wilayah">
          <select
            className={`${fieldClass} h-12`}
            value={pair.wilayahId}
            onChange={(event) => onChange("wilayahId", event.target.value)}
          >
            {WILAYAH.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Player 1">
          <input
            className={`${fieldClass} h-12`}
            value={pair.player1}
            onChange={(event) => onChange("player1", event.target.value)}
          />
        </Field>
        <Field label="Player 2">
          <input
            className={`${fieldClass} h-12`}
            value={pair.player2}
            onChange={(event) => onChange("player2", event.target.value)}
          />
        </Field>
      </div>
    </fieldset>
  );
}
