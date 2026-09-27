'use client';

import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  isDeleting?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone. This record will be permanently deleted.',
  confirmText = 'Delete',
  isDeleting = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 z-10 text-center animate-in fade-in zoom-in-95">
        <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800/50 text-red-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-100">{title}</h3>
        <p className="text-xs text-slate-400 mt-2 mb-6 leading-relaxed">{message}</p>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-lg shadow-red-600/30 transition disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
