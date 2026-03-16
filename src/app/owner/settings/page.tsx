import { EnableNotificationsButton } from "@/components/EnableNotificationsButton";
import { Info, LogOut, Bell } from "lucide-react";

export default function OwnerSettingsPage() {
  return (
    <div className="animate-in fade-in duration-300 pb-32">
      <header className="px-6 pt-6 pb-4">
        <h1 className="text-3xl font-black text-dark tracking-tight">הגדרות</h1>
      </header>

      <main className="px-6 space-y-6">
        {/* PWA Install */}
        <section className="bg-dark rounded-[2rem] p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Info size={20} className="text-brand-light" />
            <h3 className="font-bold">התקנה למסך הבית</h3>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            לחץ על תפריט הדפדפן (⋮) ובחר &quot;הוסף למסך הבית&quot; לגישה מהירה כמו אפליקציה.
          </p>
        </section>

        {/* Notifications */}
        <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
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

        {/* Logout */}
        <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
          <a
            href="/api/auth/sign-out"
            className="flex items-center gap-3 text-danger"
          >
            <LogOut size={20} />
            <span className="font-bold">התנתק</span>
          </a>
        </section>
      </main>
    </div>
  );
}
