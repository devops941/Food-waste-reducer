import React from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" showClose={!isLoading}>
      <div className="flex flex-col items-center text-center p-2">
        <div className="w-12 h-12 rounded-2xl bg-status-expired-bg border border-status-expired/20 flex items-center justify-center text-status-expired mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h3 className="font-serif text-xl font-medium text-charcoal mb-2">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed mb-6 max-w-xs">
          {message}
        </p>

        <div className="flex items-center justify-center gap-3 w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant={variant}
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
