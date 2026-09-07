/** Parse "3-1", "3:1", "3 – 1" into row/col scores. */
export function parseFinalScore(raw: string): { a: number; b: number } | null {
  const text = raw.trim().replace(/\s+/g, " ");
  if (!text) return null;
  const match = text.match(/^(\d+)\s*[-–—:/]\s*(\d+)$/);
  if (!match) return null;
  const a = Number(match[1]);
  const b = Number(match[2]);
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) return null;
  return { a, b };
}

export function formatFinalScore(a: number, b: number) {
  return `${a}–${b}`;
}

/**
 * Freeform set/game wins → synthetic completed games (placeholder points).
 * Accepts any non-negative integers, including equal scores.
 */
export function synthesizeGameWins(
  winsA: number,
  winsB: number,
  winPoints = 21,
): { a: number; b: number }[] | null {
  if (!Number.isInteger(winsA) || !Number.isInteger(winsB)) return null;
  if (winsA < 0 || winsB < 0) return null;
  if (winsA > 99 || winsB > 99) return null;

  const games: { a: number; b: number }[] = [];
  for (let i = 0; i < winsA; i += 1) games.push({ a: winPoints, b: 0 });
  for (let i = 0; i < winsB; i += 1) games.push({ a: 0, b: winPoints });
  return games;
}

/** @deprecated use synthesizeGameWins */
export const synthesizeBestOfThree = synthesizeGameWins;

export function sameWilayahPair(
  sideAId: string,
  sideBId: string,
  match: { sideA: { wilayahId: string }; sideB: { wilayahId: string } },
) {
  const ids = [match.sideA.wilayahId, match.sideB.wilayahId];
  return ids.includes(sideAId) && ids.includes(sideBId) && sideAId !== sideBId;
}

/** Orient typed scores so they match match.sideA / sideB. */
export function orientScores(
  sideAId: string,
  sideBId: string,
  scoreForSideAId: number,
  scoreForSideBId: number,
  match: { sideA: { wilayahId: string }; sideB: { wilayahId: string } },
) {
  if (match.sideA.wilayahId === sideAId && match.sideB.wilayahId === sideBId) {
    return { scoreA: scoreForSideAId, scoreB: scoreForSideBId };
  }
  return { scoreA: scoreForSideBId, scoreB: scoreForSideAId };
}

/** Latest match for a wilayah pair (optional extra filter), or null if none. */
export function findWilayahPairMatch<T extends { id: string; sideA: { wilayahId: string }; sideB: { wilayahId: string } }>(
  matches: T[],
  sideAId: string,
  sideBId: string,
  predicate: (match: T) => boolean = () => true,
): T | null {
  return (
    matches
      .filter((match) => predicate(match) && sameWilayahPair(sideAId, sideBId, match))
      .sort((a, b) => b.id.localeCompare(a.id))[0] ?? null
  );
}
