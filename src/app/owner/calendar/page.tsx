import { CalendarDays, ChevronRight, ChevronLeft } from "lucide-react";

function buildCalendarGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

const DAY_HEADERS = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];

export default function OwnerCalendarPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const { firstDay, daysInMonth } = buildCalendarGrid(year, month);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="animate-in fade-in duration-300 pb-32">
      <header className="px-6 pt-6 pb-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <CalendarDays size={24} className="text-brand" />
          <h1 className="text-xl font-bold text-dark">יומן הטיולים</h1>
        </div>
      </header>

      <main className="px-6">
        <div className="bg-white rounded-[2rem] p-6 border border-brand/5 shadow-glass">
          <div className="flex items-center justify-between mb-6">
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
              <ChevronRight size={18} className="text-gray-500" />
            </button>
            <span className="font-bold text-dark">
              {HEBREW_MONTHS[month]} {year}
            </span>
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
              <ChevronLeft size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAY_HEADERS.map((d) => (
              <div key={d} className="text-center text-xs text-gray-400 font-medium">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-4">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`e-${idx}`} />;
              const isToday = day === today;
              return (
                <div key={day} className="flex flex-col items-center h-10 justify-center">
                  <span
                    className={
                      isToday
                        ? "w-8 h-8 flex items-center justify-center rounded-full bg-brand text-white font-bold text-sm"
                        : "text-dark/70 text-sm"
                    }
                  >
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* TODO: fetch real walk history for owner */}
        <div className="mt-8">
          <h3 className="font-bold text-lg text-dark mb-4">טיולים אחרונים</h3>
          <div className="bg-brand/5 rounded-[2rem] p-6 flex flex-col items-center gap-2">
            <CalendarDays size={32} className="text-brand/40" />
            <p className="text-gray-500 text-sm">אין טיולים לאחרונה</p>
          </div>
        </div>
      </main>
    </div>
  );
}
