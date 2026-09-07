import { Chip } from "../badminton/ui";
import { DISCIPLINES, DISCIPLINE_LABEL, type Discipline } from "./types";

export type DisciplineFilter = Discipline | "all";

type Props = {
  discipline: DisciplineFilter;
  onDiscipline: (value: DisciplineFilter) => void;
};

export function EventFilters({ discipline, onDiscipline }: Props) {
  return (
    <div className="chip-row mb-8 flex gap-2 overflow-x-auto pb-1">
      <Chip active={discipline === "all"} onClick={() => onDiscipline("all")}>
        All
      </Chip>
      {DISCIPLINES.map((item) => (
        <Chip key={item} active={discipline === item} onClick={() => onDiscipline(item)}>
          {DISCIPLINE_LABEL[item]}
        </Chip>
      ))}
    </div>
  );
}
