import Link from "next/link";
import { eq } from "drizzle-orm";
import { getWalkerBillingAction } from "./actions";
import { WalkerBillingSurface } from "@/components/walker/WalkerBillingSurface";
import { assertAuthenticated } from "@/lib/auth/session";
import { getDb } from "@/db/drizzle";
import { users } from "@/db/schema";
import { isUsablePhone } from "@/lib/phone";
import { getWalkerWeekSummaryWalks } from "@/lib/repositories/walksRepo";

export default async function WalkerBillingPage() {
  const sessionUser = await assertAuthenticated();
  const [phoneRow] = await getDb()
    .select({ phone: users.phone })
    .from(users)
    .where(eq(users.id, sessionUser.id))
    .limit(1);
  const hasWalkerPhone = isUsablePhone(phoneRow?.phone);

  if (!hasWalkerPhone) {
    return (
      <div className="animate-in fade-in duration-300 pb-32 px-6 pt-10">
        <Link
          href="/walker/dashboard"
          className="inline-flex items-center gap-1 text-brand/60 text-sm font-medium mb-6 hover:text-brand transition-colors"
        >
          <span className="material-symbols-rounded text-base">arrow_forward</span>
          {"בית"}
        </Link>
        <section className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center space-y-3">
          <h1 className="text-lg font-semibold text-dark">נדרש מספר טלפון לשימוש בכספים</h1>
          <p className="text-sm text-muted-color leading-relaxed">
            המספר משמש את בעלי הכלבים ליצירת קשר סביב חיוב פתוח.
          </p>
          <Link
            href="/walker/settings"
            className="inline-block text-sm font-semibold text-brand"
          >
            הוספה בהגדרות
          </Link>
        </section>
      </div>
    );
  }

  const now = new Date();
  const [data, weekSummary] = await Promise.all([
    getWalkerBillingAction(),
    getWalkerWeekSummaryWalks(sessionUser.id, now),
  ]);
  return (
    <WalkerBillingSurface
      periods={data.periods}
      unbilledWalks={data.unbilledWalks}
      weekSummary={weekSummary}
      weekStart={now}
    />
  );
}
