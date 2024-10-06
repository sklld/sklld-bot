import {
  BlitzkitResponse,
  BlitzkitResponseError,
  fetchTankDefinitions,
  isValidBlitzId,
  StarsInt,
  TANK_VOTE_CATEGORIES,
  TankVoteCategory,
  usersDatabase,
} from '@blitzkit/core';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const tankId = Number(params.id);
  const tankDefinitions = await fetchTankDefinitions();

  if (isNaN(tankId) || !tankDefinitions.tanks[tankId]) {
    return NextResponse.json({
      status: 'error',
      error: 'INVALID_TANK_ID',
    } satisfies BlitzkitResponseError);
  }

  const blitzIdString = request.nextUrl.searchParams.get('player');
  const blitzId = Number(blitzIdString);
  const blitzToken = request.nextUrl.searchParams.get('token');

  if (blitzIdString === null || blitzToken === null) {
    return NextResponse.json({
      status: 'error',
      error: 'UNDEFINED_TOKEN_OR_PLAYER_ID',
    } satisfies BlitzkitResponseError);
  }

  if (
    blitzIdString !== null &&
    (!(await isValidBlitzId(blitzId, blitzToken ?? undefined)) ||
      isNaN(blitzId))
  ) {
    return NextResponse.json({
      status: 'error',
      error: 'INVALID_TOKEN_OR_PLAYER_ID',
    } satisfies BlitzkitResponseError);
  }

  const votes: Partial<Record<TankVoteCategory, StarsInt>> = {};
  let recognizedVoteCategories = 0;

  for (const category of TANK_VOTE_CATEGORIES) {
    const voteRaw = request.nextUrl.searchParams.get(category);

    if (voteRaw === null) continue;

    const vote = Number(voteRaw);

    if (isNaN(vote) || !Number.isInteger(vote) || vote < 1 || vote > 5) {
      return NextResponse.json({
        status: 'error',
        error: 'INVALID_VOTE',
      } satisfies BlitzkitResponseError);
    }

    votes[category] = vote as StarsInt;
    recognizedVoteCategories++;
  }

  if (recognizedVoteCategories === 0) {
    return NextResponse.json({
      status: 'error',
      error: 'NO_VOTES',
    } satisfies BlitzkitResponseError);
  }

  try {
    await usersDatabase.user.upsert({
      where: { blitz_id: blitzId },
      update: {
        last_used: new Date(),
        tank_votes: {
          upsert: {
            where: { id: tankId },
            update: { ...votes, last_updated: new Date() },
            create: { ...votes, id: tankId, last_updated: new Date() },
          },
        },
      },
      create: {
        blitz_id: blitzId,
        last_used: new Date(),
        tank_votes: {
          create: { ...votes, id: tankId, last_updated: new Date() },
        },
      },
    });

    return NextResponse.json({
      status: 'ok',
      data: undefined,
    } satisfies BlitzkitResponse);
  } catch (message) {
    return NextResponse.json({
      status: 'error',
      error: 'DATABASE_ERROR',
      message,
    } satisfies BlitzkitResponseError);
  }
}