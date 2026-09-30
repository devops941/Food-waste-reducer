import React, { useState } from 'react';
import { 
  Clock, 
  Users, 
  CheckCircle2, 
  ShoppingCart, 
  Utensils, 
  Bookmark, 
  BookmarkCheck,
  AlertCircle
} from 'lucide-react';
import { Modal, Button, Badge } from '../ui';

export function RecipeDetailModal({
  isOpen,
  onClose,
  recipe,
  isSaved = false,
  onToggleSave,
  onCooked,
  onAddMissingToShopping,
}) {
  const [isCooking, setIsCooking] = useState(false);
  const [isAddingShopping, setIsAddingShopping] = useState(false);

  if (!recipe) return null;

  const handleCook = async () => {
    setIsCooking(true);
    try {
      await onCooked(recipe);
      onClose();
    } finally {
      setIsCooking(false);
    }
  };

  const handleAddShopping = async () => {
    setIsAddingShopping(true);
    try {
      await onAddMissingToShopping(recipe.missingIngredients || []);
    } finally {
      setIsAddingShopping(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recipe.title}
      subtitle={`${recipe.time || '20 mins'} • ${recipe.servings || '2 servings'}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 pt-1">
        
        {/* Recipe Summary */}
        {recipe.description && (
          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed bg-cream-50 p-3.5 rounded-xl border border-cream-200">
            {recipe.description}
          </p>
        )}

        {/* Ingredients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* In Pantry */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-status-fresh" />
              <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">
                From Your Pantry ({recipe.usesIngredients?.length || 0})
              </h4>
            </div>
            <ul className="space-y-1.5">
              {(recipe.usesIngredients || []).map((ing, i) => (
                <li
                  key={i}
                  className="text-xs text-charcoal bg-white p-2 rounded-lg border border-charcoal-border/70 flex items-center gap-2 shadow-soft-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-status-fresh shrink-0" />
                  <span>{ing}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Missing Ingredients */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">
                  Missing Staples ({recipe.missingIngredients?.length || 0})
                </h4>
              </div>
            </div>

            {recipe.missingIngredients && recipe.missingIngredients.length > 0 ? (
              <div className="space-y-2">
                <ul className="space-y-1.5">
                  {recipe.missingIngredients.map((ing, i) => (
                    <li
                      key={i}
                      className="text-xs text-charcoal-muted bg-amber-50/50 p-2 rounded-lg border border-amber-200/60 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddShopping}
                  isLoading={isAddingShopping}
                  leftIcon={<ShoppingCart className="w-3.5 h-3.5" />}
                  className="w-full text-xs text-amber-900 border-amber-300 hover:bg-amber-100/50"
                >
                  Add Missing to Shopping List
                </Button>
              </div>
            ) : (
              <div className="text-xs text-charcoal-muted italic p-3 bg-cream-50 rounded-lg border border-cream-200">
                You have all necessary ingredients in your pantry! 🎉
              </div>
            )}
          </div>
        </div>

        {/* Step by step instructions */}
        <div className="space-y-3 pt-2">
          <h4 className="font-serif text-base font-semibold text-charcoal">
            Cooking Instructions
          </h4>
          <ol className="space-y-2.5">
            {(recipe.steps || []).map((step, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-xs sm:text-sm text-charcoal-light leading-relaxed"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sage-100 text-sage-800 text-xs font-bold shrink-0 mt-0.5 border border-sage-200">
                  {idx + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Modal Action Footer */}
        <div className="pt-4 border-t border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onToggleSave && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleSave(recipe)}
                leftIcon={
                  isSaved ? (
                    <BookmarkCheck className="w-4 h-4 text-terracotta-500 fill-terracotta-500" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )
                }
                className="w-full sm:w-auto"
              >
                {isSaved ? 'Saved in Favorites' : 'Save Recipe'}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="ghost" size="sm" onClick={onClose} className="w-full sm:w-auto">
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCook}
              isLoading={isCooking}
              leftIcon={<Utensils className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-soft"
            >
              I Cooked This
            </Button>
          </div>
        </div>

      </div>
    </Modal>
  );
}

export default RecipeDetailModal;
