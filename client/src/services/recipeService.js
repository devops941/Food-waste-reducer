import api from './api';

export const recipeService = {
  suggestRecipes: async (dietaryFilter = null) => {
    const response = await api.post('/recipes/suggest', { dietaryFilter });
    return response.data;
  },

  saveRecipe: async (recipeData) => {
    const response = await api.post('/recipes/save', recipeData);
    return response.data;
  },

  getSavedRecipes: async () => {
    const response = await api.get('/recipes/saved');
    return response.data;
  },

  deleteSavedRecipe: async (id) => {
    const response = await api.delete(`/recipes/saved/${id}`);
    return response.data;
  },

  markAsCooked: async ({ recipeId, recipeTitle, usedIngredients }) => {
    const response = await api.post('/recipes/cooked', {
      recipeId,
      recipeTitle,
      usedIngredients,
    });
    return response.data;
  },
};

export default recipeService;
