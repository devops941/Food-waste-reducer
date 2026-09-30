import React from 'react';
import { cn } from '../../utils/cn';

export function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-charcoal-border/70 shadow-soft p-5 transition-smooth',
        hover && 'hover:shadow-soft-hover hover:border-sage-300 hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 pb-4 border-b border-cream-200/80 mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, as: Tag = 'h3', ...props }) {
  return (
    <Tag className={cn('font-serif text-lg md:text-xl font-medium text-charcoal', className)} {...props}>
      {children}
    </Tag>
  );
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p className={cn('text-xs md:text-sm text-charcoal-muted mt-1', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={cn('pt-4 border-t border-cream-200/80 mt-4 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  );
}

export default Card;
