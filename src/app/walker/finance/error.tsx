"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function WalkerFinanceError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-16 h-16 rounded-full bg-destructive-light flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2 text-center">
        לא ניתן לטעון את דף הכספים
      </h2>
      <p className="text-muted-foreground text-sm text-center mb-6">
        אירעה שגיאה בטעינת הנתונים. נסה שוב.
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        נסה שוב
      </button>
    </div>
  );
}
