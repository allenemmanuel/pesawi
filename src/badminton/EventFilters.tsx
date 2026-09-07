import { CATEGORIES, CATEGORY_LABEL, DISCIPLINES, type Category, type Discipline } from "./types";
import { Chip } from "./ui";

export type DisciplineFilter = Discipline | "all";
export type CategoryFilter = Category | "all";

type Props = {
  discipline: DisciplineFilter;
  category: CategoryFilter;
  onDiscipline: (value: DisciplineFilter) => void;
  onCategory: (value: CategoryFilter) => void;
};

export function EventFilters({ discipline, category, onDiscipline, onCategory }: Props) {
  return (
    <div className="mb-8 space-y-3">
      <div className="chip-row flex gap-2 overflow-x-auto pb-1">
        <Chip active={discipline === "all"} onClick={() => onDiscipline("all")}>
          All
        </Chip>
        {DISCIPLINES.map((item) => (
          <Chip key={item} active={discipline === item} onClick={() => onDiscipline(item)}>
            {item}
          </Chip>
        ))}
      </div>
      <div className="chip-row flex gap-2 overflow-x-auto pb-1">
        <Chip active={category === "all"} onClick={() => onCategory("all")}>
          All
        </Chip>
        {CATEGORIES.map((item) => (
          <Chip key={item} active={category === item} onClick={() => onCategory(item)}>
            {CATEGORY_LABEL[item]}
          </Chip>
        ))}
      </div>
    </div>
  );
}
