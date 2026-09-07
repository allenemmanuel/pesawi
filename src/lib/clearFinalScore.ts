import { findWilayahPairMatch } from "./finalScore";
import { fail, listSportMatches, ok, patchMatch } from "./matches";
import { requireCourt, writeError } from "./session";

/** Soft-clear the latest RR result for a wilayah pair (keeps doc, bumps updatedAt). */
export async function clearSportPairResult<
  T extends { id: string; status: string; sideA: { wilayahId: string }; sideB: { wilayahId: string } },
>(sport: string, sideAId: string, sideBId: string, predicate: (match: T) => boolean = () => true) {
  const session = await requireCourt();
  if (!session.ok) return fail(session.error, 401);
  if (!sideAId || !sideBId || sideAId === sideBId) return fail("Pick two different wilayah.");

  const listed = await listSportMatches<T>(sport);
  if (!listed.ok) return fail(listed.error, listed.status);

  const existing = findWilayahPairMatch(listed.data.matches, sideAId, sideBId, predicate);
  if (!existing) return ok({ cleared: false as const });

  try {
    await patchMatch(existing.id, { status: "scheduled" } as Partial<T>);
    return ok({ cleared: true as const });
  } catch (error) {
    return fail(writeError(error), 403);
  }
}
