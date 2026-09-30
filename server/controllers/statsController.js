import PantryItem from '../models/PantryItem.js';
import WasteStat from '../models/WasteStat.js';
import { checkAndDispatchReminders } from '../jobs/reminderJob.js';

const getMonthString = (date = new Date()) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

// @desc    Get dashboard metrics, use-first items, and weekly distribution chart
// @route   GET /api/stats/dashboard
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Active items
    const activeItems = await PantryItem.find({
      user: userId,
      isUsed: false,
      isWasted: false,
    }).sort({ expiryDate: 1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let expiringSoonCount = 0;
    let expiredCount = 0;
    let freshCount = 0;

    // Distribution breakdown for chart
    let distExpired = 0;
    let distTodayTomorrow = 0;
    let dist3to5Days = 0;
    let dist1to2Weeks = 0;
    let distLongTerm = 0;

    activeItems.forEach((item) => {
      const target = new Date(item.expiryDate);
      target.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        expiredCount++;
        distExpired++;
      } else if (diffDays <= 3) {
        expiringSoonCount++;
        if (diffDays <= 1) distTodayTomorrow++;
        else dist3to5Days++;
      } else {
        freshCount++;
        if (diffDays <= 5) dist3to5Days++;
        else if (diffDays <= 14) dist1to2Weeks++;
        else distLongTerm++;
      }
    });

    // Top 3 urgent items to use first
    const useTheseFirst = activeItems.slice(0, 3);

    // Fetch current and past monthly stats
    const currentMonthStr = getMonthString();
    const currentWasteStat = await WasteStat.findOne({
      user: userId,
      month: currentMonthStr,
    });

    const moneySaved = currentWasteStat ? currentWasteStat.moneySaved : 0;
    const itemsSavedCount = currentWasteStat ? currentWasteStat.itemsSavedCount : 0;
    const itemsWastedCount = currentWasteStat ? currentWasteStat.itemsWastedCount : 0;

    // Last 6 months history
    const monthlyStats = await WasteStat.find({ user: userId })
      .sort({ month: -1 })
      .limit(6);

    const weeklyDistribution = [
      { name: 'Expired', count: distExpired, color: '#C9503F' },
      { name: '0-1 Days', count: distTodayTomorrow, color: '#E0A030' },
      { name: '2-5 Days', count: dist3to5Days, color: '#4F7A4A' },
      { name: '1-2 Wks', count: dist1to2Weeks, color: '#7FA873' },
      { name: 'Long Term', count: distLongTerm, color: '#A9C69E' },
    ];

    res.status(200).json({
      success: true,
      stats: {
        totalItems: activeItems.length,
        expiringSoonCount,
        expiredCount,
        freshCount,
        moneySaved,
        itemsSavedCount,
        itemsWastedCount,
      },
      useTheseFirst,
      weeklyDistribution,
      monthlyStats: monthlyStats.reverse(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually trigger reminder dispatch for current user
// @route   POST /api/stats/trigger-reminder
// @access  Private
export const triggerReminder = async (req, res, next) => {
  try {
    await checkAndDispatchReminders(req.user._id);
    res.status(200).json({
      success: true,
      message: 'Expiry reminder check completed. Alerts sent if items are near expiry.',
    });
  } catch (error) {
    next(error);
  }
};
