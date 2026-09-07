/** Latest `updatedAt` (ms) among records, or null. */
export function latestUpdatedAt(items: readonly object[]): number | null {
  let latest: number | null = null;
  for (const item of items) {
    const value = (item as { updatedAt?: unknown }).updatedAt;
    if (typeof value === "number" && Number.isFinite(value) && (latest === null || value > latest)) {
      latest = value;
    }
  }
  return latest;
}

const TZ = "Asia/Kuala_Lumpur";

export function formatLastUpdatedParts(ms: number): { date: string; time: string } {
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(ms));
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(ms));
  return { date, time };
}

export function formatLastUpdated(ms: number | null | undefined) {
  if (ms == null) return "Last updated: —";
  const { date, time } = formatLastUpdatedParts(ms);
  return `Last updated: ${date}, ${time}`;
}
