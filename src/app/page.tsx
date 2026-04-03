import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 py-32 px-16">
        <h1 className="text-3xl font-bold tracking-tight">
          עקבות — Akivot
        </h1>
        <p className="text-center text-muted-color">
          ניהול טיולי כלבים לדוגווקרים ובעלי כלבים
        </p>
        <div className="flex gap-4 text-base font-medium">
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            כניסה
          </Link>
          <Link
            href="/signup"
            className="flex h-12 items-center justify-center rounded-lg border border-border px-8 text-sm font-semibold transition-colors hover:bg-stone100"
          >
            הרשמה
          </Link>
        </div>
      </main>
    </div>
  );
}
