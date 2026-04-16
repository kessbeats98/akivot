import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getRedirectPath } from "@/lib/auth/get-redirect-path-action";

export default async function Home() {
  try {
    const path = await getRedirectPath();
    if (path !== "/login") redirect(path);
  } catch { /* DB down — show landing page normally */ }
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-16 gap-10">
      {/* Brand */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-light text-4xl">
          🐾
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold tracking-tight text-dark">עקבות</h1>
          <p className="text-xs font-medium tracking-widest text-muted-color uppercase">Akivot</p>
        </div>
        <p className="text-base text-muted-color max-w-xs leading-relaxed">
          הפלטפורמה לניהול טיולי כלבים — לדוגווקרים ולבעלי כלבים
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col w-full max-w-xs gap-3">
        <Button asChild size="lg" className="w-full">
          <Link href="/login">כניסה</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="w-full">
          <Link href="/signup">הרשמה</Link>
        </Button>
      </div>

      {/* Feature bullets */}
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {[
          { icon: "📍", text: "מעקב טיולים בזמן אמת" },
          { icon: "💳", text: "ניהול תשלומים ותקופות חיוב" },
          { icon: "🔔", text: "התראות לבעלי כלבים" },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-3 rounded-xl bg-stone100 px-4 py-3">
            <span className="text-lg">{icon}</span>
            <span className="text-sm text-dark">{text}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
