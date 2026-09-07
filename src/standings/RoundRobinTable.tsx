import { WILAYAH, wilayahChipStyle } from "../badminton/types";
import type { RoundRobinRow } from "./types";
import LastUpdated from "./LastUpdated";
import ScoreCellInput from "./ScoreCellInput";

type Props = {
  rows: RoundRobinRow[];
  title?: string;
  lastUpdated?: number | null;
  editable?: boolean;
  onCommitScore?: (rowId: string, colId: string, a: number | null, b: number | null) => Promise<string | null>;
};

const goldCol = "bg-[color-mix(in_srgb,var(--gold)_18%,transparent)]";
const rankCol = "bg-[color-mix(in_srgb,var(--jumlah)_18%,transparent)]";

export default function RoundRobinTable({ rows, title, lastUpdated, editable = false, onCommitScore }: Props) {
  return (
    <section className="w-full min-w-0">
      {title ? (
        <h2 className="mx-auto mb-4 w-fit max-w-full whitespace-nowrap rounded-xl border border-[color-mix(in_srgb,var(--gold)_45%,transparent)] bg-[color-mix(in_srgb,var(--gold)_14%,rgba(5,9,20,0.88))] px-3 py-2 text-center font-display text-[1.05rem] font-semibold tracking-wide text-[var(--gold)] sm:mb-5 sm:px-4 sm:py-2.5 sm:text-[1.575rem] [text-shadow:0_2px_16px_rgba(0,0,0,0.55)]">
          {title}
        </h2>
      ) : null}
      <div className="live-card-enter w-full min-w-0 overflow-x-auto overscroll-x-contain rounded-2xl border border-[var(--line)] bg-[rgba(5,9,20,0.78)] shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm [-webkit-overflow-scrolling:touch]">
        <table className="w-full min-w-[46rem] table-fixed border-collapse text-xs sm:text-sm">
          <colgroup>
            <col className="w-[5.75rem]" />
            {WILAYAH.map((team) => (
              <col key={team.id} className="w-[5.75rem]" />
            ))}
            <col className="w-[2.75rem]" />
            <col className="w-[2.75rem]" />
            <col className="w-[3.25rem]" />
            <col className="w-[3.25rem]" />
          </colgroup>
          <thead>
            <tr className="border-b border-[var(--line)]">
              <th className="sticky left-0 z-10 bg-[rgba(5,9,20,0.92)] px-1 py-3 text-center text-[0.65rem] font-semibold tracking-wide sm:px-1.5 sm:py-4 sm:text-xs">
                WILAYAH
              </th>
              {WILAYAH.map((team) => (
                <th
                  key={team.id}
                  title={team.name}
                  style={wilayahChipStyle(team)}
                  className="overflow-hidden px-1 py-3 text-center text-[0.65rem] font-semibold tracking-wide sm:px-1.5 sm:py-4 sm:text-xs"
                >
                  {team.short}
                </th>
              ))}
              <th className={`px-1.5 py-3 text-center font-semibold tracking-wide sm:px-2 sm:py-4 ${goldCol}`} title="Menang">
                M
              </th>
              <th className={`px-1.5 py-3 text-center font-semibold tracking-wide sm:px-2 sm:py-4 ${goldCol}`} title="Kalah">
                K
              </th>
              <th className={`px-1.5 py-3 text-center font-semibold tracking-wide sm:px-2 sm:py-4 ${goldCol}`} title="Mata">
                MATA
              </th>
              <th className={`px-1.5 py-3 text-center font-semibold tracking-wide text-[var(--jumlah)] sm:px-2 sm:py-4 ${rankCol}`}>
                RANK
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.wilayah.id} className="border-b border-[var(--line)] last:border-b-0">
                <th
                  scope="row"
                  title={row.wilayah.name}
                  style={wilayahChipStyle(row.wilayah)}
                  className="sticky left-0 z-10 overflow-hidden px-1 py-3 text-center text-[0.65rem] font-medium tracking-wide sm:px-1.5 sm:py-4 sm:text-xs"
                >
                  {row.wilayah.short}
                </th>
                {row.cells.map((cell, index) => {
                  const opponent = WILAYAH[index];
                  if (cell.kind === "self") {
                    return (
                      <td
                        key={opponent.id}
                        className="bg-[var(--bg)]/50"
                        aria-label={`${row.wilayah.name} vs ${row.wilayah.name}`}
                      />
                    );
                  }

                  if (editable && onCommitScore) {
                    return (
                      <ScoreCellInput
                        key={opponent.id}
                        display={cell.kind === "empty" ? "" : cell.display}
                        live={cell.live}
                        onCommit={(a, b) => onCommitScore(row.wilayah.id, opponent.id, a, b)}
                      />
                    );
                  }

                  if (cell.kind === "empty") {
                    return (
                      <td
                        key={opponent.id}
                        className="px-1.5 py-3 text-center text-[var(--muted)] sm:py-4"
                        aria-label={`${row.wilayah.name} vs ${opponent.name}: tiada keputusan`}
                      >
                        —
                      </td>
                    );
                  }

                  const scoreClass = cell.live
                    ? "text-[var(--lime)]"
                    : cell.won === false
                      ? "text-[var(--muted)]"
                      : "text-[var(--text)]";

                  return (
                    <td key={opponent.id} className="p-0 text-center">
                      <span
                        title={`${row.wilayah.name} vs ${opponent.name}`}
                        className={`flex min-h-11 w-full items-center justify-center gap-1 px-1.5 py-3 tabular font-semibold sm:py-4 ${scoreClass}`}
                      >
                        {cell.display}
                        {cell.live ? <span className="live-dot" /> : null}
                      </span>
                    </td>
                  );
                })}
                <td className={`px-1.5 py-3 text-center tabular font-medium sm:py-4 ${goldCol}`}>{row.wins}</td>
                <td className={`px-1.5 py-3 text-center tabular font-medium sm:py-4 ${goldCol}`}>{row.losses}</td>
                <td className={`px-1.5 py-3 text-center tabular font-semibold sm:py-4 ${goldCol}`}>{row.points}</td>
                <td className={`px-1.5 py-3 text-center tabular font-bold text-[var(--jumlah)] sm:py-4 ${rankCol}`}>
                  {row.rank}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <LastUpdated at={lastUpdated} />
    </section>
  );
}
