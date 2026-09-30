import React from 'react';
import { Clock, Users, Bookmark, BookmarkCheck, ChefHat, Sparkles } from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { cn } from '../../utils/cn';

export function RecipeCard({
  recipe,
  onSelect,
  isSaved = false,
  onToggleSave,
}) {
  const usesCount = recipe.usesIngredients?.length || 0;
  const missingCount = recipe.missingIngredients?.length || 0;

  return (
    <Card
      hover
      className="flex flex-col justify-between p-5 space-y-4 cursor-pointer group"
      onClick={() => onSelect(recipe)}
    >
      <div>
        {/* Badges row & Bookmark */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-sage-100 text-sage-800 px-2.5 py-0.5 rounded-full border border-sage-200/80">
              <Sparkles className="w-3 h-3 text-sage-600" />
              Uses {usesCount} pantry items
            </span>
            {missingCount > 0 && (
              <span className="text-[11px] font-medium bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200/70">
                {missingCount} missing
              </span>
            )}
          </div>

          {onToggleSave && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(recipe);
              }}
              className={cn(
                'p-1.5 rounded-full transition-colors focus-ring',
                isSaved
                  ? 'text-terracotta-500 bg-terracotta-50'
                  : 'text-charcoal-muted hover:text-charcoal hover:bg-cream-200'
              )}
              title={isSaved ? 'Remove from saved' : 'Save recipe'}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 fill-current" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif text-lg font-semibold text-charcoal group-hover:text-sage-700 transition-colors leading-snug mb-2">
          {recipe.title}
        </h3>

        {/* Description */}
        {recipe.description && (
          <p className="text-xs text-charcoal-muted line-clamp-2 leading-relaxed mb-3">
            {recipe.description}
          </p>
        )}

        {/* Meta details: Time & Servings */}
        <div className="flex items-center gap-4 text-xs text-charcoal-muted pt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-sage-600" />
            {recipe.time || '20 mins'}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-sage-600" />
            {recipe.servings || '2 servings'}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-cream-200/80 flex items-center justify-between text-xs">
        <span className="text-charcoal-faint">
          {recipe.steps?.length || 4} simple steps
        </span>
        <span className="font-semibold text-sage-600 group-hover:text-sage-700 flex items-center gap-1">
          View Recipe →
        </span>
      </div>
    </Card>
  );
}

export default RecipeCard;
