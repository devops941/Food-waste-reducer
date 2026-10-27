import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '../components/Icons';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { COLORS, FONTS } from '../theme';
import {
  scheduleDailyMorningExpiryNotifications,
  scheduleDaily7AMExpiryNotification,
  triggerInstantTestNotification,
} from '../services/notificationService';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [pantryItems, setPantryItems] = useState([]);
  const [featuredRecipe, setFeaturedRecipe] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Format today's date like "WED 21 OCT"
  const formattedDate = (() => {
    const d = new Date();
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
  })();

  const fetchDashboardData = useCallback(async () => {
    try {
      // 1. Fetch pantry items
      const pantryRes = await apiClient.get('/pantry');
      const items = pantryRes.data?.items || pantryRes.data?.data || [];
      if (Array.isArray(items) && items.length > 0) {
        setPantryItems(items);
        scheduleDailyMorningExpiryNotifications(items);
      } else {
        const fallback = getDefaultExpiringItems();
        setPantryItems(fallback);
        scheduleDailyMorningExpiryNotifications(fallback);
      }

      // 2. Fetch top recipe
      const recipeRes = await apiClient.post('/recipes/suggest', {
        dietaryFilter: 'All',
        items: items.length > 0 ? items : undefined,
      });
      const recipes = recipeRes.data?.recipes || recipeRes.data?.data || [];
      if (Array.isArray(recipes) && recipes.length > 0) {
        setFeaturedRecipe(recipes[0]);
      } else {
        setFeaturedRecipe(getDefaultFeaturedRecipe());
      }
    } catch (err) {
      console.warn('[Home Fetch Warning]', err.message);
      setPantryItems(getDefaultExpiringItems());
      setFeaturedRecipe(getDefaultFeaturedRecipe());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleTestNotification = async () => {
    try {
      await triggerInstantTestNotification();
      const msg =
        'Daily 07:00 AM & 08:00 AM morning alerts are active! Also sent an instant 2-second test alert to verify your notification bar.';
      if (Platform.OS === 'web') {
        window.alert(`Morning Alerts Active! ☀️\n\n${msg}`);
      } else {
        Alert.alert('Morning Alerts Active! ☀️', msg);
      }
    } catch (err) {
      const errMsg = err.message || 'Please enable notifications in phone settings.';
      if (Platform.OS === 'web') {
        window.alert(`Notification Setup: ${errMsg}`);
      } else {
        Alert.alert('Notification Setup', errMsg);
      }
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  // Calculate days left
  const getDaysLeft = (item) => {
    if (typeof item.daysRemaining === 'number') return item.daysRemaining;
    if (item.expiryDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(item.expiryDate);
      target.setHours(0, 0, 0, 0);
      return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    }
    return 2;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
      }
    >
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.leafIconBox}>
          <Ionicons name="leaf" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.headerTextGroup}>
          <Text style={styles.dateBadge}>{formattedDate}</Text>
          <Text style={styles.headerTitle}>What are we cooking?</Text>
        </View>
      </View>

      {/* Daily 7:00 AM & 8:00 AM Expiry Notification Status Card */}
      <View style={styles.notifBanner}>
        <View style={styles.notifLeftCol}>
          <View style={styles.notifBellCircle}>
            <Ionicons name="notifications-outline" size={17} color={COLORS.forestGreen} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.notifTitle}>Daily 7:00 AM & 8:00 AM Alerts</Text>
            <Text style={styles.notifSubtitle}>Active • Morning expiry check & meal planner</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.notifTestBtn}
          onPress={handleTestNotification}
          activeOpacity={0.8}
        >
          <Text style={styles.notifTestText}>Test</Text>
        </TouchableOpacity>
      </View>

      {/* Top 2 Action Cards */}
      <View style={styles.cardsRow}>
        {/* Scan a Dish (Solid Forest Green) */}
        <TouchableOpacity
          style={styles.greenActionCard}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('Scan', { initialMode: 'Dish' })}
        >
          <View style={styles.greenIconCircle}>
            <Feather name="camera" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.greenCardTitle}>Scan a dish</Text>
          <Text style={styles.greenCardDesc}>Photo in, dish name, type and recipe out</Text>
        </TouchableOpacity>

        {/* Scan Groceries (Soft Blush Peach) */}
        <TouchableOpacity
          style={styles.peachActionCard}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('Scan', { initialMode: 'Groceries' })}
        >
          <View style={styles.peachIconCircle}>
            <Feather name="box" size={22} color={COLORS.rust} />
          </View>
          <Text style={styles.peachCardTitle}>Scan groceries</Text>
          <Text style={styles.peachCardDesc}>Photo of item and expiry date, saved to pantry</Text>
        </TouchableOpacity>
      </View>

      {/* Expiring Soon Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Expiring soon</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Pantry')}>
          <Text style={styles.seePantryLink}>See pantry</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal List of Expiring Items */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.expiringScroll}
      >
        {pantryItems.slice(0, 6).map((item, idx) => {
          const days = getDaysLeft(item);
          const isUrgent = days <= 2;
          return (
            <View key={item._id || idx} style={styles.expiringCard}>
              <View style={styles.itemImageBox}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                  <Text style={styles.foodEmojiText}>{getFoodEmoji(item.name)}</Text>
                )}
              </View>
              <Text style={styles.expiringItemName} numberOfLines={1}>
                {item.name}
              </Text>
              <View
                style={[
                  styles.daysBadge,
                  isUrgent ? styles.urgentDaysBadge : styles.normalDaysBadge,
                ]}
              >
                <Text
                  style={[
                    styles.daysBadgeText,
                    isUrgent ? styles.urgentDaysText : styles.normalDaysText,
                  ]}
                >
                  {days <= 0 ? 'Expires today' : `${days}d left`}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Cook with What is Expiring Section */}
      <Text style={styles.sectionTitle}>Cook with what is expiring</Text>
      {featuredRecipe && (
        <TouchableOpacity
          style={styles.featuredRecipeCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Recipes')}
        >
          <View style={styles.recipeImageBox}>
            {featuredRecipe.imageUrl ? (
              <Image source={{ uri: featuredRecipe.imageUrl }} style={styles.recipePhoto} resizeMode="cover" />
            ) : (
              <Text style={styles.recipeEmojiText}>🍲</Text>
            )}
          </View>
          <View style={styles.recipeInfoBox}>
            <Text style={styles.recipeTitle} numberOfLines={1}>
              {featuredRecipe.title || 'Palak Paneer'}
            </Text>
            <Text style={styles.recipeUses} numberOfLines={1}>
              Uses {(featuredRecipe.usesIngredients || ['Spinach', 'Paneer']).slice(0, 2).join(', ')}
            </Text>
            <Text style={styles.recipeMeta}>
              {featuredRecipe.time || '35 min'} • Missing {(featuredRecipe.missingIngredients || []).length || 1} item
            </Text>
            <Text style={styles.recipeLink}>See all suggestions →</Text>
          </View>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const getDefaultExpiringItems = () => [
  { _id: 'e1', name: 'Spinach', daysRemaining: 2 },
  { _id: 'e2', name: 'Milk', daysRemaining: 3 },
  { _id: 'e3', name: 'Paneer', daysRemaining: 4 },
];

const getDefaultFeaturedRecipe = () => ({
  title: 'Palak Paneer',
  usesIngredients: ['Spinach', 'Paneer'],
  time: '35 min',
  missingIngredients: ['Garam Masala'],
  description: 'Rich spiced spinach gravy with soft paneer cubes that uses up expiring dairy and greens.',
});

const getFoodEmoji = (name = '') => {
  const n = (name || '').toLowerCase();
  if (n.includes('spinach') || n.includes('palak') || n.includes('lettuce') || n.includes('kale') || n.includes('green') || n.includes('herb')) return '🥬';
  if (n.includes('milk') || n.includes('dairy') || n.includes('yogurt') || n.includes('curd')) return '🥛';
  if (n.includes('paneer') || n.includes('cheese') || n.includes('tofu')) return '🧀';
  if (n.includes('tomato')) return '🍅';
  if (n.includes('onion')) return '🧅';
  if (n.includes('potato')) return '🥔';
  if (n.includes('carrot')) return '🥕';
  if (n.includes('apple')) return '🍎';
  if (n.includes('banana')) return '🍌';
  if (n.includes('bread') || n.includes('roti') || n.includes('toast')) return '🍞';
  if (n.includes('rice') || n.includes('grain') || n.includes('flour')) return '🍚';
  if (n.includes('chicken') || n.includes('meat') || n.includes('fish') || n.includes('mutton')) return '🍗';
  if (n.includes('egg')) return '🥚';
  if (n.includes('lemon') || n.includes('lime') || n.includes('citrus')) return '🍋';
  return '🥗';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 44 : 55,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  leafIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerTextGroup: {
    flex: 1,
  },
  dateBadge: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  headerTitle: {
    fontFamily: FONTS.serif,
    fontSize: 27,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: -0.3,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  greenActionCard: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 18,
    marginRight: 7,
    minHeight: 180,
    justifyContent: 'space-between',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  greenIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  greenCardTitle: {
    fontFamily: FONTS.serif,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  greenCardDesc: {
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 17,
  },
  peachActionCard: {
    flex: 1,
    backgroundColor: COLORS.peachBg,
    borderRadius: 24,
    padding: 18,
    marginLeft: 7,
    minHeight: 180,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.peachBorder,
  },
  peachIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  peachCardTitle: {
    fontFamily: FONTS.serif,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  peachCardDesc: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    lineHeight: 17,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: FONTS.serif,
    fontSize: 21,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  seePantryLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    textDecorationLine: 'underline',
  },
  expiringScroll: {
    paddingBottom: 4,
    marginBottom: 26,
  },
  expiringCard: {
    width: 110,
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  itemImageBox: {
    width: 88,
    height: 64,
    borderRadius: 14,
    backgroundColor: COLORS.mintBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  foodEmojiText: {
    fontSize: 32,
  },
  expiringItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
    textAlign: 'center',
  },
  daysBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentDaysBadge: {
    backgroundColor: COLORS.rust,
  },
  urgentDaysText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  normalDaysBadge: {
    backgroundColor: COLORS.butterBg,
  },
  normalDaysText: {
    color: COLORS.butterText,
    fontSize: 11,
    fontWeight: '700',
  },
  daysBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  featuredRecipeCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.mintBg,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.mintBorder,
    alignItems: 'center',
  },
  recipeImageBox: {
    width: 86,
    height: 86,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  recipePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  recipeEmojiText: {
    fontSize: 40,
  },
  recipeInfoBox: {
    flex: 1,
  },
  recipeTitle: {
    fontFamily: FONTS.serif,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  recipeUses: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 3,
  },
  recipeMeta: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  recipeLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  notifBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  notifLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  notifBellCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.mintBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  notifSubtitle: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  notifTestBtn: {
    backgroundColor: COLORS.mintBg,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.mintBorder,
  },
  notifTestText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.forestGreen,
  },
});
