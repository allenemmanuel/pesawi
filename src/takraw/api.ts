import type { Discipline, GameScore, SideSnapshot, TakrawMatch } from "./types";
import { analyzeGames } from "./rules";
import { courtName } from "../badminton/courts";
import { playersPerSide } from "./types";
import { clearSportPairResult } from "../lib/clearFinalScore";
import { orientScores, sameWilayahPair, synthesizeGameWins } from "../lib/finalScore";
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
  return listSportMatches<TakrawMatch>("Sepak Takraw");
}

export function subscribeMatches(onChange: (matches: TakrawMatch[]) => void) {
  return subscribeSportMatches<TakrawMatch>("Sepak Takraw", onChange);
}

export async function createMatch(draft: {
  discipline: Discipline;
  sideA: SideSnapshot;
  sideB: SideSnapshot;
}) {
  const session = await requireCourt();
  if (!session.ok) return fail(session.error, 401);
  const match: TakrawMatch = {
    id: newMatchId("tk"),
    sport: "Sepak Takraw",
    discipline: draft.discipline,
    courtId: session.court.id,
    court: courtName(session.court.id),
    sideA: draft.sideA,
    sideB: draft.sideB,
    games: [],
    status: "scheduled",
  };
  try {
    await writeMatch(match);
    return ok({ match });
  } catch (error) {
    return fail(writeError(error), 403);
  }
}

export async function patchMatchGames(id: string, games: GameScore[]) {
  const session = await requireCourt();
  if (!session.ok) return fail(session.error, 401);
  const current = await readMatch<TakrawMatch>(id);
  if (!current) return fail("Match not found.", 404);
  if (current.courtId !== session.court.id) return fail("This match belongs to another court.", 403);
  if (current.status === "complete") return fail("This match is locked.", 409);
  const analysis = analyzeGames(games);
  if (!analysis.canSave) return fail(analysis.issues[0] ?? "Score cannot be saved.");
  try {
    const match = await patchMatch<TakrawMatch>(id, {
      games,
      status: games.length > 0 ? "live" : "scheduled",
    });
    return ok({ match });
  } catch (error) {
    return fail(writeError(error), 403);
  }
}

export async function postCompleteMatch(id: string, games: GameScore[]) {
  const session = await requireCourt();
  if (!session.ok) return fail(session.error, 401);
  const current = await readMatch<TakrawMatch>(id);
  if (!current) return fail("Match not found.", 404);
  if (current.courtId !== session.court.id) return fail("This match belongs to another court.", 403);
  const analysis = analyzeGames(games);
  if (!analysis.canComplete) return fail(analysis.issues[0] ?? "Match cannot be completed yet.");
  try {
    const match = await patchMatch<TakrawMatch>(id, { games, status: "complete" });
    return ok({ match });
  } catch (error) {
    return fail(writeError(error), 403);
  }
}

function placeholderSide(wilayahId: string, discipline: Discipline): SideSnapshot {
  return { wilayahId, players: Array.from({ length: playersPerSide(discipline) }, () => "—") };
}

export async function setFinalScore(sideAId: string, sideBId: string, scoreA: number, scoreB: number) {
  const session = await requireCourt();
  if (!session.ok) return fail(session.error, 401);
  if (!sideAId || !sideBId || sideAId === sideBId) return fail("Pick two different wilayah.");
  if (scoreA === 0 && scoreB === 0) return fail("Enter a score for at least one side.");
  const gamesForTyped = synthesizeGameWins(scoreA, scoreB, 15);
  if (!gamesForTyped) return fail("Enter a valid score (e.g. 3-1).");

  const discipline: Discipline = "MR";
  const listed = await listSportMatches<TakrawMatch>("Sepak Takraw");
  if (!listed.ok) return fail(listed.error, listed.status);
  const existing = listed.data.matches
    .filter((match) => sameWilayahPair(sideAId, sideBId, match))
    .sort((a, b) => b.id.localeCompare(a.id))[0];

  try {
    if (existing) {
      const oriented = orientScores(sideAId, sideBId, scoreA, scoreB, existing);
      const games = synthesizeGameWins(oriented.scoreA, oriented.scoreB, 15);
      if (!games) return fail("Enter a valid score (e.g. 3-1).");
      const match = await patchMatch<TakrawMatch>(existing.id, { games, status: "complete" });
      return ok({ match });
    }

    const match: TakrawMatch = {
      id: newMatchId("tk"),
      sport: "Sepak Takraw",
      discipline,
      courtId: session.court.id,
      court: courtName(session.court.id),
      sideA: placeholderSide(sideAId, discipline),
      sideB: placeholderSide(sideBId, discipline),
      games: gamesForTyped,
      status: "complete",
    };
    await writeMatch(match);
    return ok({ match });
  } catch (error) {
    return fail(writeError(error), 403);
  }
}

export async function clearFinalScore(sideAId: string, sideBId: string) {
  return clearSportPairResult<TakrawMatch>("Sepak Takraw", sideAId, sideBId);
}
