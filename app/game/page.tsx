"use client";

import { useEffect, useState } from "react";
import { useMiniKit, useQuickAuth } from "@coinbase/onchainkit/minikit";
import { useAccount } from "wagmi";
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet";
import { GameCanvas } from "@/components/game/GameCanvas";
import { GameUI } from "@/components/game/GameUI";
import { useGameStart } from "@/lib/hooks/useGameStart";
import styles from "./game.module.css";

interface AuthResponse {
  success: boolean;
  user?: {
    fid: number;
    issuedAt?: number;
    expiresAt?: number;
  };
  token?: string;
  message?: string;
}

export default function GamePage() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const { address, isConnected } = useAccount();
  const { data: authData, isLoading: isAuthLoading } = useQuickAuth<AuthResponse>("/api/auth");

  const { startGame, isPending, isConfirming, isConfirmed, error } = useGameStart();

  const [gameState, setGameState] = useState<"idle" | "starting" | "playing" | "gameOver">("idle");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [level, setLevel] = useState(1);

  // Initialize MiniKit
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Handle game start transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      setGameState("playing");
    }
  }, [isConfirmed]);

  const handleStartClick = async () => {
    if (!authData?.success) {
      alert("Please authenticate first");
      return;
    }

    if (!isConnected) {
      alert("Please connect wallet to start game");
      return;
    }

    try {
      setGameState("starting");
      await startGame();
    } catch (err) {
      console.error("Failed to start game:", err);
      setGameState("idle");
      if ((err as any)?.message?.includes("User rejected")) {
        alert("Transaction cancelled");
      } else {
        alert("Failed to start game. Please try again.");
      }
    }
  };

  const handleGameOver = () => {
    setGameState("gameOver");
  };

  const handleRestart = () => {
    setGameState("idle");
    setScore(0);
    setLives(5);
    setLevel(1);
  };

  return (
    <div className={styles.container}>
      {/* Header with user info and wallet */}
      <header className={styles.header}>
        <div className={styles.userInfo}>
          {authData?.success ? (
            <>
              <span className={styles.username}>
                {context?.user?.displayName || `FID: ${authData.user?.fid}`}
              </span>
              <span className={styles.fid}>#{authData.user?.fid}</span>
            </>
          ) : (
            <span className={styles.username}>Not authenticated</span>
          )}
        </div>

        <Wallet>
          <ConnectWallet />
        </Wallet>
      </header>

      {/* Game UI (score, lives, level) */}
      <GameUI score={score} lives={lives} level={level} />

      {/* Game Canvas */}
      <div className={styles.gameWrapper}>
        {gameState === "idle" && (
          <div className={styles.startScreen}>
            <h1 className={styles.title}>BASE INVADERS</h1>
            <p className={styles.subtitle}>
              {!authData?.success
                ? "Authenticating..."
                : !isConnected
                ? "Connect wallet to play"
                : "Sign transaction to start game"}
            </p>

            {/* Debug info - shows auth and wallet status */}
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '1rem' }}>
              Auth: {authData?.success ? '✅' : '❌'} |
              Wallet: {isConnected ? '✅' : address ? `✅ ${address.slice(0,6)}...${address.slice(-4)}` : '❌'} |
              FID: {authData?.user?.fid || 'N/A'}
            </div>

            <button
              onClick={handleStartClick}
              disabled={!authData?.success || !isConnected || isPending || isConfirming}
              className={styles.startButton}
            >
              {isPending || isConfirming ? "Signing..." : "START GAME"}
            </button>
            {error && <p className={styles.error}>Error: {error.message}</p>}
          </div>
        )}

        {gameState === "starting" && (
          <div className={styles.startScreen}>
            <h2>Waiting for transaction...</h2>
            <p>Please sign the transaction to start</p>
          </div>
        )}

        {gameState === "playing" && (
          <GameCanvas
            onScoreUpdate={setScore}
            onLivesUpdate={setLives}
            onLevelUpdate={setLevel}
            onGameOver={handleGameOver}
          />
        )}

        {gameState === "gameOver" && (
          <div className={styles.gameOverScreen}>
            <h2 className={styles.gameOverTitle}>GAME OVER</h2>
            <div className={styles.finalStats}>
              <p>Score: {score}</p>
              <p>Level: {level}</p>
            </div>
            <button onClick={handleRestart} className={styles.restartButton}>
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
