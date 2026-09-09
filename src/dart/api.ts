import type { Discipline, DartMatch, SideSnapshot } from "./types";
import {
  analyzeMatch,
  applyVisitAction,
  newDartMatchFields,
  normalizeDartMatch,
  validateSide,
} from "./rules";
import { boardNameFromCourt, playersPerSide } from "./types";
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

export function fetchMatches() {
  return listSportMatches<DartMatch>("Dart");
}

export function subscribeMatches(onChange: (matches: DartMatch[]) => void) {
  return subscribeSportMatches<DartMatch>("Dart", (rows) => onChange(rows.map((item) => normalizeDartMatch(item))));
}

export async function createMatch(draft: {
  discipline: Discipline;
  sideA: SideSnapshot;
  sideB: SideSnapshot;
}) {
  const session = await requireCourt();
  if (!session.ok) return fail(session.error, 401);
  const sideA = validateSide(draft.sideA, draft.discipline);
  const sideB = validateSide(draft.sideB, draft.discipline);
  if (!sideA.ok) return fail(sideA.error);
  if (!sideB.ok) return fail(sideB.error);
  const match: DartMatch & { courtId: string } = {
    id: newMatchId("dt"),
    sport: "Dart",
    discipline: draft.discipline,
    boardId: session.court.id,
    board: boardNameFromCourt(session.court.name),
    courtId: session.court.id,
    sideA: sideA.side,
    sideB: sideB.side,
    ...newDartMatchFields(),
    status: "scheduled",
  };
  try {
    await writeMatch(match);
    return ok({ match });
  } catch (error) {
    return fail(writeError(error), 403);
  }
}

export async function patchMatchVisit(id: string, score: number) {
  const session = await requireCourt();
  if (!session.ok) return fail(session.error, 401);
  const current = await readMatch<DartMatch>(id);
  if (!current) return fail("Match not found.", 404);
  if (current.boardId !== session.court.id) return fail("This match belongs to another board.", 403);
  const result = applyVisitAction(normalizeDartMatch(current), score);
  if (!result.ok) return fail(result.error);
  try {
    await writeMatch({ ...result.match, courtId: session.court.id });
    return ok({ match: result.match, outcome: result.outcome.type });
  } catch (error) {
    return fail(writeError(error), 403);
  }
}

export async function postCompleteMatch(id: string) {
  const session = await requireCourt();
  if (!session.ok) return fail(session.error, 401);
  const current = await readMatch<DartMatch>(id);
  if (!current) return fail("Match not found.", 404);
  if (current.boardId !== session.court.id) return fail("This match belongs to another board.", 403);
  const match = normalizeDartMatch(current);
  const analysis = analyzeMatch(match);
  if (!analysis.canComplete) return fail(analysis.issues[0] ?? "Match cannot be completed yet.");
  try {
    const next = await patchMatch<DartMatch>(id, { status: "complete" });
    return ok({ match: next });
  } catch (error) {
    return fail(writeError(error), 403);
  }
}

function placeholderSide(wilayahId: string, discipline: Discipline): SideSnapshot {
  return { wilayahId, players: Array.from({ length: playersPerSide(discipline) }, () => "—") };
}

/** Inline RR: freeform legs score. */
export async function setFinalScore(sideAId: string, sideBId: string, scoreA: number, scoreB: number) {
  const session = await requireCourt();
  if (!session.ok) return fail(session.error, 401);
  if (!sideAId || !sideBId || sideAId === sideBId) return fail("Pick two different wilayah.");
  if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0) {
    return fail("Enter a valid score (e.g. 4-2).");
  }
  if (scoreA === 0 && scoreB === 0) return fail("Enter a score for at least one side.");

  const discipline: Discipline = "MP";
  const listed = await listSportMatches<DartMatch>("Dart");
  if (!listed.ok) return fail(listed.error, listed.status);
  const existing = listed.data.matches
    .filter((match) => sameWilayahPair(sideAId, sideBId, match))
    .sort((a, b) => b.id.localeCompare(a.id))[0];

  try {
    if (existing) {
      const oriented = orientScores(sideAId, sideBId, scoreA, scoreB, existing);
      const match = await patchMatch<DartMatch>(existing.id, {
        legsA: oriented.scoreA,
        legsB: oriented.scoreB,
        status: "complete",
      });
      return ok({ match: normalizeDartMatch(match) });
    }

    const base = newDartMatchFields();
    const match: DartMatch & { courtId: string } = {
      id: newMatchId("dt"),
      sport: "Dart",
      discipline,
      boardId: session.court.id,
      board: boardNameFromCourt(session.court.name),
      courtId: session.court.id,
      sideA: placeholderSide(sideAId, discipline),
      sideB: placeholderSide(sideBId, discipline),
      ...base,
      legsA: scoreA,
      legsB: scoreB,
      status: "complete",
    };
    await writeMatch(match);
    return ok({ match: normalizeDartMatch(match) });
  } catch (error) {
    return fail(writeError(error), 403);
  }
}

export async function clearFinalScore(sideAId: string, sideBId: string) {
  return clearSportPairResult<DartMatch>("Dart", sideAId, sideBId);
}
