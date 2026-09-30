import React from 'react';
import { cn } from '../../utils/cn';

const colorThemes = {
  sage: {
    iconBg: 'bg-sage-100 text-sage-600',
    border: 'border-sage-200/80',
    hover: 'hover:border-sage-300',
  },
  terracotta: {
    iconBg: 'bg-terracotta-100 text-terracotta-600',
    border: 'border-terracotta-200/80',
    hover: 'hover:border-terracotta-300',
  },
  amber: {
    iconBg: 'bg-status-soon-bg text-status-soon',
    border: 'border-amber-200/80',
    hover: 'hover:border-amber-300',
  },
  fresh: {
    iconBg: 'bg-status-fresh-bg text-status-fresh',
    border: 'border-emerald-200/80',
    hover: 'hover:border-emerald-300',
  },
};

export function StatCard({
  icon,
  label,
  value,
  subtitle,
  trend,
  color = 'sage',
  className,
}) {
  const theme = colorThemes[color] || colorThemes.sage;

  return (
    <div
      className={cn(
        'bg-white rounded-2xl p-5 border shadow-soft transition-smooth',
        'flex flex-col justify-between',
        theme.border,
        theme.hover,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs sm:text-sm font-medium text-charcoal-muted uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className={cn('p-2.5 rounded-xl shrink-0 flex items-center justify-center', theme.iconBg)}>
            {icon}
          </div>
        )}
      </div>

      <div>
        <div className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal tracking-tight">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1.5 text-xs text-charcoal-muted">
            {trend && (
              <span className="font-medium text-sage-600 bg-sage-50 px-1.5 py-0.5 rounded">
                {trend}
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
