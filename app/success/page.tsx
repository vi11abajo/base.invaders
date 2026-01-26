"use client";

import { minikitConfig } from "../../minikit.config";
import styles from "./page.module.css";

export default function Success() {

  const handleShare = async () => {
    const text = `Yay! I just joined the waitlist for ${minikitConfig.miniapp.name.toUpperCase()}! `;
    const url = process.env.NEXT_PUBLIC_URL || window.location.origin;

    // Try Web Share API first (native mobile/desktop share)
    if (navigator.share) {
      try {
        await navigator.share({
          title: minikitConfig.miniapp.name,
          text: text,
          url: url,
        });
        console.log("Shared successfully");
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error("Error sharing:", error);
          // Fallback to clipboard
          copyToClipboard(`${text}${url}`);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      copyToClipboard(`${text}${url}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
    }).catch((error) => {
      console.error("Failed to copy:", error);
    });
  };

  return (
    <div className={styles.container}>
      <button className={styles.closeButton} type="button">
        ✕
      </button>
      
      <div className={styles.content}>
        <div className={styles.successMessage}>
          <div className={styles.checkmark}>
            <div className={styles.checkmarkCircle}>
              <div className={styles.checkmarkStem}></div>
              <div className={styles.checkmarkKick}></div>
            </div>
          </div>
          
          <h1 className={styles.title}>Welcome to the {minikitConfig.miniapp.name.toUpperCase()}!</h1>
          
          <p className={styles.subtitle}>
            You&apos;re in! We&apos;ll notify you as soon as we launch.<br />
            Get ready to experience the future of onchain marketing.
          </p>

          <button onClick={handleShare} className={styles.shareButton}>
            SHARE
          </button>
        </div>
      </div>
    </div>
  );
}
