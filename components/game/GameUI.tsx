"use client";

import styles from "./GameUI.module.css";

interface GameUIProps {
  score: number;
  lives: number;
  level: number;
}

export function GameUI({ score, lives, level }: GameUIProps) {
  // Ensure score is a valid number
  const displayScore = typeof score === 'number' && !isNaN(score) ? score : 0;

  // Ensure lives is a valid number
  const displayLives = typeof lives === 'number' && !isNaN(lives) && lives >= 0 ? lives : 0;

  // Ensure level is a valid number
  const displayLevel = typeof level === 'number' && !isNaN(level) && level >= 1 ? level : 1;

  // Format lives display
  const formatLives = (livesCount: number): string => {
    if (livesCount <= 5) {
      // Show exact number of hearts for 5 or fewer
      return '❤'.repeat(livesCount);
    } else {
      // Show count + "x" + single heart for 6 or more
      return `${livesCount}x❤`;
    }
  };

  return (
    <div className={styles.gameUI}>
      <div className={styles.stat}>
        <span className={styles.label}>SCORE</span>
        <span className={styles.value}>{displayScore.toLocaleString()}</span>
      </div>

      <div className={styles.stat}>
        <span className={styles.label}>LEVEL</span>
        <span className={styles.value}>{displayLevel}</span>
      </div>

      <div className={styles.stat}>
        <span className={styles.label}>LIVES</span>
        <span className={styles.value}>
          {formatLives(displayLives)}
        </span>
      </div>
    </div>
  );
}
