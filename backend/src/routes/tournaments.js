import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';
import { broadcastTournamentStatusChange } from '../sockets/tournamentSocket.js';

const router = express.Router();

/**
 * GET /api/tournaments
 * Get list of tournaments
 * Query params: status (optional), type (optional) - 'regular' or 'coraluna'
 */
router.get('/', optionalAuth, async (req, res) => {
  const status = req.query.status; // upcoming, active, finished
  const tournamentType = req.query.type; // 'regular' or 'coraluna'

  try {
    let query = 'SELECT * FROM tournaments';
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (tournamentType) {
      conditions.push(`tournament_type = $${params.length + 1}`);
      params.push(tournamentType);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY start_time DESC';

    const result = await pool.query(query, params);

    res.json({
      tournaments: result.rows,
    });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to fetch tournaments',
    });
  }
});

/**
 * GET /api/tournaments/active
 * Get current active tournament
 * Query params: type (optional) - 'regular' or 'coraluna'
 */
router.get('/active', optionalAuth, async (req, res) => {
  const tournamentType = req.query.type || 'regular'; // Default to 'regular' for backward compatibility

  try {
    const result = await pool.query(
      `SELECT * FROM tournaments
       WHERE status = 'active' AND NOW() BETWEEN start_time AND end_time
       AND tournament_type = $1
       ORDER BY start_time DESC
       LIMIT 1`,
      [tournamentType]
    );

    if (result.rows.length === 0) {
      return res.json({
        tournament: null,
        message: 'No active tournament',
      });
    }

    // Get number of participants
    const participantsResult = await pool.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM tournament_scores WHERE tournament_id = $1',
      [result.rows[0].id]
    );

    const tournament = result.rows[0];
    tournament.participant_count = parseInt(participantsResult.rows[0].count);

    res.json({
      tournament,
    });
  } catch (error) {
    console.error('Error fetching active tournament:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to fetch tournament',
    });
  }
});

/**
 * GET /api/tournaments/:id
 * Get tournament information
 */
router.get('/:id', optionalAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const tournamentResult = await pool.query(
      'SELECT * FROM tournaments WHERE id = $1',
      [id]
    );

    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({
        error: 'TournamentNotFound',
        message: 'Tournament not found',
      });
    }

    // Get number of participants
    const participantsResult = await pool.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM tournament_scores WHERE tournament_id = $1',
      [id]
    );

    const tournament = tournamentResult.rows[0];
    tournament.participants_count = parseInt(participantsResult.rows[0].count);

    res.json({
      tournament,
    });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to fetch tournament',
    });
  }
});

/**
 * GET /api/tournaments/active/current
 * Get current active tournament
 */
router.get('/active/current', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM tournaments
       WHERE status = 'active' AND NOW() BETWEEN start_time AND end_time
       ORDER BY start_time DESC
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.json({
        tournament: null,
        message: 'No active tournament',
      });
    }

    res.json({
      tournament: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching current tournament:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to fetch current tournament',
    });
  }
});

/**
 * POST /api/tournaments/create (Admin only)
 * Create and Start new tournament
 * Body params: name, duration, tournamentType (optional, defaults to 'regular')
 */
router.post('/create', authenticateToken, isAdmin, async (req, res) => {

  const { name, duration, tournamentType = 'regular' } = req.body;

  if (!name || !duration) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Name and duration are required',
    });
  }

  // Validate tournamentType
  if (!['regular', 'coraluna', 'xmas'].includes(tournamentType)) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Invalid tournament type. Must be "regular", "coraluna", or "xmas"',
    });
  }

  try {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 1000);

    const result = await pool.query(
      `INSERT INTO tournaments (name, start_time, end_time, status, tournament_type)
       VALUES ($1, $2, $3, 'active', $4)
       RETURNING *`,
      [name, startTime, endTime, tournamentType]
    );

    const tournament = result.rows[0];

    // Send event via Socket.IO
    broadcastTournamentStatusChange(tournament.id, 'active');

    res.json({
      success: true,
      tournament,
    });
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to create tournament',
    });
  }
});

/**
 * POST /api/tournaments/end-active (Admin only)
 * End active tournament
 */
router.post('/end-active', authenticateToken, isAdmin, async (req, res) => {

  try {
    // Find active tournament
    const activeResult = await pool.query(
      `SELECT * FROM tournaments WHERE status = 'active' ORDER BY start_time DESC LIMIT 1`
    );

    if (activeResult.rows.length === 0) {
      return res.status(404).json({
        error: 'NoActiveTournament',
        message: 'No active tournament to end',
      });
    }

    const tournamentId = activeResult.rows[0].id;

    // End tournament
    const result = await pool.query(
      `UPDATE tournaments
       SET status = 'finished', end_time = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [tournamentId]
    );

    // Send event via Socket.IO
    broadcastTournamentStatusChange(parseInt(tournamentId), 'finished');

    res.json({
      success: true,
      tournament: result.rows[0],
    });
  } catch (error) {
    console.error('Error ending tournament:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to end tournament',
    });
  }
});

/**
 * POST /api/tournaments/:id/end (Admin only)
 * End tournament by ID (deprecated, use /end-active)
 */
router.post('/:id/end', authenticateToken, isAdmin, async (req, res) => {

  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE tournaments
       SET status = 'finished', end_time = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'TournamentNotFound',
        message: 'Tournament not found',
      });
    }

    // Send event via Socket.IO
    broadcastTournamentStatusChange(parseInt(id), 'finished');

    res.json({
      success: true,
      tournament: result.rows[0],
    });
  } catch (error) {
    console.error('Error ending tournament:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to end tournament',
    });
  }
});

/**
 * POST /api/tournaments/submit-score
 * Submit score to tournament
 */
router.post('/submit-score', authenticateToken, async (req, res) => {
  const { tournamentId, score } = req.body;
  const userId = req.user.userId || req.user.id; // Support both variants

  console.log('Submit score request:', { tournamentId, score, userId, user: req.user });

  if (!tournamentId || score === undefined) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Tournament ID and score are required',
    });
  }

  if (!userId) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'User ID not found in token',
    });
  }

  try {
    // Check that tournament is active
    const tournamentResult = await pool.query(
      'SELECT * FROM tournaments WHERE id = $1 AND status = $2',
      [tournamentId, 'active']
    );

    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({
        error: 'TournamentNotActive',
        message: 'Tournament is not active',
      });
    }

    // Get current user record (if exists)
    const currentScoreResult = await pool.query(
      'SELECT score, attempts_count FROM tournament_scores WHERE tournament_id = $1 AND user_id = $2',
      [tournamentId, userId]
    );

    const currentScore = currentScoreResult.rows.length > 0 ? currentScoreResult.rows[0] : null;
    const attempts = currentScore ? currentScore.attempts_count : 0;

    // Check attempts limit
    if (attempts >= 3) {
      return res.status(400).json({
        error: 'MaxAttemptsReached',
        message: 'Maximum attempts (3) reached for this tournament',
      });
    }

    // UPSERT: Insert or update if new score is better
    const scoreResult = await pool.query(
      `INSERT INTO tournament_scores (tournament_id, user_id, score, attempts_count, created_at)
       VALUES ($1, $2, $3, 1, NOW())
       ON CONFLICT (tournament_id, user_id)
       DO UPDATE SET
         score = CASE
           WHEN EXCLUDED.score > tournament_scores.score THEN EXCLUDED.score
           ELSE tournament_scores.score
         END,
         attempts_count = tournament_scores.attempts_count + 1,
         created_at = CASE
           WHEN EXCLUDED.score > tournament_scores.score THEN NOW()
           ELSE tournament_scores.created_at
         END
       RETURNING *`,
      [tournamentId, userId, score]
    );

    const result = scoreResult.rows[0];
    const attemptsUsed = result.attempts_count;
    const improved = currentScore ? score > currentScore.score : true;

    res.json({
      success: true,
      score: result.score,
      attemptsUsed: attemptsUsed,
      improved: improved,
    });
  } catch (error) {
    console.error('Error submitting tournament score:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to submit score',
    });
  }
});

/**
 * PATCH /api/tournaments/:id/status (Admin only - for future)
 * Change tournament status
 */
router.patch('/:id/status', authenticateToken, isAdmin, async (req, res) => {

  const { id } = req.params;
  const { status } = req.body;

  if (!['upcoming', 'active', 'finished', 'cancelled'].includes(status)) {
    return res.status(400).json({
      error: 'InvalidStatus',
      message: 'Status must be: upcoming, active, finished, or cancelled',
    });
  }

  try {
    const result = await pool.query(
      'UPDATE tournaments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'TournamentNotFound',
        message: 'Tournament not found',
      });
    }

    // Send event via Socket.IO
    broadcastTournamentStatusChange(parseInt(id), status);

    res.json({
      success: true,
      tournament: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating tournament status:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to update tournament status',
    });
  }
});

export default router;
