/**
 * Shared utilities for server action error handling.
 *
 * Server actions throw plain Error objects. These helpers provide:
 * - A standard result type for actions that return instead of throwing
 * - Hebrew error message mapping for known domain errors
 * - Client-side error extraction from caught exceptions
 */

export type ActionResult = {
  success: true;
} | {
  success: false;
  error: string;
  code?: string;
};

/** Known backend error messages → Hebrew user-facing messages */
const ERROR_MAP: Record<string, string> = {
  "Walker profile not found": "פרופיל מוביל לא נמצא",
  "Dog not assigned": "הכלב לא משויך אליך",
  "Price not set": "לא ניתן להתחיל טיול עד שיוגדר מחיר",
  "Walk already active": "כבר יש הליכה פעילה לכלב הזה",
  "Walk not found": "ההליכה לא נמצאה",
  "Forbidden": "אין לך הרשאה לפעולה זו",
  "Walk not LIVE": "ההליכה כבר הסתיימה",
  "Insert failed": "שגיאה בשמירת הנתונים",
};

/** Optional context for structured error logging. */
export interface ActionErrorContext {
  action: string;
  [key: string]: unknown;
}

/** Extract a user-facing Hebrew error from a caught exception. */
export function getActionError(err: unknown, ctx?: ActionErrorContext): string {
  if (err instanceof Error) {
    // Next.js server actions wrap errors — check message
    const msg = err.message;

    // Check known domain errors
    for (const [key, hebrew] of Object.entries(ERROR_MAP)) {
      if (msg.includes(key)) return hebrew;
    }

    // Network / fetch errors
    if (msg.includes("fetch") || msg.includes("network") || msg.includes("Failed to fetch")) {
      return "בעיית חיבור — בדוק את האינטרנט ונסה שוב";
    }

    // NEXT_REDIRECT is not an error — it's how redirect() works in server actions
    if (msg === "NEXT_REDIRECT" || msg.includes("NEXT_REDIRECT")) {
      throw err; // Re-throw so redirect actually happens
    }

    console.error("[action-utils] unmapped error", { ...ctx, error: msg });
    return "שגיאה לא צפויה — נסה שוב";
  }
  console.error("[action-utils] unmapped non-Error", { ...ctx, error: err });
  return "שגיאה לא צפויה — נסה שוב";
}
