import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Select = React.forwardRef(({
  label,
  error,
  helperText,
  options = [],
  children,
  id,
  className,
  required,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-charcoal tracking-wide flex items-center gap-1"
        >
          {label}
          {required && <span className="text-terracotta-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={cn(
            'w-full bg-white text-charcoal text-sm rounded-xl border border-charcoal-border',
            'px-3.5 py-2.5 pr-10 appearance-none transition-smooth cursor-pointer',
            'focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20',
            error && 'border-status-expired focus:border-status-expired focus:ring-status-expired/20',
            className
          )}
          {...props}
        >
          {children || options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>

        <div className="absolute right-3.5 pointer-events-none text-charcoal-muted">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error ? (
        <p className="text-xs text-status-expired font-medium mt-0.5">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-charcoal-muted mt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
