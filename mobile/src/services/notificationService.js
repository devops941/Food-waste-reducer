import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIF_IDENTIFIER_KEY = '@pantry_fresh_daily_7am_id';

// Configure foreground notification behavior
if (Platform.OS !== 'web' && Notifications && typeof Notifications.setNotificationHandler === 'function') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (err) {
    console.warn('[Notification Service] Handler setup error:', err.message);
  }
}

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
      console.warn('[Notification Service] Notification permissions not granted.');
      return false;
    }

    // Configure high-importance channel on Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('pantry-expiry-channel', {
        name: 'Pantry Expiry Reminders',
        description: 'Daily alerts at 7:00 AM notifying items expiring soon',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
        lightColor: '#E4572E',
      });
    }

    return true;
  } catch (err) {
    console.warn('[Notification Service Error]', err.message);
    return false;
  }
};

/**
 * Schedule or update the recurring Daily 7:00 AM Expiry Notification
 * @param {Array} items - List of pantry items to analyze for upcoming expiration
 */
export const scheduleDaily7AMExpiryNotification = async (items = []) => {
  if (Platform.OS === 'web' || !Notifications || !Notifications.scheduleNotificationAsync) {
    return null;
  }

  try {
    const hasPermission = await registerForPushNotifications();
    if (!hasPermission) return null;

    // Check for existing 7 AM scheduled notification and cancel it to avoid duplicates
    const oldId = await AsyncStorage.getItem(NOTIF_IDENTIFIER_KEY);
    if (oldId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(oldId);
      } catch (_) {}
    }

    // Find items expiring within the next 3 days
    const now = new Date();
    const threshold = new Date(now);
    threshold.setDate(threshold.getDate() + 3);

    const expiringSoon = (items || []).filter((item) => {
      if (!item.expiryDate || item.isUsed || item.isWasted) return false;
      const exp = new Date(item.expiryDate);
      return exp <= threshold;
    });

    let notificationTitle = '🌿 Pantry Fresh — Morning Expiry Check';
    let notificationBody = '☀️ Good morning! Check your pantry inventory today to keep food fresh and reduce waste.';

    if (expiringSoon.length > 0) {
      const names = expiringSoon
        .slice(0, 3)
        .map((i) => i.name)
        .join(', ');
      const extraCount = expiringSoon.length > 3 ? ` +${expiringSoon.length - 3} more` : '';

      notificationTitle = `⚠️ Food Expiring Soon (${expiringSoon.length} item${expiringSoon.length > 1 ? 's' : ''})`;
      notificationBody = `Items needing rescue: ${names}${extraCount}. Tap to see zero-waste recipes!`;
    }

    // Schedule for 7:00 AM every single day
    const newId = await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationTitle,
        body: notificationBody,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: {
          screen: 'Pantry',
          type: 'daily_7am_expiry',
        },
      },
      trigger: {
        hour: 7,
        minute: 0,
        repeats: true,
      },
    });

    await AsyncStorage.setItem(NOTIF_IDENTIFIER_KEY, newId);
    console.log(`[Notification Service] Successfully scheduled recurring Daily 7:00 AM notification (ID: ${newId}).`);
    return newId;
  } catch (err) {
    console.warn('[Schedule 7AM Notification Error]', err.message);
    return null;
  }
};

/**
 * Trigger an instant test notification (fires in 2 seconds) so the user can verify notifications work
 */
export const triggerInstantTestNotification = async (customMessage = null) => {
  if (Platform.OS === 'web') {
    return 'Notification simulation for web: 7:00 AM Daily Expiry Alert active!';
  }

  try {
    const hasPermission = await registerForPushNotifications();
    if (!hasPermission) {
      throw new Error('Permission denied. Please enable notifications in your phone settings.');
    }

    const testId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌿 Pantry Fresh — 7:00 AM Alert Test',
        body:
          customMessage ||
          '✅ Your Daily 7:00 AM Expiry Notification is successfully active! You will be alerted whenever food is expiring soon.',
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { screen: 'Pantry' },
      },
      trigger: {
        seconds: 2,
      },
    });

    return testId;
  } catch (err) {
    console.warn('[Test Notification Error]', err.message);
    throw err;
  }
};

export default {
  registerForPushNotifications,
  scheduleDaily7AMExpiryNotification,
  triggerInstantTestNotification,
};
