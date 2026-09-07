import type { Discipline, FutsalMatch, PenaltyScore, Period, Phase } from "./types";
import { analyzeScore, liveStatus } from "./rules";
import { courtName } from "../badminton/courts";
import { clearSportPairResult } from "../lib/clearFinalScore";
import { orientScores, sameWilayahPair } from "../lib/finalScore";
import {
  fail,
  listSportMatches,
  newMatchId,
  ok,
  patchMatch,
  readMatch,
  subscribeSportMatches,
  writeMatch,
} from "../lib/matches";
import { requireCourt, writeError } from "../lib/session";

export type ScorePayload = {
  goalsA: number;
  goalsB: number;
  period: Period;
  penalties?: PenaltyScore | null;
  live?: boolean;
};

export function fetchMatches() {
  return listSportMatches<FutsalMatch>("Futsal");
}

export function subscribeMatches(onChange: (matches: FutsalMatch[]) => void) {
  return subscribeSportMatches<FutsalMatch>("Futsal", onChange);
}

export async function createMatch(draft: {
  discipline: Discipline;
  phase: Phase;
  sideA: { wilayahId: string };
  sideB: { wilayahId: string };
}) {
  const session = await requireCourt();
  if (!session.ok) return fail(session.error, 401);
  if (!draft.discipline || !draft.phase) return fail("Choose event and phase.");
  if (!draft.sideA?.wilayahId || !draft.sideB?.wilayahId) return fail("Each side needs a wilayah.");
  if (draft.sideA.wilayahId === draft.sideB.wilayahId) return fail("Pick two different wilayah.");
  const match: FutsalMatch = {
    id: newMatchId("fs"),
    sport: "Futsal",
    discipline: draft.discipline,
    phase: draft.phase,
    courtId: session.court.id,
    court: courtName(session.court.id),
    sideA: draft.sideA,
    sideB: draft.sideB,
    goalsA: 0,
    goalsB: 0,
    period: "h1",
    status: "scheduled",
  };
  try {
    await writeMatch(match);
    return ok({ match });
  } catch (error) {
    return fail(writeError(error), 403);
  }
}

export async function patchMatchScore(id: string, payload: ScorePayload) {
  const session = await requireCourt();
  if (!session.ok) return fail(session.error, 401);
  const current = await readMatch<FutsalMatch>(id);
  if (!current) return fail("Match not found.", 404);
  if (current.courtId !== session.court.id) return fail("This match belongs to another court.", 403);
  if (current.status === "complete") return fail("This match is locked.", 409);
  const analysis = analyzeScore({
    phase: current.phase,
    goalsA: payload.goalsA,
    goalsB: payload.goalsB,
    period: payload.period,
    penalties: payload.penalties ?? undefined,
  });
  if (!analysis.canSave) return fail(analysis.issues[0] ?? "Score cannot be saved.");
  const status = liveStatus(payload.goalsA, payload.goalsB, payload.period);
  const patch: Partial<FutsalMatch> = {
    goalsA: payload.goalsA,
    goalsB: payload.goalsB,
    period: payload.period,
    status,
  };
  if (payload.penalties) patch.penalties = payload.penalties;
  try {
    const match = await patchMatch<FutsalMatch>(id, patch);
    return ok({ match });
  } catch (error) {
    return fail(writeError(error), 403);
  }
}

export async function postCompleteMatch(id: string, payload: ScorePayload) {
  const session = await requireCourt();
  if (!session.ok) return fail(session.error, 401);
  const current = await readMatch<FutsalMatch>(id);
  if (!current) return fail("Match not found.", 404);
  if (current.courtId !== session.court.id) return fail("This match belongs to another court.", 403);
  const analysis = analyzeScore({
    phase: current.phase,
    goalsA: payload.goalsA,
    goalsB: payload.goalsB,
    period: payload.period,
    penalties: payload.penalties ?? undefined,
  });
  if (!analysis.canComplete) return fail(analysis.issues[0] ?? "Match cannot be completed yet.");
  const patch: Partial<FutsalMatch> = {
    goalsA: payload.goalsA,
    goalsB: payload.goalsB,
    period: payload.period,
    status: "complete",
  };
  if (payload.penalties) patch.penalties = payload.penalties;
  try {
    const match = await patchMatch<FutsalMatch>(id, patch);
    return ok({ match });
  } catch (error) {
    return fail(writeError(error), 403);
  }
}

/** Inline RR: create or overwrite a group result for a wilayah pair in one discipline. */
export async function setFinalScore(
  sideAId: string,
  sideBId: string,
  scoreA: number,
  scoreB: number,
  discipline: Discipline = "men-open",
) {
  const session = await requireCourt();
  if (!session.ok) return fail(session.error, 401);
  if (!sideAId || !sideBId || sideAId === sideBId) return fail("Pick two different wilayah.");
  if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0) {
    return fail("Enter a valid score (e.g. 3-1).");
  }

  const listed = await listSportMatches<FutsalMatch>("Futsal");
  if (!listed.ok) return fail(listed.error, listed.status);
  const existing = listed.data.matches
    .filter(
      (match) =>
        match.phase === "group" &&
        match.discipline === discipline &&
        sameWilayahPair(sideAId, sideBId, match),
    )
    .sort((a, b) => b.id.localeCompare(a.id))[0];

  try {
    if (existing) {
      const oriented = orientScores(sideAId, sideBId, scoreA, scoreB, existing);
      const match = await patchMatch<FutsalMatch>(existing.id, {
        goalsA: oriented.scoreA,
        goalsB: oriented.scoreB,
        period: "ft",
        status: "complete",
      });
      return ok({ match });
    }

    const match: FutsalMatch = {
      id: newMatchId("fs"),
      sport: "Futsal",
      discipline,
      phase: "group",
      courtId: session.court.id,
      court: courtName(session.court.id),
      sideA: { wilayahId: sideAId },
      sideB: { wilayahId: sideBId },
      goalsA: scoreA,
      goalsB: scoreB,
      period: "ft",
      status: "complete",
    };
    await writeMatch(match);
    return ok({ match });
  } catch (error) {
    return fail(writeError(error), 403);
  }
}

export async function clearFinalScore(
  sideAId: string,
  sideBId: string,
  discipline: Discipline = "men-open",
) {
  return clearSportPairResult<FutsalMatch>(
    "Futsal",
    sideAId,
    sideBId,
    (match) => match.phase === "group" && match.discipline === discipline,
  );
}
