"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./GameCanvas.module.css";

interface GameCanvasProps {
  onScoreUpdate: (score: number) => void;
  onLivesUpdate: (lives: number) => void;
  onLevelUpdate: (level: number) => void;
  onGameOver: () => void;
}

export function GameCanvas({
  onScoreUpdate,
  onLivesUpdate,
  onLevelUpdate,
  onGameOver,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    let mounted = true;

    const initGame = async () => {
      try {
        // Динамическая загрузка игрового движка
        // @ts-ignore - игровой движок в vanilla JS
        const { RegularGame } = await import("@/game/game.js");

        if (!mounted) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Создать game instance
        const game = new RegularGame({
          canvasId: canvas.id,
        });

        // Установить canvas вручную (если canvasId не работает)
        game.canvas = canvas;
        game.ctx = canvas.getContext("2d", { willReadFrequently: true });

        // Подключить callbacks для обновления React state
        const originalUpdateScore = game.updateScore?.bind(game);
        game.updateScore = function (points: number) {
          if (originalUpdateScore) originalUpdateScore(points);
          onScoreUpdate(this.score);
        };

        const originalTakeDamage = game.takeDamage?.bind(game);
        game.takeDamage = function () {
          if (originalTakeDamage) originalTakeDamage();
          onLivesUpdate(this.lives);
        };

        const originalLevelUp = game.levelUp?.bind(game);
        game.levelUp = function () {
          if (originalLevelUp) originalLevelUp();
          onLevelUpdate(this.level);
        };

        const originalHandleGameOver = game.handleGameOver?.bind(game);
        game.handleGameOver = async function () {
          if (originalHandleGameOver) await originalHandleGameOver();
          onGameOver();
        };

        // Инициализировать игру
        await game.init();

        // Установить initial values
        onScoreUpdate(game.score || 0);
        onLivesUpdate(game.lives || 5);
        onLevelUpdate(game.level || 1);

        // Сохранить instance
        gameInstanceRef.current = game;

        // Запустить игру
        game.start();

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to initialize game:", err);
        setError("Failed to load game. Please refresh the page.");
        setIsLoading(false);
      }
    };

    initGame();

    // Cleanup
    return () => {
      mounted = false;
      if (gameInstanceRef.current) {
        try {
          gameInstanceRef.current.stop?.();
          gameInstanceRef.current.destroy?.();
        } catch (err) {
          console.error("Error cleaning up game:", err);
        }
      }
    };
  }, [onScoreUpdate, onLivesUpdate, onLevelUpdate, onGameOver]);

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Refresh</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Loading game...</p>
      </div>
    );
  }

  return (
    <div className={styles.canvasContainer}>
      <canvas
        ref={canvasRef}
        id="gameCanvas"
        width={800}
        height={600}
        className={styles.canvas}
      />
    </div>
  );
}
