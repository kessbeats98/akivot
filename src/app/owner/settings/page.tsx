import Link from "next/link";
import { eq } from "drizzle-orm";
import { EnableNotificationsButton } from "@/components/EnableNotificationsButton";
import { PhoneSettingsCard } from "@/components/settings/PhoneSettingsCard";
import { Info, LogOut, Bell } from "lucide-react";
import { assertAuthenticated } from "@/lib/auth/session";
import { getDb } from "@/db/drizzle";
import { users } from "@/db/schema";

export default async function OwnerSettingsPage() {
  const sessionUser = await assertAuthenticated();
  const db = getDb();
  const [row] = await db
    .select({ phone: users.phone })
    .from(users)
    .where(eq(users.id, sessionUser.id))
    .limit(1);
  const phone = row?.phone ?? null;

  return (
    <div className="animate-in fade-in duration-300 pb-32">
      <header className="px-6 pt-6 pb-4">
        <Link href="/owner/dashboard" className="text-sm text-gray-400 block mb-1">← בית</Link>
        <h1 className="text-lg font-semibold text-gray-500">הגדרות</h1>
      </header>

      <main className="px-6 space-y-6">
        {/* PWA Install — slim hint, no card */}
        <section className="flex items-start gap-3 px-1">
          <Info size={16} className="text-gray-400 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-400 leading-relaxed">
            לחץ על תפריט הדפדפן (⋮) ובחר &quot;הוסף למסך הבית&quot; לגישה מהירה כמו אפליקציה.
          </p>
        </section>

        {/* Phone — allows quick WhatsApp/call actions around walks and open billing */}
        <PhoneSettingsCard initialPhone={phone} />

        {/* Notifications — primary card, border only */}
        <section className="bg-white rounded-[2rem] p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-brand" />
              <div>
                <h3 className="font-bold text-dark">התראות טיולים</h3>
                <p className="text-xs text-gray-400">קבל עדכונים כשהכלב בטיול</p>
              </div>
            </div>
            <EnableNotificationsButton />
          </div>
        </section>

        {/* Logout — plain inline link */}
        <section className="px-1">
          <a
            href="/api/auth/sign-out"
            className="flex items-center gap-3 text-danger text-sm"
          >
            <LogOut size={18} />
            <span>התנתק</span>
          </a>
        </section>
      </main>
    </div>
  );
}
