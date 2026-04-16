import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-5xl">📬</div>
        <h1 className="text-2xl font-bold mb-3">!כמעט שם</h1>
        <p className="text-sm text-muted-color mb-8">
          שלחנו לך מייל עם קישור קצר — פשוט לחצו עליו ואנחנו מסדרים את השאר.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          לא קיבלתי? חזרה לכניסה
        </Link>
      </div>
    </div>
  );
}
