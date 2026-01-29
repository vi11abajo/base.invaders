"use client";

import styles from "./UserInfo.module.css";

interface UserInfoProps {
  username?: string;
  avatar?: string;
  isConnected: boolean;
}

export function UserInfo({ username, avatar, isConnected }: UserInfoProps) {
  if (!isConnected || !username) {
    return null;
  }

  return (
    <div className={styles.userInfo}>
      <span className={styles.username}>{username}</span>
      {avatar && (
        <img
          src={avatar}
          alt={username}
          className={styles.avatar}
        />
      )}
    </div>
  );
}
