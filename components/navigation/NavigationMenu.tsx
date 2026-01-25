"use client";

import { useState } from "react";
import styles from "./NavigationMenu.module.css";

interface NavigationMenuProps {
  username?: string;
  avatar?: string;
  fid?: number;
  isConnected: boolean;
}

export function NavigationMenu({ username, avatar, fid, isConnected }: NavigationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleNavigation = (section: string) => {
    console.log(`Navigate to: ${section}`);
    // TODO: Implement navigation logic
    closeMenu();
  };

  return (
    <div className={styles.navigationMenu}>
      <button
        className={styles.menuButton}
        onClick={toggleMenu}
        aria-label="Navigation menu"
        aria-expanded={isOpen}
      >
        {avatar ? (
          <img src={avatar} alt={username || "User"} className={styles.avatar} />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {username?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        <div className={styles.userDetails}>
          <span className={styles.username}>
            {username || (isConnected ? "Player" : "Connect Wallet")}
          </span>
          {fid && <span className={styles.fid}>#{fid}</span>}
        </div>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={closeMenu} />
          <div className={styles.dropdown}>
            <button
              className={styles.menuItem}
              onClick={() => handleNavigation("game")}
            >
              <span className={styles.menuIcon}>🎮</span>
              <span>Game</span>
            </button>
            <button
              className={styles.menuItem}
              onClick={() => handleNavigation("leaderboard")}
            >
              <span className={styles.menuIcon}>🏆</span>
              <span>Leaderboard</span>
            </button>
            <button
              className={styles.menuItem}
              onClick={() => handleNavigation("wiki")}
            >
              <span className={styles.menuIcon}>📖</span>
              <span>Wiki</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
