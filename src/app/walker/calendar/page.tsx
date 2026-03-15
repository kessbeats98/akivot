import { CalendarDays, ChevronRight, ChevronLeft } from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";

function buildCalendarGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Convert Sunday=0 to RTL layout: week starts Sunday on right → col order Sun..Sat
  // Hebrew day headers: א'=Sun ב'=Mon ג'=Tue ד'=Wed ה'=Thu ו'=Fri ש'=Sat
  return { firstDay, daysInMonth };
}

const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

const DAY_HEADERS = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];

export default function WalkerCalendarPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const { firstDay, daysInMonth } = buildCalendarGrid(year, month);
  // Grid: Sunday=0 is leftmost column in LTR, but we render RTL
  // Pad with empty cells before day 1
  const emptyCells = firstDay; // Sunday=0 means no padding if month starts Sunday
  const cells: (number | null)[] = [
    ...Array(emptyCells).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]" dir="rtl">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-10 pb-4">
        <div className="flex items-center gap-3">
          <CalendarDays size={24} className="text-[#2A9D8F]" />
          <h1 className="text-xl font-bold text-neutral-800">יומן טיולים</h1>
        </div>
        <button className="px-4 py-1.5 rounded-full bg-[#2A9D8F]/10 text-[#2A9D8F] text-sm font-medium">
          היסטוריה
        </button>
      </header>

      <main className="flex-1 px-6 pb-28">
        {/* Calendar card */}
        <div className="bg-white rounded-xl p-6 border border-[#2A9D8F]/5 shadow-sm">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100">
              <ChevronRight size={18} className="text-neutral-500" />
            </button>
            <span className="font-bold text-neutral-800">
              {HEBREW_MONTHS[month]} {year}
            </span>
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100">
              <ChevronLeft size={18} className="text-neutral-500" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_HEADERS.map((d) => (
              <div key={d} className="text-center text-xs text-neutral-400 font-medium">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-6">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`e-${idx}`} />;
              const isToday = day === today;
              return (
                <div key={day} className="flex flex-col items-center h-10 justify-center">
                  <span
                    className={
                      isToday
                        ? "text-[#2A9D8F] font-black underline underline-offset-4 text-sm"
                        : "text-neutral-700 text-sm"
                    }
                  >
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity log */}
        <div className="mt-8">
          <h3 className="font-bold text-lg text-neutral-800 mb-4">יומן פעילות</h3>
          <div className="bg-[#2A9D8F]/5 rounded-xl p-6 flex flex-col items-center gap-2">
            <CalendarDays size={32} className="text-[#2A9D8F]/40" />
            <p className="text-neutral-500 text-sm">אין טיולים לאחרונה</p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
