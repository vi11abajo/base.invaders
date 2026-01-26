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
        // Дождаться загрузки всех игровых скриптов (event-based, не polling)
        if (!window.gameScriptsLoaded) {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error("Game scripts failed to load within 10 seconds"));
            }, 10000);

            const handler = () => {
              clearTimeout(timeout);
              window.removeEventListener('gameScriptsLoaded', handler);
              resolve(true);
            };

            // Если уже загружено (между проверкой и установкой listener)
            if (window.gameScriptsLoaded) {
              clearTimeout(timeout);
              resolve(true);
              return;
            }

            window.addEventListener('gameScriptsLoaded', handler);
          });
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

        // Создать game instance с колбэками для обновления React state
        const game = new RegularGame({
          canvasId: canvas.id,
          onScoreUpdate: onScoreUpdate,
          onLivesUpdate: onLivesUpdate,
          onLevelUpdate: onLevelUpdate,
          onGameOver: onGameOver,
        });

        // Установить canvas вручную (если canvasId не работает)
        game.canvas = canvas;
        game.ctx = canvas.getContext("2d", { willReadFrequently: true });

        // Инициализировать игру
        await game.init();

        // Установить initial values
        onScoreUpdate(game.score || 0);
        onLivesUpdate(game.lives || 5);
        onLevelUpdate(game.level || 1);

        // Сохранить instance
        gameInstanceRef.current = game;

        // CRITICAL: Expose game instance globally for boost-system.js and other legacy scripts
        // Store in single location, create aliases for backwards compatibility
        (window as any).game = game;

        // Create getter aliases (no memory duplication, just references)
        Object.defineProperty(window, 'gameEngine', {
          get: () => (window as any).game,
          configurable: true
        });
        Object.defineProperty(window, 'gameInstance', {
          get: () => (window as any).game,
          configurable: true
        });

        (window as any).MAX_LIVES = 100; // Allow collecting up to 100 lives

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
      (window as any).gameInstance = null;
      (window as any).MAX_LIVES = null;
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
        width={720}
        height={1280}
        className={styles.canvas}
        style={{ display: isLoading || error ? 'none' : 'block' }}
      />
    </div>
  );
}
