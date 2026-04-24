import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">404 — דף לא נמצא</h1>
      <Link href="/" className="text-blue-600 underline">
        חזרה לדף הבית
      </Link>
    </main>
  );
}
