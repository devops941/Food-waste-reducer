import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const variants = {
  primary: 'bg-sage-500 text-white hover:bg-sage-600 active:bg-sage-700 shadow-soft-sm hover:shadow-soft',
  secondary: 'bg-sage-100 text-sage-800 hover:bg-sage-200 active:bg-sage-300 border border-sage-200/60',
  terracotta: 'bg-terracotta-500 text-white hover:bg-terracotta-600 active:bg-terracotta-700 shadow-soft-sm',
  ghost: 'bg-transparent text-charcoal hover:bg-sage-50 active:bg-sage-100',
  danger: 'bg-status-expired-bg text-status-expired hover:bg-red-100 active:bg-red-200 border border-status-expired/20',
  outline: 'bg-white text-charcoal border border-charcoal-border hover:bg-cream-50 hover:border-sage-300',
};

const sizes = {
  sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 font-medium',
  md: 'text-sm px-4 py-2.5 rounded-xl gap-2 font-medium',
  lg: 'text-base px-5 py-3 rounded-2xl gap-2.5 font-semibold',
};

export const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  type = 'button',
  ...props
}, ref) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center transition-smooth focus-ring select-none cursor-pointer',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        isDisabled && 'opacity-60 cursor-not-allowed pointer-events-none shadow-none',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="inline-flex shrink-0">{rightIcon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
