import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const toastIcons = {
  success: <CheckCircle2 className="w-5 h-5 text-status-fresh" />,
  error: <AlertCircle className="w-5 h-5 text-status-expired" />,
  warning: <AlertTriangle className="w-5 h-5 text-status-soon" />,
  info: <Info className="w-5 h-5 text-sage-500" />,
};

const toastBorders = {
  success: 'border-status-fresh/30 bg-white',
  error: 'border-status-expired/30 bg-white',
  warning: 'border-status-soon/30 bg-white',
  info: 'border-sage-300/40 bg-white',
};

export function ToastItem({ toast, onDismiss }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-2xl shadow-soft-lg border transition-all duration-300',
        'animate-in slide-in-from-top-4 fade-in max-w-sm w-full pointer-events-auto',
        toastBorders[toast.type] || toastBorders.info
      )}
    >
      <div className="shrink-0 mt-0.5">
        {toastIcons[toast.type] || toastIcons.info}
      </div>

      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-xs font-semibold text-charcoal tracking-wide">
            {toast.title}
          </h4>
        )}
        <p className="text-xs text-charcoal-muted mt-0.5 leading-relaxed break-words">
          {toast.message}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-1 text-charcoal-faint hover:text-charcoal rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none max-w-md w-full px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export default ToastContainer;
