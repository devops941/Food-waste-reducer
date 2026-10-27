import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '../components/Icons';
import apiClient from '../api/client';
import { COLORS, FONTS } from '../theme';

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('All');

  const DIETS = ['All', 'Vegetarian', 'Non-Vegetarian', 'Quick (< 20m)'];

  const fetchRecipes = async (diet = filter) => {
    setIsLoading(true);
    try {
      // 1. Fetch current pantry items first to ensure recipes are strictly built with real user foods
      let pantryItems = [];
      try {
        const pRes = await apiClient.get('/pantry');
        pantryItems = pRes.data?.items || pRes.data?.data || [];
      } catch (pErr) {
        console.warn('[Fetch Pantry for Recipe Warning]', pErr.message);
      }

      const res = await apiClient.post('/recipes/suggest', {
        dietaryFilter: diet,
        items: pantryItems,
      });

      const recipeList = res.data?.recipes || res.data?.data || [];
      if (Array.isArray(recipeList) && recipeList.length > 0) {
        setRecipes(recipeList);
      } else {
        setRecipes([]);
      }
    } catch (err) {
      console.warn('[Recipe Fetch Error]', err.message);
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes('All');
  }, []);

  const handleFilterSelect = (diet) => {
    setFilter(diet);
    fetchRecipes(diet);
  };

  const handleCooked = (recipe) => {
    Alert.alert('Meal Cooked! 🌿', `Great job rescuing food with "${recipe.title}".`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={() => fetchRecipes()} colors={[COLORS.primary]} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>AI Zero-Waste Recipes</Text>
        <Text style={styles.subtitle}>
          Smart meals formulated to prioritize expiring items in your pantry before they spoil.
        </Text>
      </View>

      {/* Diet Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {DIETS.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.filterChip, filter === d && styles.filterChipActive]}
            onPress={() => handleFilterSelect(d)}
          >
            <Text style={[styles.filterChipText, filter === d && styles.filterChipTextActive]}>
              {d}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recipes List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Generating recipes with AI...</Text>
        </View>
      ) : recipes.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🍳</Text>
          <Text style={styles.emptyTitle}>No Recipes Generated</Text>
          <Text style={styles.emptySub}>
            Add a few ingredients to your pantry or use the Scan tab to scan your groceries!
          </Text>
        </View>
      ) : (
        recipes.map((rec, idx) => (
          <View key={idx} style={styles.recipeCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.recipeTitle}>{rec.title}</Text>
              <View style={styles.timeBadge}>
                <Text style={styles.timeBadgeText}>⏱️ {rec.time || '20 mins'}</Text>
              </View>
            </View>

            <Text style={styles.recipeDesc}>{rec.description}</Text>

            {/* Ingredients from pantry */}
            {rec.usesIngredients && rec.usesIngredients.length > 0 && (
              <View style={styles.pantryBadgeBox}>
                <Text style={styles.pantryBadgeTitle}>🌿 Uses from your pantry:</Text>
                <Text style={styles.pantryBadgeText}>{rec.usesIngredients.join(', ')}</Text>
              </View>
            )}

            {/* Preparation Steps */}
            {rec.steps && rec.steps.length > 0 && (
              <View style={styles.stepsBox}>
                <Text style={styles.stepsTitle}>Preparation Steps:</Text>
                {rec.steps.map((st, sIdx) => (
                  <View key={sIdx} style={styles.stepRow}>
                    <Text style={styles.stepNum}>{sIdx + 1}.</Text>
                    <Text style={styles.stepContent}>{st}</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.cookedBtn} onPress={() => handleCooked(rec)}>
              <Text style={styles.cookedBtnText}>✓ Mark as Cooked & Log Waste Saved</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

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
  header: {
    marginBottom: 16,
  },
  title: {
    fontFamily: FONTS.serif,
    fontSize: 27,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 13.5,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 19,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  recipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recipeTitle: {
    flex: 1,
    fontFamily: FONTS.serif,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginRight: 8,
  },
  timeBadge: {
    backgroundColor: COLORS.butterBg,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.butterText,
  },
  recipeDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginVertical: 10,
    lineHeight: 18,
  },
  pantryBadgeBox: {
    backgroundColor: COLORS.mintBg,
    padding: 12,
    borderRadius: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.mintBorder,
  },
  pantryBadgeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.mintText,
  },
  pantryBadgeText: {
    fontSize: 12.5,
    color: COLORS.mintText,
    marginTop: 2,
    fontWeight: '600',
  },
  stepsBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  stepsTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  stepNum: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    width: 22,
  },
  stepContent: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 18,
  },
  cookedBtn: {
    backgroundColor: COLORS.mintBg,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.mintBorder,
  },
  cookedBtnText: {
    color: COLORS.mintText,
    fontWeight: '700',
    fontSize: 13,
  },
  center: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.textMuted,
    fontSize: 13,
  },
  emptyCard: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 10,
  },
  emptyTitle: {
    fontFamily: FONTS.serif,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 6,
    lineHeight: 18,
  },
});
