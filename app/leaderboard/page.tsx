"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface LeaderboardEntry {
  rank: number;
  player: string;
  score: number;
  level: number;
  date: string;
}

type TimeFilter = 'all' | 'weekly' | 'daily';

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 50; // Показываем топ-50

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFilter, page]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/leaderboard?filter=${timeFilter}&page=${page}&limit=${ITEMS_PER_PAGE}`);
      const data = await response.json();
      setLeaderboard(data.entries || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeaderboard = searchQuery
    ? leaderboard.filter(entry =>
        entry.player.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : leaderboard;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => router.push('/')}
          aria-label="Back to game"
        >
          ← Back
        </button>
        <h1 className={styles.title}>Leaderboard</h1>
      </header>

      <div className={styles.controls}>
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${timeFilter === 'all' ? styles.active : ''}`}
            onClick={() => setTimeFilter('all')}
          >
            All Time
          </button>
          <button
            className={`${styles.filterButton} ${timeFilter === 'weekly' ? styles.active : ''}`}
            onClick={() => setTimeFilter('weekly')}
          >
            Weekly
          </button>
          <button
            className={`${styles.filterButton} ${timeFilter === 'daily' ? styles.active : ''}`}
            onClick={() => setTimeFilter('daily')}
          >
            Daily
          </button>
        </div>

        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search player..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Score</th>
                <th>Level</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaderboard.map((entry) => (
                <tr key={`${entry.rank}-${entry.player}`} className={entry.rank <= 3 ? styles.topThree : ''}>
                  <td className={styles.rank}>
                    {entry.rank === 1 && '🥇'}
                    {entry.rank === 2 && '🥈'}
                    {entry.rank === 3 && '🥉'}
                    {entry.rank > 3 && `#${entry.rank}`}
                  </td>
                  <td className={styles.player}>{entry.player}</td>
                  <td className={styles.score}>{entry.score.toLocaleString()}</td>
                  <td className={styles.level}>{entry.level}</td>
                  <td className={styles.date}>{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!searchQuery && filteredLeaderboard.length === ITEMS_PER_PAGE && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>Page {page}</span>
          <button
            className={styles.pageButton}
            onClick={() => setPage(p => p + 1)}
            disabled={filteredLeaderboard.length < ITEMS_PER_PAGE}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
