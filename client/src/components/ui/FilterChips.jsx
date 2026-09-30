import React from 'react';
import { cn } from '../../utils/cn';

export function Chip({
  label,
  selected = false,
  onClick,
  icon,
  count,
  className,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-smooth cursor-pointer select-none',
        'border focus-ring',
        selected
          ? 'bg-sage-500 text-white border-sage-600 shadow-soft-sm'
          : 'bg-white text-charcoal border-charcoal-border hover:bg-sage-50/60 hover:border-sage-300',
        className
      )}
    >
      {icon && <span className="text-current text-xs">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            'px-1.5 py-0.2 rounded-full text-[11px] font-semibold',
            selected
              ? 'bg-white/20 text-white'
              : 'bg-cream-200 text-charcoal-muted'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function FilterChips({
  options = [],
  value,
  onChange,
  className,
  isMulti = false,
}) {
  const isSelected = (val) => {
    if (isMulti) {
      return Array.isArray(value) && value.includes(val);
    }
    return value === val;
  };

  const handleSelect = (val) => {
    if (isMulti) {
      const currentList = Array.isArray(value) ? [...value] : [];
      if (currentList.includes(val)) {
        onChange(currentList.filter((item) => item !== val));
      } else {
        onChange([...currentList, val]);
      }
    } else {
      onChange(val);
    }
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {options.map((opt) => {
        const val = typeof opt === 'object' ? opt.value : opt;
        const lbl = typeof opt === 'object' ? opt.label : opt;
        const icon = typeof opt === 'object' ? opt.icon : null;
        const count = typeof opt === 'object' ? opt.count : undefined;

        return (
          <Chip
            key={val}
            label={lbl}
            icon={icon}
            count={count}
            selected={isSelected(val)}
            onClick={() => handleSelect(val)}
          />
        );
      })}
    </div>
  );
}

export default FilterChips;
