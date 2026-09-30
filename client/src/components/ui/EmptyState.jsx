import React from 'react';
import { cn } from '../../utils/cn';
import Button from './Button';

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  className,
}) {
  return (
    <div
      className={cn(
        'w-full bg-white/60 border border-dashed border-charcoal-border/80 rounded-2xl',
        'py-12 px-6 flex flex-col items-center justify-center text-center max-w-lg mx-auto',
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-sage-50 border border-sage-100 flex items-center justify-center text-sage-600 mb-4 shadow-soft-sm">
        {icon || <span className="text-2xl">🌱</span>}
      </div>

      <h3 className="font-serif text-lg sm:text-xl font-medium text-charcoal">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-charcoal-muted max-w-sm mt-1.5 leading-relaxed">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <div className="mt-5">
          <Button
            onClick={onAction}
            variant="primary"
            size="md"
            leftIcon={actionIcon}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
