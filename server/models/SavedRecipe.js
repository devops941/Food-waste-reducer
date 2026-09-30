import mongoose from 'mongoose';

const savedRecipeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      default: '20 mins',
    },
    servings: {
      type: String,
      default: '2-3 servings',
    },
    description: {
      type: String,
      default: '',
    },
    usesIngredients: {
      type: [String],
      default: [],
    },
    missingIngredients: {
      type: [String],
      default: [],
    },
    steps: {
      type: [String],
      default: [],
    },
    cookedCount: {
      type: Number,
      default: 0,
    },
    lastCookedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const SavedRecipe = mongoose.model('SavedRecipe', savedRecipeSchema);
export default SavedRecipe;
