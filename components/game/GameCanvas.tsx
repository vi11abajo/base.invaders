"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./GameCanvas.module.css";

// Type declarations for global game objects
declare global {
  interface Window {
    preloadManager: any;
    soundManager: any;
    BoostManager: any;
    BossSystemV2: any;
    gameSessionManager: any;
    themeManager: any;
    PerformanceOptimizer: any;
    PerformanceMonitor: any;
    gameScriptsLoaded: boolean;
  }
}

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
        // Дождаться загрузки всех игровых скриптов
        let retries = 0;
        while (!window.gameScriptsLoaded) {
          if (retries > 100) {
            throw new Error("Game scripts failed to load within timeout");
          }
          await new Promise(resolve => setTimeout(resolve, 200));
          retries++;
        }

        // Verify critical dependencies are available
        if (!window.preloadManager || !window.soundManager) {
          throw new Error("Critical game dependencies missing");
        }

        // Загрузить ресурсы через preloadManager
        await window.preloadManager.loadAll();

        // Динамическая загрузка игрового движка
        // @ts-ignore - игровой движок в vanilla JS
        const { RegularGame } = await import("@/game/game.js");

        if (!mounted) return;

        const canvas = canvasRef.current;
        if (!canvas) {
          console.error("❌ Canvas ref is null");
          return;
        }

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

        // CRITICAL: Expose game instance globally for boost-system.js and other legacy scripts
        (window as any).gameEngine = game;
        (window as any).game = game;

        // Запустить игру
        game.start();

        setIsLoading(false);
      } catch (err) {
        console.error("❌ [GameCanvas] Failed to initialize:", err);
        setError(`Failed to load game: ${(err as Error).message}`);
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
          console.error("❌ Cleanup error:", err);
        }
      }
      // Clean up global references
      (window as any).gameEngine = null;
      (window as any).game = null;
    };
  }, [onScoreUpdate, onLivesUpdate, onLevelUpdate, onGameOver]);

  return (
    <div className={styles.canvasContainer}>
      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
      )}

      {isLoading && !error && (
        <div className={styles.loading}>
          <p>Loading game...</p>
        </div>
      )}

      {/* Always render canvas so ref is available */}
      <canvas
        ref={canvasRef}
        id="gameCanvas"
        width={800}
        height={600}
        className={styles.canvas}
        style={{ display: isLoading || error ? 'none' : 'block' }}
      />
    </div>
  );
}
