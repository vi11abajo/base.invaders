import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { gameMode = 'classic', tournamentId } = body;

    // Create game session
    const result = await pool.query(
      `INSERT INTO game_sessions (user_id, game_mode, tournament_id, started_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, user_id, game_mode, tournament_id, started_at`,
      [user.userId, gameMode, tournamentId || null]
    );

    const session = result.rows[0];

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      gameMode: session.game_mode,
      tournamentId: session.tournament_id,
      startedAt: session.started_at,
    });
  } catch (error) {
    console.error('❌ Session start error:', error);
    return NextResponse.json(
      {
        error: 'ServerError',
        message: error instanceof Error ? error.message : 'Failed to start session',
      },
      { status: 500 }
    );
  }
}
