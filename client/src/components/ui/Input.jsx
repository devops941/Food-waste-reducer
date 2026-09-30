import React from 'react';
import { cn } from '../../utils/cn';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  id,
  className,
  type = 'text',
  required,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-charcoal tracking-wide flex items-center gap-1"
        >
          {label}
          {required && <span className="text-terracotta-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-charcoal-muted">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={cn(
            'w-full bg-white text-charcoal text-sm rounded-xl border border-charcoal-border',
            'px-3.5 py-2.5 transition-smooth placeholder:text-charcoal-faint',
            'focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-status-expired focus:border-status-expired focus:ring-status-expired/20',
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 flex items-center text-charcoal-muted">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-status-expired font-medium flex items-center gap-1 mt-0.5">
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

Input.displayName = 'Input';
export default Input;
