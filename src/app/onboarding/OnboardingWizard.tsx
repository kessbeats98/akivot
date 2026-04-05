"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOwnerProfileAction, createWalkerProfileAction } from "./actions";

type Step = "role" | "owner" | "walker";

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("role");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleOwnerSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const result = await createOwnerProfileAction(formData);
      router.push(result.redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה ביצירת פרופיל");
      setLoading(false);
    }
  }

  async function handleWalkerSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const result = await createWalkerProfileAction(formData);
      router.push(result.redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה ביצירת פרופיל");
      setLoading(false);
    }
  }

  if (step === "role") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-3">ברוכים הבאים לעקבות</h1>
          <p className="text-sm text-muted-color mb-8">מה התפקיד שלך?</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setStep("owner")}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              בעל כלב
            </button>
            <button
              onClick={() => setStep("walker")}
              className="w-full rounded-lg border border-border py-3 text-sm font-semibold transition-colors hover:bg-stone100"
            >
              דוגווקר
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "owner") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <button
            onClick={() => setStep("role")}
            className="text-sm text-muted-color mb-4 hover:text-dark"
          >
            ← חזרה
          </button>
          <h1 className="text-2xl font-bold mb-6">הוסף את הכלב הראשון</h1>
          <form onSubmit={handleOwnerSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="dogName" className="block text-sm font-medium mb-1">
                שם הכלב
              </label>
              <input
                id="dogName"
                name="dogName"
                type="text"
                required
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="למשל: רקס"
              />
            </div>
            <div>
              <label htmlFor="breed" className="block text-sm font-medium mb-1">
                גזע (אופציונלי)
              </label>
              <input
                id="breed"
                name="breed"
                type="text"
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="למשל: לברדור"
              />
            </div>
            {error && <p className="text-sm text-danger text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "יוצר..." : "המשך"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // step === "walker"
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <button
          onClick={() => setStep("role")}
          className="text-sm text-muted-color mb-4 hover:text-dark"
        >
          ← חזרה
        </button>
        <h1 className="text-2xl font-bold mb-6">יצירת פרופיל דוגווקר</h1>
        <form onSubmit={handleWalkerSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium mb-1">
              שם תצוגה
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              required
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="השם שיוצג לבעלי הכלבים"
            />
          </div>
          {error && <p className="text-sm text-danger text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "יוצר..." : "המשך"}
          </button>
        </form>
      </div>
    </div>
  );
}
