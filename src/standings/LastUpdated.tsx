import { formatLastUpdatedParts } from "../lib/lastUpdated";

type Props = {
  at: number | null | undefined;
  className?: string;
};

/** Bottom-left stamp under a standings table. */
export default function LastUpdated({ at, className = "" }: Props) {
  const base =
    `mt-2 inline-flex w-fit max-w-full border border-[var(--line)] bg-[rgba(5,9,20,0.55)] text-left text-[0.65rem] tracking-wide text-[var(--muted)] sm:text-[0.7rem] ${className}`.trim();

  if (at == null) {
    return <p className={`${base} items-center rounded-full px-2.5 py-1`}>Last updated: —</p>;
  }

  const { date, time } = formatLastUpdatedParts(at);

  return (
    <p className={`${base} flex-col items-start gap-0.5 rounded-xl px-2.5 py-1.5 leading-snug`}>
      <span>Last updated:</span>
      <span>{date}</span>
      <span>{time}</span>
    </p>
  );
}
