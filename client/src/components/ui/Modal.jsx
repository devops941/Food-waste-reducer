import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  showClose = true,
  className,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className={cn(
          'relative w-full bg-white rounded-3xl shadow-soft-lg border border-charcoal-border/80',
          'p-6 sm:p-8 z-10 my-8 overflow-hidden transform transition-all',
          'animate-in fade-in zoom-in-95 duration-200',
          maxWidth,
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-cream-200/80 mb-5">
            <div>
              {title && (
                <h2 className="font-serif text-xl sm:text-2xl font-medium text-charcoal">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
                  {subtitle}
                </p>
              )}
            </div>

            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-charcoal-muted hover:text-charcoal hover:bg-cream-200 transition-colors focus-ring"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="modal-body max-h-[75vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
