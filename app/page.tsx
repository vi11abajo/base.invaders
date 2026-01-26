"use client";

import { useEffect, useState, useCallback } from "react";
import { useMiniKit, useQuickAuth } from "@coinbase/onchainkit/minikit";
import { useAccount } from "wagmi";
import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet";
import { GameCanvas } from "@/components/game/GameCanvas";
import { GameUI } from "@/components/game/GameUI";
import { NavigationMenu } from "@/components/navigation/NavigationMenu";
import { useGameStart } from "@/lib/hooks/useGameStart";
import styles from "./page.module.css";

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

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const { address, isConnected } = useAccount();
  const { data: authData, isLoading: isAuthLoading } = useQuickAuth<AuthResponse>("/api/auth");

  const { startGame, hash, isPending, isConfirming, isConfirmed, error } = useGameStart();

  const [gameState, setGameState] = useState<"idle" | "starting" | "playing" | "gameOver">("idle");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [level, setLevel] = useState(1);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

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

  // Memoize callbacks to prevent GameCanvas re-mounting
  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);
  const handleLivesUpdate = useCallback((newLives: number) => {
    setLives(newLives);
  }, []);
  const handleLevelUpdate = useCallback((newLevel: number) => {
    setLevel(newLevel);
  }, []);
  const handleGameOver = useCallback(() => setGameState("gameOver"), []);

  const handleStartClick = async () => {
    if (!isConnected) {
      alert("Please connect wallet to start game");
      return;
    }

    try {
      setGameState("starting");
      await startGame();
    } catch (err) {
      console.error("❌ [GamePage] Failed to start game:", err);
      setGameState("idle");
      if ((err as any)?.message?.includes("User rejected")) {
        alert("Transaction cancelled");
      } else {
        alert("Failed to start game. Please try again.");
      }
    }
  };

  const handleRestart = () => {
    setGameState("idle");
    setScore(0);
    setLives(5);
    setLevel(1);
  };

  return (
    <div className={styles.container}>
      {/* Header with navigation menu and wallet */}
      <header className={styles.header}>
        <NavigationMenu
          username={context?.user?.displayName || 'Player'}
          avatar={context?.user?.pfpUrl}
          isConnected={isConnected}
        />

        <Wallet>
          <ConnectWallet />
        </Wallet>
      </header>

      {/* Game UI (score, lives, level) */}
      <GameUI score={score} lives={lives} level={level} />

      {/* Game Canvas */}
      <div className={styles.gameWrapper}>
        {/* How to Play Button */}
        <button
          className={styles.howToPlayButton}
          onClick={() => setShowHowToPlay(true)}
          aria-label="How to play"
        >
          <span className={styles.howToPlayIcon}>❓</span>
          <span className={styles.howToPlayText}>How to Play</span>
        </button>

        {/* How to Play Popup */}
        {showHowToPlay && (
          <div className={styles.popupOverlay} onClick={() => setShowHowToPlay(false)}>
            <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
              <button
                className={styles.popupClose}
                onClick={() => setShowHowToPlay(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className={styles.popupTitle}>How to Play?</h2>
              <div className={styles.popupInstructions}>
                <div className={styles.popupItem}>
                  <span className={styles.popupNumber}>1</span>
                  <p>Tap and drag Octopi across the screen to shoot and dodge bullets</p>
                </div>
                <div className={styles.popupItem}>
                  <span className={styles.popupNumber}>2</span>
                  <p>Destroy waves of enemies, defeat bosses, and earn points</p>
                </div>
                <div className={styles.popupItem}>
                  <span className={styles.popupNumber}>3</span>
                  <p>Use boosts to improve your results</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {gameState === "idle" && (
          <div className={styles.startScreen}>
            <h1 className={styles.title}>
              <span className={styles.titleSquare}>⬜</span>sea<br/>invaders
            </h1>
            <p className={styles.subtitle}>
              Defend against the alien invasion!
            </p>

            {/* Onboarding instructions */}
            <div className={styles.onboarding}>
              <div className={styles.onboardingItem}>
                <span className={styles.onboardingIcon}>🚀</span>
                <div className={styles.onboardingText}>
                  <strong>Epic Space Battles</strong>
                  <p>Destroy alien waves, defeat bosses, and compete on the global leaderboard!</p>
                </div>
              </div>
              <div className={styles.onboardingItem}>
                <span className={styles.onboardingIcon}>⚡</span>
                <div className={styles.onboardingText}>
                  <strong>Powered by Base</strong>
                  <p>Onchain gameplay with sponsored transactions - play for free!</p>
                </div>
              </div>
              <div className={styles.onboardingItem}>
                <span className={styles.onboardingIcon}>🏆</span>
                <div className={styles.onboardingText}>
                  <strong>Compete Globally</strong>
                  <p>{!isConnected ? "Connect wallet to join the action" : "Start your journey to the top!"}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartClick}
              disabled={!isConnected || isPending || isConfirming}
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
            {!hash && <p>Please sign the transaction to start</p>}
            {hash && (
              <>
                <p>Transaction submitted!</p>
                <div className={styles.txInfo}>
                  <span className={styles.txHash}>
                    TX: {hash.slice(0, 10)}...{hash.slice(-8)}
                  </span>
                  <button
                    className={styles.copyButton}
                    onClick={() => {
                      navigator.clipboard.writeText(hash);
                      alert('Transaction hash copied!');
                    }}
                    aria-label="Copy transaction hash"
                  >
                    Copy
                  </button>
                </div>
                <p style={{ fontSize: '14px', marginTop: '1rem' }}>
                  {isConfirming ? 'Confirming...' : 'Confirmed! Starting game...'}
                </p>
              </>
            )}
          </div>
        )}

        {gameState === "playing" && (
          <GameCanvas
            onScoreUpdate={handleScoreUpdate}
            onLivesUpdate={handleLivesUpdate}
            onLevelUpdate={handleLevelUpdate}
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
