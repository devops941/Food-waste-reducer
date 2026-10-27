import cron from 'node-cron';
import User from '../models/User.js';
import PantryItem from '../models/PantryItem.js';
import { sendExpiryReminderEmail } from '../services/emailService.js';
import { sendExpiryAlertWhatsApp } from '../services/whatsappService.js';

export const checkAndDispatchReminders = async (targetUserId = null) => {
  try {
    console.log('[Reminder Job] Running expiry check...');
    const userQuery = targetUserId ? { _id: targetUserId } : {};
    const users = await User.find(userQuery);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const user of users) {
      const settings = user.reminderSettings || {
        emailEnabled: true,
        whatsappEnabled: false,
        daysBeforeExpiry: 2,
      };

      if (!settings.emailEnabled && !settings.whatsappEnabled && !targetUserId) {
        continue;
      }

      const thresholdDays = settings.daysBeforeExpiry || 2;
      const thresholdDate = new Date(today);
      thresholdDate.setDate(thresholdDate.getDate() + thresholdDays);
      thresholdDate.setHours(23, 59, 59, 999);

      // Find active items expiring on or before thresholdDate
      const expiringItems = await PantryItem.find({
        user: user._id,
        isUsed: false,
        isWasted: false,
        expiryDate: { $lte: thresholdDate },
      }).sort({ expiryDate: 1 });

      if (expiringItems.length === 0) continue;

      // 1. Dispatch Email Reminder
      if (settings.emailEnabled || targetUserId) {
        await sendExpiryReminderEmail({
          to: user.email,
          userName: user.name,
          expiringItems,
        });
      }

      // 2. Dispatch WhatsApp Reminder via Meta Cloud API
      if ((settings.whatsappEnabled || targetUserId) && user.phone) {
        await sendExpiryAlertWhatsApp({
          userPhone: user.phone,
          userName: user.name,
          expiringItems,
        });
      }
    }

    console.log('[Reminder Job] Expiry check completed.');
  } catch (error) {
    console.error('[Reminder Job Error]', error);
  }
};

export const initReminderCron = () => {
  // Run daily at 7:00 AM sharp to alert user of expiring food
  cron.schedule('0 7 * * *', () => {
    console.log('[Reminder Cron] Triggering daily 7:00 AM food expiry reminder job');
    checkAndDispatchReminders();
  });

  // Additional 8:00 AM backup reminder
  cron.schedule('0 8 * * *', () => {
    console.log('[Reminder Cron] Triggering daily 8:00 AM reminder job');
    checkAndDispatchReminders();
  });

  console.log('[Reminder Cron] Scheduled food expiry reminder job for 7:00 AM and 8:00 AM daily.');
};

export default {
  initReminderCron,
  checkAndDispatchReminders,
};
