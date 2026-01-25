"use client";

import styles from "./GameUI.module.css";

interface GameUIProps {
  score: number;
  lives: number;
  level: number;
}

export function GameUI({ score, lives, level }: GameUIProps) {
  return (
    <div className={styles.gameUI}>
      <div className={styles.stat}>
        <span className={styles.label}>SCORE</span>
        <span className={styles.value}>{score.toLocaleString()}</span>
      </div>

      <div className={styles.stat}>
        <span className={styles.label}>LEVEL</span>
        <span className={styles.value}>{level}</span>
      </div>

      <div className={styles.stat}>
        <span className={styles.label}>LIVES</span>
        <span className={styles.value}>
          {"❤️".repeat(lives)}
        </span>
      </div>
    </div>
  );
}
