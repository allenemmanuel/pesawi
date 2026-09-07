import { Chip } from "../badminton/ui";
import {
  FORMAT_LABEL,
  GENDER_LABEL,
  formatOf,
  genderOf,
  type FormatFilter,
  type GenderFilter,
  type PentanqueMatch,
} from "./types";

export type GenderChip = GenderFilter | "all";
export type FormatChip = FormatFilter | "all";

const GENDERS: GenderFilter[] = ["men", "women", "mixed"];
const FORMATS: FormatFilter[] = ["singles", "doubles", "triples"];

type Props = {
  gender: GenderChip;
  format: FormatChip;
  onGender: (value: GenderChip) => void;
  onFormat: (value: FormatChip) => void;
};

export function EventFilters({ gender, format, onGender, onFormat }: Props) {
  return (
    <div className="mb-8 space-y-3">
      <div className="chip-row flex gap-2 overflow-x-auto pb-1">
        <Chip active={gender === "all"} onClick={() => onGender("all")}>
          All
        </Chip>
        {GENDERS.map((item) => (
          <Chip key={item} active={gender === item} onClick={() => onGender(item)}>
            {GENDER_LABEL[item]}
          </Chip>
        ))}
      </div>
      <div className="chip-row flex gap-2 overflow-x-auto pb-1">
        <Chip active={format === "all"} onClick={() => onFormat("all")}>
          All
        </Chip>
        {FORMATS.map((item) => (
          <Chip key={item} active={format === item} onClick={() => onFormat(item)}>
            {FORMAT_LABEL[item]}
          </Chip>
        ))}
      </div>
    </div>
  );
}

export function matchFitsFilters(match: PentanqueMatch, gender: GenderChip, format: FormatChip) {
  if (gender !== "all" && genderOf(match.discipline) !== gender) return false;
  if (format !== "all" && formatOf(match.discipline) !== format) return false;
  return true;
}
