import React from 'react';
import { cn } from '../../utils/cn';
import { getExpiryBadgeInfo } from '../../utils/dateUtils';

const badgeVariants = {
  sage: 'bg-sage-100 text-sage-800 border-sage-200/70',
  terracotta: 'bg-terracotta-100 text-terracotta-800 border-terracotta-200/70',
  cream: 'bg-cream-200 text-charcoal border-cream-300/80',
  neutral: 'bg-gray-100 text-charcoal-muted border-gray-200',
  fresh: 'bg-status-fresh-bg text-status-fresh border-status-fresh/20',
  soon: 'bg-status-soon-bg text-status-soon border-status-soon/30',
  expired: 'bg-status-expired-bg text-status-expired border-status-expired/20',
};

export function Badge({
  children,
  variant = 'sage',
  size = 'md',
  dot = false,
  dotColor,
  className,
  ...props
}) {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full font-medium',
    md: 'text-xs px-2.5 py-1 rounded-full font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border font-sans select-none',
        badgeVariants[variant] || badgeVariants.sage,
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotColor || 'bg-current'
          )}
        />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ expiryDate, status: overrideStatus, className }) {
  const info = getExpiryBadgeInfo(expiryDate);
  const status = overrideStatus || info.status;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors',
        info.bgClass,
        className
      )}
    >
      <span className={cn('w-2 h-2 rounded-full animate-pulse shrink-0', info.dotClass)} />
      {info.label}
    </span>
  );
}

export default Badge;
