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

  console.log("🎮 [GameCanvas] Component mounted/rendered");

  useEffect(() => {
    console.log("🎮 [GameCanvas] useEffect triggered, canvasRef:", !!canvasRef.current);
    if (!canvasRef.current) {
      console.warn("🎮 [GameCanvas] Canvas ref not ready, skipping init");
      return;
    }

    let mounted = true;

    const initGame = async () => {
      try {
        console.log("🎮 [GameCanvas] Starting game initialization...");

        // Дождаться загрузки всех игровых скриптов
        let retries = 0;
        while (!window.gameScriptsLoaded) {
          if (retries > 100) {
            throw new Error("Game scripts failed to load within timeout");
          }
          console.log(`⏳ [GameCanvas] Waiting for game scripts to load... (${retries}/100)`);
          await new Promise(resolve => setTimeout(resolve, 200));
          retries++;
        }
        console.log("✅ [GameCanvas] All game scripts loaded");

        // Verify critical dependencies are available
        if (!window.preloadManager || !window.soundManager) {
          throw new Error("Critical game dependencies missing (preloadManager or soundManager)");
        }
        console.log("✅ [GameCanvas] Critical dependencies verified");

        // Загрузить ресурсы через preloadManager
        console.log("🎮 [GameCanvas] Loading game resources...");
        await window.preloadManager.loadAll();
        console.log("✅ [GameCanvas] Game resources loaded");

        // Динамическая загрузка игрового движка
        // @ts-ignore - игровой движок в vanilla JS
        console.log("🎮 [GameCanvas] Importing game engine...");
        const { RegularGame } = await import("@/game/game.js");
        console.log("🎮 [GameCanvas] Game engine imported successfully");

        if (!mounted) {
          console.log("🎮 [GameCanvas] Component unmounted, aborting");
          return;
        }

        const canvas = canvasRef.current;
        if (!canvas) {
          console.error("🎮 [GameCanvas] Canvas ref is null");
          return;
        }

        console.log("🎮 [GameCanvas] Creating RegularGame instance...");
        // Создать game instance
        const game = new RegularGame({
          canvasId: canvas.id,
        });

        // Установить canvas вручную (если canvasId не работает)
        game.canvas = canvas;
        game.ctx = canvas.getContext("2d", { willReadFrequently: true });
        console.log("🎮 [GameCanvas] RegularGame instance created");

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
        console.log("🎮 [GameCanvas] Initializing game...");
        await game.init();
        console.log("🎮 [GameCanvas] Game initialized");

        // Установить initial values
        onScoreUpdate(game.score || 0);
        onLivesUpdate(game.lives || 5);
        onLevelUpdate(game.level || 1);

        // Сохранить instance
        gameInstanceRef.current = game;

        // Запустить игру
        console.log("🎮 [GameCanvas] Starting game...");
        game.start();
        console.log("🎮 [GameCanvas] Game started successfully! ✅");

        setIsLoading(false);
      } catch (err) {
        console.error("❌ [GameCanvas] Failed to initialize game:", err);
        console.error("❌ [GameCanvas] Error details:", {
          message: (err as Error).message,
          stack: (err as Error).stack,
        });
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
