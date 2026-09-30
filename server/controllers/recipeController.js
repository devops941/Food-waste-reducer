import PantryItem from '../models/PantryItem.js';
import SavedRecipe from '../models/SavedRecipe.js';
import WasteStat from '../models/WasteStat.js';
import { generateRecipesWithLLM } from '../services/llmService.js';

const getMonthString = (date = new Date()) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

// @desc    Suggest zero-waste recipes using Groq LLM prioritizing expiring pantry items
// @route   POST /api/recipes/suggest
// @access  Private
export const suggestRecipes = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { dietaryFilter } = req.body;

    // Fetch user's active pantry items
    const activeItems = await PantryItem.find({
      user: userId,
      isUsed: false,
      isWasted: false,
    }).sort({ expiryDate: 1 });

    if (activeItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your pantry is empty. Add a few ingredients to generate zero-waste recipes.',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Identify items expiring within 3 days
    const expiringItems = activeItems.filter((item) => {
      const target = new Date(item.expiryDate);
      target.setHours(0, 0, 0, 0);
      const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
      return diff <= 3;
    });

    let userDietary = [...(req.user.dietaryPreferences || [])];

    // Filter candidate pantry items according to dietary filter
    const isNonVeg = (item) =>
      item.category === 'Meat & Poultry' ||
      item.category === 'Seafood' ||
      /(chicken|brest|breast|fish|salmon|prawn|shrimp|beef|pork|mutton|lamb|tuna|turkey|meat|bacon|sausage|crab|squid|egg)/i.test(item.name);

    const isDairy = (item) =>
      item.category === 'Dairy' ||
      /(milk|yogurt|curd|cheese|paneer|butter|ghee|cream|dairy)/i.test(item.name);

    const isGluten = (item) =>
      item.category === 'Bakery' ||
      /(bread|flour|wheat|pasta|noodle|dough|roti|naan|bagel|toast)/i.test(item.name);

    let filteredActive = activeItems;
    let filteredExpiring = expiringItems;

    // Check if pantry contains any meat, poultry, fish, seafood or non-veg items
    const hasMeatOrFish = activeItems.some(isNonVeg);

    // If explicit filter is selected from UI
    if (dietaryFilter && dietaryFilter !== 'All') {
      if (dietaryFilter === 'Vegan') {
        userDietary = ['Vegan', 'Dairy-Free'];
        filteredActive = activeItems.filter((i) => !isNonVeg(i) && !isDairy(i));
        filteredExpiring = expiringItems.filter((i) => !isNonVeg(i) && !isDairy(i));
      } else if (dietaryFilter === 'Vegetarian') {
        userDietary = ['Vegetarian'];
        filteredActive = activeItems.filter((i) => !isNonVeg(i));
        filteredExpiring = expiringItems.filter((i) => !isNonVeg(i));
      } else if (dietaryFilter === 'Dairy-Free') {
        userDietary = ['Dairy-Free'];
        filteredActive = activeItems.filter((i) => !isDairy(i));
        filteredExpiring = expiringItems.filter((i) => !isDairy(i));
      } else if (dietaryFilter === 'Gluten-Free') {
        userDietary = ['Gluten-Free'];
        filteredActive = activeItems.filter((i) => !isGluten(i));
        filteredExpiring = expiringItems.filter((i) => !isGluten(i));
      } else if (dietaryFilter === 'Non-Vegetarian') {
        userDietary = ['Non-Vegetarian'];
      } else {
        if (!userDietary.includes(dietaryFilter)) userDietary.push(dietaryFilter);
      }
    } else if (dietaryFilter === 'All' || !dietaryFilter) {
      if (hasMeatOrFish) {
        userDietary = userDietary.filter((d) => d !== 'Vegetarian' && d !== 'Vegan');
      }
    }

    const candidateExpiring = filteredExpiring.length > 0 
      ? filteredExpiring 
      : (filteredActive.length > 0 ? filteredActive.slice(0, 4) : activeItems.slice(0, 4));

    const recipes = await generateRecipesWithLLM({
      expiringItems: candidateExpiring,
      allPantryItems: filteredActive.length > 0 ? filteredActive : activeItems,
      dietaryPreferences: userDietary,
      customDietFilter: dietaryFilter || null,
    });

    res.status(200).json({
      success: true,
      count: recipes.length,
      recipes,
      expiringCount: expiringItems.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save a recipe to user's favorites
// @route   POST /api/recipes/save
// @access  Private
export const saveRecipe = async (req, res, next) => {
  try {
    const { title, time, servings, description, usesIngredients, missingIngredients, steps } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Recipe title is required' });
    }

    // Check if already saved
    const existing = await SavedRecipe.findOne({ user: req.user._id, title });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Recipe is already in your saved collection',
        recipe: existing,
      });
    }

    const recipe = await SavedRecipe.create({
      user: req.user._id,
      title,
      time: time || '20 mins',
      servings: servings || '2 servings',
      description: description || '',
      usesIngredients: usesIngredients || [],
      missingIngredients: missingIngredients || [],
      steps: steps || [],
    });

    res.status(201).json({
      success: true,
      message: 'Recipe saved to your favorites!',
      recipe,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's saved recipes
// @route   GET /api/recipes/saved
// @access  Private
export const getSavedRecipes = async (req, res, next) => {
  try {
    const recipes = await SavedRecipe.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: recipes.length,
      recipes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a saved recipe
// @route   DELETE /api/recipes/saved/:id
// @access  Private
export const deleteSavedRecipe = async (req, res, next) => {
  try {
    const recipe = await SavedRecipe.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Saved recipe not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Recipe removed from favorites',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a recipe as cooked: marks used ingredients as used & records savings
// @route   POST /api/recipes/cooked
// @access  Private
export const markRecipeAsCooked = async (req, res, next) => {
  try {
    const { recipeId, recipeTitle, usedIngredients = [] } = req.body;
    const userId = req.user._id;

    let itemsSaved = 0;
    let totalMoneySaved = 0;

    // Match each ingredient name with active pantry items
    for (const ingredient of usedIngredients) {
      // Find matching active pantry item
      const item = await PantryItem.findOne({
        user: userId,
        isUsed: false,
        isWasted: false,
        name: { $regex: new RegExp(ingredient.trim().split(' ')[0], 'i') },
      });

      if (item) {
        item.isUsed = true;
        item.usedAt = new Date();
        await item.save();
        itemsSaved++;
        totalMoneySaved += item.estimatedPrice || 3.5;
      }
    }

    // If no exact match found, provide baseline estimated value
    if (itemsSaved === 0) {
      itemsSaved = Math.max(1, usedIngredients.length);
      totalMoneySaved = itemsSaved * 3.5;
    }

    // Update monthly waste stats
    const currentMonth = getMonthString();
    await WasteStat.findOneAndUpdate(
      { user: userId, month: currentMonth },
      {
        $inc: {
          itemsSavedCount: itemsSaved,
          moneySaved: totalMoneySaved,
        },
      },
      { upsert: true, new: true }
    );

    // If recipe is saved, update cooked count
    if (recipeId) {
      await SavedRecipe.findByIdAndUpdate(recipeId, {
        $inc: { cookedCount: 1 },
        $set: { lastCookedAt: new Date() },
      });
    }

    res.status(200).json({
      success: true,
      message: `Delicious! Cooked "${recipeTitle || 'Recipe'}" — saved ${itemsSaved} items (~$${totalMoneySaved.toFixed(2)}).`,
      itemsSaved,
      moneySaved: totalMoneySaved,
    });
  } catch (error) {
    next(error);
  }
};
