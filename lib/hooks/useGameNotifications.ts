import { useState, useCallback } from 'react';

// Rate limiting: 1 notification per 30 seconds minimum
const MIN_NOTIFICATION_INTERVAL = 30000; // 30 seconds
const DAILY_LIMIT = 100;

// LocalStorage keys
const LAST_NOTIFICATION_KEY = 'lastNotificationTime';
const DAILY_COUNT_KEY = 'notificationDailyCount';
const DAILY_DATE_KEY = 'notificationDate';
const NOTIFICATIONS_ENABLED_KEY = 'notificationsEnabled';

interface NotificationOptions {
  title: string;
  body: string;
  targetUrl?: string;
}

export function useGameNotifications() {
  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    return stored !== 'false'; // Default to enabled
  });

  /**
   * Check if we're within rate limits
   */
  const checkRateLimits = (): boolean => {
    if (typeof window === 'undefined') return false;

    const now = Date.now();

    // Check time-based rate limit (30 seconds)
    const lastNotification = localStorage.getItem(LAST_NOTIFICATION_KEY);
    if (lastNotification && now - parseInt(lastNotification) < MIN_NOTIFICATION_INTERVAL) {
      console.log('⚠️ Notification rate limit: too soon since last notification');
      return false;
    }

    // Check daily limit
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem(DAILY_DATE_KEY);
    let dailyCount = 0;

    if (storedDate === today) {
      dailyCount = parseInt(localStorage.getItem(DAILY_COUNT_KEY) || '0');
      if (dailyCount >= DAILY_LIMIT) {
        console.log('⚠️ Notification rate limit: daily limit reached');
        return false;
      }
    } else {
      // New day, reset counter
      localStorage.setItem(DAILY_DATE_KEY, today);
      localStorage.setItem(DAILY_COUNT_KEY, '0');
    }

    return true;
  };

  /**
   * Update rate limit counters
   */
  const updateRateLimits = () => {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    const today = new Date().toDateString();

    localStorage.setItem(LAST_NOTIFICATION_KEY, now.toString());

    const storedDate = localStorage.getItem(DAILY_DATE_KEY);
    const dailyCount = storedDate === today
      ? parseInt(localStorage.getItem(DAILY_COUNT_KEY) || '0')
      : 0;

    localStorage.setItem(DAILY_COUNT_KEY, (dailyCount + 1).toString());
  };

  /**
   * Send a notification (respects rate limits and user preferences)
   */
  const sendNotification = useCallback(async (options: NotificationOptions): Promise<boolean> => {
    // Check if notifications are enabled
    if (!isEnabled) {
      console.log('ℹ️ Notifications disabled by user');
      return false;
    }

    // Check rate limits
    if (!checkRateLimits()) {
      return false;
    }

    // Validate input
    if (!options.title || options.title.length > 32) {
      console.error('❌ Notification title must be 1-32 characters');
      return false;
    }

    if (!options.body || options.body.length > 128) {
      console.error('❌ Notification body must be 1-128 characters');
      return false;
    }

    try {
      // Try to use OnchainKit's notification API if available
      // @ts-ignore - OnchainKit MiniKit API
      if (window.minikit?.sendNotification) {
        // @ts-ignore
        await window.minikit.sendNotification({
          title: options.title,
          body: options.body,
          targetUrl: options.targetUrl || window.location.origin,
        });

        updateRateLimits();
        console.log('✅ Notification sent:', options.title);
        return true;
      } else {
        console.warn('⚠️ MiniKit notification API not available');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      return false;
    }
  }, [isEnabled]);

  /**
   * Send notification for new high score
   */
  const notifyHighScore = useCallback(async (score: number) => {
    return sendNotification({
      title: 'New High Score!',
      body: `You scored ${score.toLocaleString()} points!`,
      targetUrl: '/',
    });
  }, [sendNotification]);

  /**
   * Send notification for entering top 10
   */
  const notifyTopTen = useCallback(async (rank: number) => {
    return sendNotification({
      title: "You're in Top 10!",
      body: `Rank #${rank} on the leaderboard!`,
      targetUrl: '/leaderboard',
    });
  }, [sendNotification]);

  /**
   * Send notification for boss approaching
   */
  const notifyBossApproaching = useCallback(async (level: number) => {
    return sendNotification({
      title: 'Boss Approaching!',
      body: `Prepare for boss battle at level ${level}!`,
      targetUrl: '/',
    });
  }, [sendNotification]);

  /**
   * Send notification for daily challenge
   */
  const notifyDailyChallenge = useCallback(async () => {
    return sendNotification({
      title: 'Daily Challenge Available',
      body: 'Complete today\'s challenge for bonus rewards!',
      targetUrl: '/',
    });
  }, [sendNotification]);

  /**
   * Toggle notifications on/off
   */
  const toggleNotifications = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled.toString());
    }
    console.log(`🔔 Notifications ${enabled ? 'enabled' : 'disabled'}`);
  }, []);

  /**
   * Get notification statistics
   */
  const getStats = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const today = new Date().toDateString();
    const storedDate = localStorage.getItem(DAILY_DATE_KEY);
    const dailyCount = storedDate === today
      ? parseInt(localStorage.getItem(DAILY_COUNT_KEY) || '0')
      : 0;

    const lastNotification = localStorage.getItem(LAST_NOTIFICATION_KEY);
    const timeSinceLast = lastNotification
      ? Date.now() - parseInt(lastNotification)
      : null;

    return {
      enabled: isEnabled,
      dailyCount,
      dailyLimit: DAILY_LIMIT,
      timeSinceLast,
      canSendNow: checkRateLimits(),
    };
  }, [isEnabled]);

  return {
    // Send methods
    sendNotification,
    notifyHighScore,
    notifyTopTen,
    notifyBossApproaching,
    notifyDailyChallenge,

    // Settings
    isEnabled,
    toggleNotifications,

    // Stats
    getStats,
  };
}
