import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ChefHat, 
  Bookmark, 
  BookmarkCheck, 
  ArrowRight, 
  RefreshCw,
  Plus
} from 'lucide-react';
import recipeService from '../services/recipeService';
import shoppingService from '../services/shoppingService';
import { useToast } from '../hooks/useToast';
import { 
  PageHeader, 
  Button, 
  FilterChips, 
  EmptyState, 
  Loader, 
  Chip,
  Card 
} from '../components/ui';
import RecipeCard from '../components/recipes/RecipeCard';
import RecipeDetailModal from '../components/recipes/RecipeDetailModal';

const DIET_FILTER_OPTIONS = [
  'All',
  'Non-Vegetarian',
  'Vegetarian',
  'Vegan',
  'High-Protein',
  'Gluten-Free',
  'Dairy-Free',
  'Low-Carb',
  'Quick (< 20m)',
];

export function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [activeTab, setActiveTab] = useState('suggestions'); // 'suggestions' | 'saved'
  const [selectedDiet, setSelectedDiet] = useState('All');
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const toast = useToast();

  const fetchSavedRecipes = async () => {
    try {
      const data = await recipeService.getSavedRecipes();
      setSavedRecipes(data.recipes || []);
    } catch (err) {
      console.error('Failed to load saved recipes', err);
    }
  };

  useEffect(() => {
    fetchSavedRecipes();
    // Auto generate initial recipes
    handleGenerateRecipes('All');
  }, []);

  const handleGenerateRecipes = async (diet = selectedDiet) => {
    setLoading(true);
    try {
      const filter = diet !== 'All' ? diet : null;
      const data = await recipeService.suggestRecipes(filter);
      setRecipes(data.recipes || []);
      setActiveTab('suggestions');
      toast.success(
        `Generated ${data.recipes?.length || 0} delicious zero-waste recipes!`,
        'Recipes Ready 🌿'
      );
    } catch (err) {
      toast.error(err.message, 'Recipe Generation Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDietChange = (newDiet) => {
    setSelectedDiet(newDiet);
    handleGenerateRecipes(newDiet);
  };

  const handleToggleSave = async (recipe) => {
    const isSaved = savedRecipes.some((r) => r.title === recipe.title);
    if (isSaved) {
      const existing = savedRecipes.find((r) => r.title === recipe.title);
      if (existing) {
        try {
          await recipeService.deleteSavedRecipe(existing._id);
          setSavedRecipes((prev) => prev.filter((r) => r._id !== existing._id));
          toast.info('Removed from saved recipes');
        } catch (err) {
          toast.error(err.message);
        }
      }
    } else {
      try {
        const res = await recipeService.saveRecipe(recipe);
        setSavedRecipes((prev) => [res.recipe, ...prev]);
        toast.success(`Saved "${recipe.title}" to favorites!`);
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  const handleCookRecipe = async (recipe) => {
    try {
      const res = await recipeService.markAsCooked({
        recipeId: recipe._id,
        recipeTitle: recipe.title,
        usedIngredients: recipe.usesIngredients || [],
      });
      toast.success(res.message, 'Meal Cooked! 🌿');
      await fetchSavedRecipes();
    } catch (err) {
      toast.error(err.message, 'Failed to log cooked recipe');
    }
  };

  const handleAddMissingToShopping = async (missingIngredients) => {
    if (!missingIngredients || missingIngredients.length === 0) return;
    try {
      await shoppingService.addBulk(missingIngredients);
      toast.success(
        `Added ${missingIngredients.length} ingredients to your shopping list!`,
        'Shopping List Updated'
      );
    } catch (err) {
      toast.error(err.message, 'Failed to add items to shopping list');
    }
  };

  const isRecipeSaved = (recipe) => {
    return savedRecipes.some((r) => r.title === recipe?.title);
  };

  const displayedList = activeTab === 'suggestions' ? recipes : savedRecipes;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Zero-Waste Recipe Studio"
        subtitle="AI-crafted recipes that prioritize your expiring ingredients to create nourishing meals."
        actions={
          <Button
            variant="terracotta"
            size="md"
            onClick={() => handleGenerateRecipes()}
            isLoading={loading}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Suggest New Recipes
          </Button>
        }
      />

      {/* Tabs & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-charcoal-border/70 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <Chip
              label="AI Suggestions"
              icon={<Sparkles className="w-3.5 h-3.5 text-sage-600" />}
              count={recipes.length}
              selected={activeTab === 'suggestions'}
              onClick={() => setActiveTab('suggestions')}
            />
            <Chip
              label="Saved Favorites"
              icon={<Bookmark className="w-3.5 h-3.5 text-terracotta-600" />}
              count={savedRecipes.length}
              selected={activeTab === 'saved'}
              onClick={() => setActiveTab('saved')}
            />
          </div>

          {activeTab === 'suggestions' && (
            <span className="text-xs text-charcoal-muted font-medium">
              Filter by dietary preference:
            </span>
          )}
        </div>

        {/* Dietary Filter Chips */}
        {activeTab === 'suggestions' && (
          <div className="pt-2 border-t border-cream-200">
            <FilterChips
              options={DIET_FILTER_OPTIONS}
              value={selectedDiet}
              onChange={handleDietChange}
            />
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-16 text-center space-y-4 bg-white/70 rounded-2xl border border-dashed border-charcoal-border">
          <div className="w-14 h-14 rounded-2xl bg-sage-100 text-sage-600 flex items-center justify-center mx-auto animate-bounce">
            <ChefHat className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-semibold text-charcoal">
              Chef AI is crafting your menu...
            </h3>
            <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
              Scanning your pantry items for soon-to-expire ingredients and calculating zero-waste flavor profiles.
            </p>
          </div>
        </div>
      ) : displayedList.length === 0 ? (
        <EmptyState
          icon={activeTab === 'suggestions' ? <ChefHat className="w-7 h-7" /> : <Bookmark className="w-7 h-7" />}
          title={activeTab === 'suggestions' ? 'No recipes generated yet' : 'No saved recipes in your favorites'}
          description={
            activeTab === 'suggestions'
              ? 'Click the button below to generate customized zero-waste recipes from your current pantry.'
              : 'When you find a recipe you love, bookmark it to access it anytime.'
          }
          actionLabel={activeTab === 'suggestions' ? 'Suggest Recipes Now' : 'Browse AI Recipes'}
          onAction={activeTab === 'suggestions' ? () => handleGenerateRecipes() : () => setActiveTab('suggestions')}
          actionIcon={<Sparkles className="w-4 h-4" />}
        />
      ) : (
        /* Recipes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedList.map((recipe, index) => (
            <RecipeCard
              key={recipe._id || index}
              recipe={recipe}
              onSelect={setSelectedRecipe}
              isSaved={isRecipeSaved(recipe)}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      )}

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        isOpen={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        recipe={selectedRecipe}
        isSaved={isRecipeSaved(selectedRecipe)}
        onToggleSave={handleToggleSave}
        onCooked={handleCookRecipe}
        onAddMissingToShopping={handleAddMissingToShopping}
      />
    </div>
  );
}

export default RecipesPage;
