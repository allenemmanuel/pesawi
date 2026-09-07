import { useState, type FormEvent } from "react";
import { useBadminton } from "../badminton/store";
import { Field, fieldClass, ghostButtonClass, primaryButtonClass } from "../badminton/ui";
import { useKarom } from "./store";
import {
  DISCIPLINES,
  DISCIPLINE_LABEL,
  WILAYAH,
  boardNameFromCourt,
  playersPerSide,
  type Discipline,
  type SideSnapshot,
} from "./types";

type Props = {
  onCancel: () => void;
  onCreated: (id: string) => void;
};

function emptySide(wilayahId: string, count: number): SideSnapshot {
  return { wilayahId, players: Array.from({ length: count }, () => "") };
}

export default function NewMatchForm({ onCancel, onCreated }: Props) {
  const { addMatch } = useKarom();
  const { court } = useBadminton();
  const [discipline, setDiscipline] = useState<Discipline>("MS");
  const count = playersPerSide(discipline);
  const [sideA, setSideA] = useState<SideSnapshot>(() => emptySide("kota-kinabalu", 1));
  const [sideB, setSideB] = useState<SideSnapshot>(() => emptySide("tawau", 1));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function changeDiscipline(next: Discipline) {
    const nextCount = playersPerSide(next);
    setDiscipline(next);
    setSideA((prev) => resizePlayers(prev, nextCount));
    setSideB((prev) => resizePlayers(prev, nextCount));
  }

  function updateSide(side: "a" | "b", field: "wilayahId" | number, value: string) {
    const setter = side === "a" ? setSideA : setSideB;
    setter((prev) => {
      if (field === "wilayahId") return { ...prev, wilayahId: value };
      const players = prev.players.map((name, index) => (index === field ? value : name));
      return { ...prev, players };
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const result = await addMatch({
      discipline,
      sideA: {
        wilayahId: sideA.wilayahId,
        players: sideA.players.map((name) => name.trim()),
      },
      sideB: {
        wilayahId: sideB.wilayahId,
        players: sideB.players.map((name) => name.trim()),
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
        Board is locked to{" "}
        <span className="font-medium text-[var(--text)]">
          {court ? boardNameFromCourt(court.name) : "this board"}
        </span>
      </p>

      <Field label="Discipline">
        <select
          className={`${fieldClass} h-12`}
          value={discipline}
          onChange={(event) => changeDiscipline(event.target.value as Discipline)}
        >
          {DISCIPLINES.map((item) => (
            <option key={item} value={item}>
              {item} · {DISCIPLINE_LABEL[item]}
            </option>
          ))}
        </select>
      </Field>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <SideFields label="Side A" side={sideA} count={count} onChange={(field, value) => updateSide("a", field, value)} />
        <SideFields label="Side B" side={sideB} count={count} onChange={(field, value) => updateSide("b", field, value)} />
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

function resizePlayers(side: SideSnapshot, count: number): SideSnapshot {
  const players = [...side.players.slice(0, count)];
  while (players.length < count) players.push("");
  return { ...side, players };
}

function SideFields({
  label,
  side,
  count,
  onChange,
}: {
  label: string;
  side: SideSnapshot;
  count: number;
  onChange: (field: "wilayahId" | number, value: string) => void;
}) {
  return (
    <fieldset className="rounded-2xl bg-[var(--surface)] p-5">
      <legend className="px-1 text-sm font-medium">{label}</legend>
      <div className="space-y-4">
        <Field label="Wilayah">
          <select
            className={`${fieldClass} h-12`}
            value={side.wilayahId}
            onChange={(event) => onChange("wilayahId", event.target.value)}
          >
            {WILAYAH.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
        {Array.from({ length: count }, (_, index) => (
          <Field key={index} label={`Player ${index + 1}`}>
            <input
              className={`${fieldClass} h-12`}
              value={side.players[index] ?? ""}
              onChange={(event) => onChange(index, event.target.value)}
            />
          </Field>
        ))}
      </div>
    </fieldset>
  );
}
