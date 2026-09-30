import React from 'react';
import { cn } from '../../utils/cn';

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  className,
}) {
  return (
    <header className={cn('flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-2', className)}>
      <div className="space-y-1.5 max-w-xl">
        {badge && <div className="mb-2">{badge}</div>}
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-charcoal tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-charcoal-muted font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
          {actions}
        </div>
      )}
    </header>
  );
}

export default PageHeader;
