"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PawPrint, Loader2 } from "lucide-react";
import { ErrorBanner } from "@/components/shared/ErrorBanner";

export function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "שגיאה בכניסה. נסה שוב.");
      }

      // Redirect will happen via server-side on refresh
      // Force a full page reload to let the server handle routing
      router.refresh();
      window.location.href = "/login";
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בכניסה. נסה שוב.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-b from-primary to-primary/80 z-50">
      {/* Logo area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12">
        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
          <PawPrint className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">עקבות</h1>
        <p className="text-white/80 text-lg">ניהול טיולי כלבים חכם</p>
      </div>

      {/* Login card */}
      <div className="bg-card rounded-t-[32px] px-6 pt-8 pb-10 safe-area-bottom">
        <h2 className="text-xl font-semibold text-foreground text-center mb-6">
          כניסה לחשבון
        </h2>

        {error && (
          <div className="mb-4">
            <ErrorBanner message={error} onClose={() => setError(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
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
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
              סיסמה
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              dir="ltr"
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                מתחבר...
              </>
            ) : (
              "כניסה"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            {"אין לך חשבון? "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              הרשמה
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/forgot-password" className="text-muted-foreground text-sm hover:text-foreground">
            שכחת סיסמה?
          </Link>
        </div>
      </div>
    </div>
  );
}
