import express from 'express';
import {
  suggestRecipes,
  saveRecipe,
  getSavedRecipes,
  deleteSavedRecipe,
  markRecipeAsCooked,
} from '../controllers/recipeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/suggest', suggestRecipes);
router.post('/save', saveRecipe);
router.get('/saved', getSavedRecipes);
router.delete('/saved/:id', deleteSavedRecipe);
router.post('/cooked', markRecipeAsCooked);

export default router;
