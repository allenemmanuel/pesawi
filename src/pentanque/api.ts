import type { Discipline, PentanqueMatch, SideSnapshot } from "./types";
import { analyzeScore, liveStatus } from "./rules";
import { laneNameFromCourt, playersPerSide } from "./types";
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
  pointsA: number;
  pointsB: number;
};

export function fetchMatches() {
  return listSportMatches<PentanqueMatch>("Pentanque");
}

export function subscribeMatches(onChange: (matches: PentanqueMatch[]) => void) {
  return subscribeSportMatches<PentanqueMatch>("Pentanque", onChange);
}

export async function createMatch(draft: {
  discipline: Discipline;
  sideA: SideSnapshot;
  sideB: SideSnapshot;
}) {
  const session = await requireCourt();
  if (!session.ok) return fail(session.error, 401);
  const match: PentanqueMatch & { courtId: string } = {
    id: newMatchId("pq"),
    sport: "Pentanque",
    discipline: draft.discipline,
    laneId: session.court.id,
    lane: laneNameFromCourt(session.court.name),
    courtId: session.court.id,
    sideA: draft.sideA,
    sideB: draft.sideB,
    pointsA: 0,
    pointsB: 0,
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
  const current = await readMatch<PentanqueMatch>(id);
  if (!current) return fail("Match not found.", 404);
  if (current.laneId !== session.court.id) return fail("This match belongs to another lane.", 403);
  if (current.status === "complete") return fail("This match is locked.", 409);
  const analysis = analyzeScore(payload);
  if (!analysis.canSave) return fail(analysis.issues[0] ?? "Score cannot be saved.");
  try {
    const match = await patchMatch<PentanqueMatch>(id, {
      pointsA: payload.pointsA,
      pointsB: payload.pointsB,
      status: liveStatus(payload.pointsA, payload.pointsB),
    });
    return ok({ match });
  } catch (error) {
    return fail(writeError(error), 403);
  }
}

export async function postCompleteMatch(id: string, payload: ScorePayload) {
  const session = await requireCourt();
  if (!session.ok) return fail(session.error, 401);
  const current = await readMatch<PentanqueMatch>(id);
  if (!current) return fail("Match not found.", 404);
  if (current.laneId !== session.court.id) return fail("This match belongs to another lane.", 403);
  const analysis = analyzeScore(payload);
  if (!analysis.canComplete) return fail(analysis.issues[0] ?? "Match cannot be completed yet.");
  try {
    const match = await patchMatch<PentanqueMatch>(id, {
      pointsA: payload.pointsA,
      pointsB: payload.pointsB,
      status: "complete",
    });
    return ok({ match });
  } catch (error) {
    return fail(writeError(error), 403);
  }
}

function placeholderSide(wilayahId: string, discipline: Discipline): SideSnapshot {
  return { wilayahId, players: Array.from({ length: playersPerSide(discipline) }, () => "—") };
}

/** Inline RR: points result. No draws. */
export async function setFinalScore(sideAId: string, sideBId: string, scoreA: number, scoreB: number) {
  const session = await requireCourt();
  if (!session.ok) return fail(session.error, 401);
  if (!sideAId || !sideBId || sideAId === sideBId) return fail("Pick two different wilayah.");
  if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0) {
    return fail("Enter a valid score (e.g. 13-7).");
  }
  if (scoreA === 0 && scoreB === 0) return fail("Enter a score for at least one side.");
  const discipline: Discipline = "MD";
  const listed = await listSportMatches<PentanqueMatch>("Pentanque");
  if (!listed.ok) return fail(listed.error, listed.status);
  const existing = listed.data.matches
    .filter((match) => sameWilayahPair(sideAId, sideBId, match))
    .sort((a, b) => b.id.localeCompare(a.id))[0];

  try {
    if (existing) {
      const oriented = orientScores(sideAId, sideBId, scoreA, scoreB, existing);
      const match = await patchMatch<PentanqueMatch>(existing.id, {
        pointsA: oriented.scoreA,
        pointsB: oriented.scoreB,
        status: "complete",
      });
      return ok({ match });
    }

    const match: PentanqueMatch & { courtId: string } = {
      id: newMatchId("pq"),
      sport: "Pentanque",
      discipline,
      laneId: session.court.id,
      lane: laneNameFromCourt(session.court.name),
      courtId: session.court.id,
      sideA: placeholderSide(sideAId, discipline),
      sideB: placeholderSide(sideBId, discipline),
      pointsA: scoreA,
      pointsB: scoreB,
      status: "complete",
    };
    await writeMatch(match);
    return ok({ match });
  } catch (error) {
    return fail(writeError(error), 403);
  }
}

export async function clearFinalScore(sideAId: string, sideBId: string) {
  return clearSportPairResult<PentanqueMatch>("Pentanque", sideAId, sideBId);
}
