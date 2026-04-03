import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-3">ברוכים הבאים לעקבות</h1>
        <p className="text-sm text-muted-color mb-8">
          מה התפקיד שלך?
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/owner/dashboard"
            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 block"
          >
            בעל כלב
          </Link>
          <Link
            href="/walker/dashboard"
            className="w-full rounded-lg border border-border py-3 text-sm font-semibold transition-colors hover:bg-stone100 block"
          >
            דוגווקר
          </Link>
        </div>
      </div>
    </div>
  );
}
