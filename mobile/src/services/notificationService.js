import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIF_IDENTIFIER_7AM_KEY = '@pantry_fresh_daily_7am_id';
const NOTIF_IDENTIFIER_8AM_KEY = '@pantry_fresh_daily_8am_id';
const NOTIF_IDENTIFIER_KEY = NOTIF_IDENTIFIER_7AM_KEY;

// Configure foreground notification behavior
if (Platform.OS !== 'web' && Notifications && typeof Notifications.setNotificationHandler === 'function') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority?.MAX || 'max',
      }),
    });
  } catch (err) {
    console.warn('[Notification Service] Handler setup error:', err.message);
  }
}

/**
 * Safe scheduler that works both in standalone builds and Expo Go (gracefully dropping channelId if rejected)
 */
export const safeScheduleNotificationAsync = async (request) => {
  if (!Notifications || !Notifications.scheduleNotificationAsync) return null;
  try {
    return await Notifications.scheduleNotificationAsync(request);
  } catch (err) {
    if (request.trigger && typeof request.trigger === 'object' && request.trigger.channelId) {
      const fallbackTrigger = { ...request.trigger };
      delete fallbackTrigger.channelId;
      try {
        return await Notifications.scheduleNotificationAsync({
          ...request,
          trigger: fallbackTrigger,
        });
      } catch (err2) {
        console.warn('[Notification Service] SafeSchedule Fallback:', err2.message);
      }
    }
    throw err;
  }
};

/**
 * Request notification permissions and setup Android notification channel
 */
export const registerForPushNotifications = async () => {
  if (Platform.OS === 'web' || !Notifications || !Notifications.getPermissionsAsync) {
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Notification Service] Notification permissions not granted:', finalStatus);
      return false;
    }

    // Configure MAX importance channels on Android (safely protected for Expo Go)
    if (Platform.OS === 'android' && typeof Notifications.setNotificationChannelAsync === 'function') {
      try {
        await Notifications.setNotificationChannelAsync('pantry-expiry-channel', {
          name: 'Pantry Expiry Reminders',
          description: 'Daily alerts at 7:00 AM & 8:00 AM notifying items expiring soon',
          importance: Notifications.AndroidImportance?.MAX || 5,
          vibrationPattern: [0, 250, 250, 250],
          sound: 'default',
          enableVibrate: true,
          enableLights: true,
          lightColor: '#E4572E',
          showBadge: true,
        });

        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default Alerts',
          importance: Notifications.AndroidImportance?.MAX || 5,
          vibrationPattern: [0, 250, 250, 250],
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
      } catch (channelErr) {
        // Expo Go SDK 53+ does not support NotificationsChannelsProvider natively; safe to continue
        console.log('[Notification Service] Channels skipped in Expo Go, using default OS channel.');
      }
    }

    return true;
  } catch (err) {
    console.warn('[Notification Service Error]', err.message);
    return false;
  }
};

/**
 * Schedule recurring Daily 7:00 AM and 8:00 AM Expiry Notifications
 * @param {Array} items - List of pantry items to analyze for upcoming expiration
 */
export const scheduleDailyMorningExpiryNotifications = async (items = []) => {
  if (Platform.OS === 'web' || !Notifications || !Notifications.scheduleNotificationAsync) {
    return null;
  }

  try {
    const hasPermission = await registerForPushNotifications();
    if (!hasPermission) return null;

    // 1. Cancel previous scheduled morning notifications to avoid duplicates
    const old7amId = await AsyncStorage.getItem(NOTIF_IDENTIFIER_7AM_KEY);
    if (old7amId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(old7amId);
      } catch (_) {}
    }

    const old8amId = await AsyncStorage.getItem(NOTIF_IDENTIFIER_8AM_KEY);
    if (old8amId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(old8amId);
      } catch (_) {}
    }

    // 2. Find items expiring within the next 3 days
    const now = new Date();
    const threshold = new Date(now);
    threshold.setDate(threshold.getDate() + 3);

    const expiringSoon = (items || []).filter((item) => {
      if (!item.expiryDate || item.isUsed || item.isWasted) return false;
      const exp = new Date(item.expiryDate);
      return exp <= threshold;
    });

    let alert7amTitle = '🌿 Pantry Fresh — 7:00 AM Expiry Check';
    let alert7amBody = '☀️ Good morning! Check your pantry inventory today to keep food fresh and reduce waste.';

    let alert8amTitle = '🍳 Pantry Fresh — 8:00 AM Meal Planner';
    let alert8amBody = '👨‍🍳 Time to cook! Use ingredients expiring soon to make a delicious zero-waste meal.';

    if (expiringSoon.length > 0) {
      const names = expiringSoon
        .slice(0, 3)
        .map((i) => i.name)
        .join(', ');
      const extraCount = expiringSoon.length > 3 ? ` +${expiringSoon.length - 3} more` : '';

      alert7amTitle = `⚠️ Food Expiring Soon (${expiringSoon.length} item${expiringSoon.length > 1 ? 's' : ''})`;
      alert7amBody = `7:00 AM Alert: Items needing attention: ${names}${extraCount}. Check pantry now!`;

      alert8amTitle = `🍳 Cook Before Expiry (${expiringSoon.length} item${expiringSoon.length > 1 ? 's' : ''})`;
      alert8amBody = `8:00 AM Alert: Don't let ${names}${extraCount} spoil! Tap to generate zero-waste recipes.`;
    }

    const triggerType =
      Notifications.SchedulableTriggerInputTypes?.DAILY || 'daily';

    // 3. Schedule for 7:00 AM every single day
    const new7amId = await safeScheduleNotificationAsync({
      content: {
        title: alert7amTitle,
        body: alert7amBody,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority?.MAX || 'max',
        data: {
          screen: 'Pantry',
          type: 'daily_7am_expiry',
        },
      },
      trigger: {
        type: triggerType,
        hour: 7,
        minute: 0,
        repeats: true,
        channelId: 'pantry-expiry-channel',
      },
    });

    if (new7amId) {
      await AsyncStorage.setItem(NOTIF_IDENTIFIER_7AM_KEY, new7amId);
      console.log(`[Notification Service] Successfully scheduled recurring Daily 7:00 AM notification (ID: ${new7amId}).`);
    }

    // 4. Schedule for 8:00 AM every single day
    const new8amId = await safeScheduleNotificationAsync({
      content: {
        title: alert8amTitle,
        body: alert8amBody,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority?.MAX || 'max',
        data: {
          screen: 'Recipes',
          type: 'daily_8am_expiry',
        },
      },
      trigger: {
        type: triggerType,
        hour: 8,
        minute: 0,
        repeats: true,
        channelId: 'pantry-expiry-channel',
      },
    });

    if (new8amId) {
      await AsyncStorage.setItem(NOTIF_IDENTIFIER_8AM_KEY, new8amId);
      console.log(`[Notification Service] Successfully scheduled recurring Daily 8:00 AM notification (ID: ${new8amId}).`);
    }

    return { id7am: new7amId, id8am: new8amId };
  } catch (err) {
    console.warn('[Schedule Daily Morning Notifications Error]', err.message);
    return null;
  }
};

// Aliases for backwards compatibility
export const scheduleDaily7AMExpiryNotification = scheduleDailyMorningExpiryNotifications;

/**
 * Schedule a test notification specifically for 14:00 today (2:00 PM)
 */
export const scheduleTestAlertAt1400 = async () => {
  if (Platform.OS === 'web' || !Notifications) {
    return null;
  }

  try {
    const hasPermission = await registerForPushNotifications();
    if (!hasPermission) return null;

    const now = new Date();
    const target1400 = new Date();
    target1400.setHours(14, 0, 0, 0);
    let secondsDiff = Math.max(1, Math.round((target1400.getTime() - now.getTime()) / 1000));

    const triggerTypeDaily =
      Notifications.SchedulableTriggerInputTypes?.DAILY || 'daily';

    // 1. Daily schedule trigger for 14:00 (2:00 PM)
    await safeScheduleNotificationAsync({
      content: {
        title: '🌱 Pantry Fresh — 14:00 Expiry Alert',
        body: '⚠️ 14:00 Alert: You have 3 pantry items expiring soon! Tap to view zero-waste recipes.',
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority?.MAX || 'max',
        data: { screen: 'Pantry', type: 'test_1400' },
      },
      trigger: {
        type: triggerTypeDaily,
        hour: 14,
        minute: 0,
        channelId: 'pantry-expiry-channel',
      },
    });

    // 2. Exact countdown seconds trigger until 14:00
    if (secondsDiff > 0 && secondsDiff < 3600) {
      const triggerTypeInterval =
        Notifications.SchedulableTriggerInputTypes?.TIME_INTERVAL || 'timeInterval';

      await safeScheduleNotificationAsync({
        content: {
          title: '🌱 Pantry Fresh — 14:00 Expiry Alert',
          body: '⚠️ 14:00 Alert: You have 3 pantry items expiring soon! Tap to view zero-waste recipes.',
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority?.MAX || 'max',
          data: { screen: 'Pantry', type: 'test_1400' },
        },
        trigger: {
          type: triggerTypeInterval,
          seconds: secondsDiff,
          repeats: false,
          channelId: 'pantry-expiry-channel',
        },
      });
    }

    console.log(`[Notification Service] Successfully scheduled alert for 14:00 (in ${secondsDiff}s)`);
    return true;
  } catch (err) {
    console.warn('[Schedule 14:00 Alert Error]', err.message);
    return null;
  }
};

// Aliases for backwards compatibility
export const scheduleTestAlertAt1345 = scheduleTestAlertAt1400;
export const scheduleTestAlertAt1335 = scheduleTestAlertAt1400;

/**
 * Trigger an instant test notification and ensure 7:00 AM & 8:00 AM alerts are active
 */
export const triggerInstantTestNotification = async (customMessage = null) => {
  if (Platform.OS === 'web') {
    return 'Notification simulation for web: Daily 7:00 AM & 8:00 AM Alerts active!';
  }

  try {
    const hasPermission = await registerForPushNotifications();
    if (!hasPermission) {
      throw new Error(
        'Permission denied. Please open your phone Settings > Apps > Expo Go > Permissions > Notifications and turn on Allow Notifications.'
      );
    }

    // Refresh recurring 7:00 AM and 8:00 AM alerts
    await scheduleDailyMorningExpiryNotifications();

    const triggerType =
      Notifications.SchedulableTriggerInputTypes?.TIME_INTERVAL || 'timeInterval';

    const testId = await safeScheduleNotificationAsync({
      content: {
        title: '🌿 Pantry Fresh — Morning Alerts Verified!',
        body:
          customMessage ||
          '✅ Daily 7:00 AM & 8:00 AM morning notifications are active! You will be alerted before food spoils.',
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority?.MAX || 'max',
        data: { screen: 'Pantry' },
      },
      trigger: {
        type: triggerType,
        seconds: 2,
        repeats: false,
        channelId: 'pantry-expiry-channel',
      },
    });

    console.log('[Notification Service] Test alert sent successfully, ID:', testId);
    return testId;
  } catch (err) {
    console.warn('[Test Notification Error]', err.message);
    throw err;
  }
};

export default {
  registerForPushNotifications,
  scheduleDailyMorningExpiryNotifications,
  scheduleDaily7AMExpiryNotification,
  scheduleTestAlertAt1400,
  scheduleTestAlertAt1345,
  scheduleTestAlertAt1335,
  triggerInstantTestNotification,
};
