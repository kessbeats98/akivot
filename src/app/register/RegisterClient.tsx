"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PawPrint, Loader2 } from "lucide-react";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { signUp } from "@/lib/auth/auth-client";

export function RegisterClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("הסיסמה חייבת להכיל לפחות 8 תווים");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await signUp.email({
        name,
        email,
        password,
      });

      if (signUpError) {
        throw new Error(signUpError.message || "שגיאה בהרשמה. נסה שוב.");
      }

      if (data) {
        // Redirect to login after successful registration
        router.push("/login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בהרשמה. נסה שוב.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-b from-primary to-primary/80 z-50">
      {/* Logo area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-8">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
          <PawPrint className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">עקבות</h1>
        <p className="text-white/80 text-base">הצטרף אלינו</p>
      </div>

      {/* Register card */}
      <div className="bg-card rounded-t-[32px] px-6 pt-6 pb-8 safe-area-bottom">
        <h2 className="text-xl font-semibold text-foreground text-center mb-5">
          יצירת חשבון חדש
        </h2>

        {error && (
          <div className="mb-4">
            <ErrorBanner message={error} onClose={() => setError(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              שם מלא
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
              placeholder="ישראל ישראלי"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              אימייל
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              dir="ltr"
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              סיסמה
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              dir="ltr"
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
              placeholder="********"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
              אימות סיסמה
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              dir="ltr"
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                נרשם...
              </>
            ) : (
              "הרשמה"
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-muted-foreground text-sm">
            {"כבר יש לך חשבון? "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              כניסה
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
