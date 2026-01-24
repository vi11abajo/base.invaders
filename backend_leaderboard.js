import express from 'express';
import NodeCache from 'node-cache';
import pool from '../config/database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validateLeaderboardQuery } from '../middleware/validation.js';

const router = express.Router();

//cache for leaderboard (TTL from .env)
const cacheTTL = parseInt(process.env.LEADERBOARD_CACHE_TTL) || 30;
const cache = new NodeCache({ stdTTL: cacheTTL });

/**
 * GET /api/leaderboard/main
 * Main leaderboard (updated every 30 sec via cache)
 */
router.get('/main', optionalAuth, validateLeaderboardQuery, async (req, res) => {
  const limit = req.query.limit || 50;
  const offset = req.query.offset || 0;
  const cacheKey = `leaderboard_main_${limit}_${offset}`;

  try {
    //Check cache
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({
        leaderboard: cached.leaderboard,
        totalCount: cached.totalCount,
        cached: true,
        ttl: cache.getTtl(cacheKey),
      });
    }

    //Get total count of results
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM scores WHERE game_mode = 'classic'`
    );
    const totalCount = parseInt(countResult.rows[0].total);

    //Query to DB - all games of all players
    const result = await pool.query(
      `SELECT
         u.discord_id,
         u.username,
         u.avatar,
         s.score,
         s.level_reached,
         s.created_at
       FROM scores s
       JOIN users u ON s.user_id = u.id
       WHERE s.game_mode = 'classic'
       ORDER BY s.score DESC, s.created_at ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    //Form leaderboard
    const leaderboard = result.rows.map((row, index) => ({
      rank: offset + index + 1,
      discord_id: row.discord_id,
      username: row.username,
      avatar: row.avatar,
      score: row.score,
      level_reached: row.level_reached,
      created_at: row.created_at,
    }));

    //Save to cache for 5 minutes (300 seconds)
    const cacheData = { leaderboard, totalCount };
    cache.set(cacheKey, cacheData, 300);

    res.json({
      leaderboard,
      totalCount,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching main leaderboard:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to fetch leaderboard',
    });
  }
});

/**
 * GET /api/leaderboard/tournament/:tournamentId
 * Tournament leaderboard (real-time, without cache)
 */
router.get('/tournament/:tournamentId', optionalAuth, validateLeaderboardQuery, async (req, res) => {
  const { tournamentId } = req.params;
  const limit = req.query.limit || 100;

  try {
    //Check tournament existence
    const tournamentCheck = await pool.query(
      'SELECT * FROM tournaments WHERE id = $1',
      [tournamentId]
    );

    if (tournamentCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'TournamentNotFound',
        message: 'Tournament not found',
      });
    }

    const tournament = tournamentCheck.rows[0];

    //Get leaderboard
    const result = await pool.query(
      `SELECT
         u.discord_id,
         u.username,
         u.avatar,
         ts.score,
         ts.level_reached,
         ts.created_at,
         ROW_NUMBER() OVER (ORDER BY ts.score DESC) as rank
       FROM tournament_scores ts
       JOIN users u ON ts.user_id = u.id
       WHERE ts.tournament_id = $1
       ORDER BY ts.score DESC
       LIMIT $2`,
      [tournamentId, limit]
    );

    res.json({
      tournament: {
        id: tournament.id,
        name: tournament.name,
        status: tournament.status,
        start_time: tournament.start_time,
        end_time: tournament.end_time,
      },
      leaderboard: result.rows,
    });
  } catch (error) {
    console.error('Error fetching tournament leaderboard:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to fetch tournament leaderboard',
    });
  }
});

/**
 * GET /api/leaderboard/top-players
 * Top players by statistics
 */
router.get('/top-players', validateLeaderboardQuery, async (req, res) => {
  const limit = req.query.limit || 100;
  const sortBy = req.query.sortBy || 'best_score'; //best_score, total_games, avg_score

  const allowedSortFields = ['best_score', 'total_games', 'avg_score', 'max_level_reached', 'tournaments_won'];

  if (!allowedSortFields.includes(sortBy)) {
    return res.status(400).json({
      error: 'InvalidSortField',
      message: `sortBy must be one of: ${allowedSortFields.join(', ')}`,
    });
  }

  try {
    const result = await pool.query(
      `SELECT
         u.discord_id,
         u.username,
         u.avatar,
         us.best_score,
         us.total_games,
         us.avg_score,
         us.max_level_reached,
         us.tournaments_won,
         ROW_NUMBER() OVER (ORDER BY us.${sortBy} DESC) as rank
       FROM user_stats us
       JOIN users u ON us.user_id = u.id
       ORDER BY us.${sortBy} DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      topPlayers: result.rows,
      sortedBy: sortBy,
    });
  } catch (error) {
    console.error('Error fetching top players:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to fetch top players',
    });
  }
});

/**
 * GET /api/leaderboard/my-rank
 * Get your rank in general leaderboard
 */
router.get('/my-rank', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `WITH ranked_scores AS (
         SELECT
           user_id,
           MAX(score) as best_score,
           ROW_NUMBER() OVER (ORDER BY MAX(score) DESC) as rank
         FROM scores
         WHERE game_mode = 'classic'
         GROUP BY user_id
       )
       SELECT rank, best_score
       FROM ranked_scores
       WHERE user_id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        rank: null,
        best_score: 0,
        message: 'No scores yet',
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to fetch rank',
    });
  }
});

export default router;
