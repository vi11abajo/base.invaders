import { Server } from 'socket.io';
import pool from '../config/database.js';

let io = null;

/**
 * Initialize Socket.IO server
 */
export function initTournamentSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // Subscribe to tournament updates
    socket.on('subscribe_tournament', (tournamentId) => {
      const roomName = `tournament_${tournamentId}`;
      socket.join(roomName);
      console.log(`📡 Socket ${socket.id} subscribed to ${roomName}`);

      // Send current leaderboard immediately on subscription
      broadcastTournamentUpdate(tournamentId);
    });

    // Unsubscribe from tournament updates
    socket.on('unsubscribe_tournament', (tournamentId) => {
      const roomName = `tournament_${tournamentId}`;
      socket.leave(roomName);
      console.log(`📡 Socket ${socket.id} unsubscribed from ${roomName}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.IO server initialized');
  return io;
}

/**
 * Send tournament leaderboard update to all subscribers
 */
export async function broadcastTournamentUpdate(tournamentId) {
  if (!io) {
    console.warn('⚠️  Socket.IO not initialized');
    return;
  }

  try {
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
       LIMIT 50`,
      [tournamentId]
    );

    const roomName = `tournament_${tournamentId}`;
    io.to(roomName).emit('leaderboard_update', {
      tournamentId,
      leaderboard: result.rows,
      timestamp: new Date().toISOString(),
    });

    console.log(`📊 Broadcasted leaderboard update for tournament ${tournamentId} to ${roomName}`);
  } catch (error) {
    console.error('Error broadcasting tournament update:', error);
  }
}

/**
 * Send notification about tournament status change
 */
export async function broadcastTournamentStatusChange(tournamentId, status) {
  if (!io) {
    return;
  }

  const roomName = `tournament_${tournamentId}`;
  io.to(roomName).emit('tournament_status_change', {
    tournamentId,
    status,
    timestamp: new Date().toISOString(),
  });

  console.log(`🔔 Broadcasted status change for tournament ${tournamentId}: ${status}`);
}

/**
 * Get Socket.IO instance
 */
export function getSocketIO() {
  return io;
}

export default {
  initTournamentSocket,
  broadcastTournamentUpdate,
  broadcastTournamentStatusChange,
  getSocketIO,
};
