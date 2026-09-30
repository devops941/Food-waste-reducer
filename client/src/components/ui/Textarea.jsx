import React from 'react';
import { cn } from '../../utils/cn';

export const Textarea = React.forwardRef(({
  label,
  error,
  helperText,
  id,
  className,
  rows = 3,
  required,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-semibold text-charcoal tracking-wide flex items-center gap-1"
        >
          {label}
          {required && <span className="text-terracotta-500">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        required={required}
        className={cn(
          'w-full bg-white text-charcoal text-sm rounded-xl border border-charcoal-border',
          'p-3.5 transition-smooth placeholder:text-charcoal-faint resize-y',
          'focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20',
          error && 'border-status-expired focus:border-status-expired focus:ring-status-expired/20',
          className
        )}
        {...props}
      />

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

Textarea.displayName = 'Textarea';
export default Textarea;
