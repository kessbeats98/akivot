"use client";

import { X, AlertCircle } from "lucide-react";

type ErrorBannerProps = {
  message: string;
  onClose?: () => void;
};

export function ErrorBanner({ message, onClose }: ErrorBannerProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-destructive-light border border-destructive/20 rounded-lg">
      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
      <p className="flex-1 text-sm text-destructive font-medium">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-destructive/10 transition-colors"
          aria-label="סגור הודעה"
        >
          <X className="w-4 h-4 text-destructive" />
        </button>
      )}
    </div>
  );
}
