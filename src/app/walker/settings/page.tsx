import { redirect } from "next/navigation";
import { assertAuthenticated } from "@/lib/auth/session";
import { getDb } from "@/db/drizzle";
import { walkerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CopyCodeButton } from "./CopyCodeButton";
import Link from "next/link";

export default async function WalkerSettingsPage() {
  const user = await assertAuthenticated();
  const db = getDb();
  const rows = await db
    .select({ inviteCode: walkerProfiles.inviteCode })
    .from(walkerProfiles)
    .where(eq(walkerProfiles.userId, user.id))
    .limit(1);

  if (!rows[0]) redirect("/walker/dashboard");

  const { inviteCode } = rows[0];

  return (
    <div className="animate-in fade-in duration-300 pb-32 px-6 pt-6">
      <Link
        href="/walker/dashboard"
        className="flex items-center gap-1 text-brand font-medium text-sm mb-6"
      >
        <span className="material-symbols-rounded text-lg">arrow_forward</span>
        חזרה
      </Link>

      <h1 className="text-2xl font-black text-dark mb-1">הקוד שלי</h1>
      <p className="text-sm text-gray-500 mb-6">
        שתף את הקוד הזה עם בעלי כלבים כדי שיוכלו לשייך אותך לכלב שלהם
      </p>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col items-center gap-4">
        <p className="font-mono text-2xl font-black tracking-widest text-dark select-all">
          {inviteCode}
        </p>
        <CopyCodeButton code={inviteCode} />
      </div>
    </div>
  );
}
