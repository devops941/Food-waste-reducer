import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Loader({
  size = 'md',
  message,
  fullScreen = false,
  className,
}) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3 text-sage-600', className)}>
      <Loader2 className={cn('animate-spin text-sage-500', sizeClasses[size] || sizeClasses.md)} />
      {message && (
        <p className="text-xs sm:text-sm font-medium text-charcoal-muted animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-cream-100/80 backdrop-blur-xs flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return <div className="py-8 flex items-center justify-center">{content}</div>;
}

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-cream-200/80', className)}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-charcoal-border/70 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-1/2" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export default Loader;
