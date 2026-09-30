import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export const DatePicker = React.forwardRef(({
  label,
  value,
  onChange,
  error,
  helperText,
  id,
  className,
  required,
  showPresets = true,
  min,
  ...props
}, ref) => {
  const dateId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const setPreset = (daysToAdd) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    const isoString = d.toISOString().split('T')[0];
    if (onChange) {
      onChange({ target: { value: isoString, name: props.name } });
    }
  };

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label
          htmlFor={dateId}
          className="text-xs font-semibold text-charcoal tracking-wide flex items-center gap-1"
        >
          {label}
          {required && <span className="text-terracotta-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          ref={ref}
          id={dateId}
          type="date"
          value={value || ''}
          onChange={onChange}
          min={min}
          required={required}
          className={cn(
            'w-full bg-white text-charcoal text-sm rounded-xl border border-charcoal-border',
            'px-3.5 py-2.5 transition-smooth',
            'focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20',
            error && 'border-status-expired focus:border-status-expired focus:ring-status-expired/20',
            className
          )}
          {...props}
        />
      </div>

      {showPresets && (
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <span className="text-[11px] text-charcoal-muted font-medium mr-1">Quick pick:</span>
          {[
            { label: '+2d', days: 2 },
            { label: '+5d', days: 5 },
            { label: '+1 wk', days: 7 },
            { label: '+2 wks', days: 14 },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setPreset(preset.days)}
              className="px-2 py-0.5 text-[11px] rounded-md bg-sage-50 hover:bg-sage-100 text-sage-700 border border-sage-200/60 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

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

DatePicker.displayName = 'DatePicker';
export default DatePicker;
