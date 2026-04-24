"use client";

export interface WeekSummaryWalk {
  date: Date;
  dogName: string;
}

interface Props {
  walks: WeekSummaryWalk[];
  weekStart: Date;
}

const TZ = "Asia/Jerusalem";

const dayKeyFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dayHeaderFmt = new Intl.DateTimeFormat("he-IL", {
  timeZone: TZ,
  weekday: "long",
  day: "numeric",
  month: "long",
});

const weekLabelFmt = new Intl.DateTimeFormat("he-IL", {
  timeZone: TZ,
  day: "numeric",
  month: "long",
});

function formatWeekLabel(weekStart: Date): string {
  // Derive Mon + Sun in TZ from the provided weekStart (any date in the week).
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(weekStart);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const map: Record<string, number> = {
    Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6,
  };
  const offset = map[get("weekday")] ?? 0;
  const y = Number(get("year"));
  const m = Number(get("month"));
  const d = Number(get("day"));
  const mondayUtc = new Date(Date.UTC(y, m - 1, d));
  mondayUtc.setUTCDate(mondayUtc.getUTCDate() - offset);
  const sundayUtc = new Date(mondayUtc);
  sundayUtc.setUTCDate(sundayUtc.getUTCDate() + 6);
  return `${weekLabelFmt.format(mondayUtc)} – ${weekLabelFmt.format(sundayUtc)}`;
}

interface DayGroup {
  key: string;
  header: string;
  entries: WeekSummaryWalk[];
}

function groupByDay(walks: WeekSummaryWalk[]): DayGroup[] {
  const groups = new Map<string, DayGroup>();
  for (const w of walks) {
    const key = dayKeyFmt.format(w.date);
    let g = groups.get(key);
    if (!g) {
      g = { key, header: dayHeaderFmt.format(w.date), entries: [] };
      groups.set(key, g);
    }
    g.entries.push(w);
  }
  return [...groups.values()].sort((a, b) => (a.key < b.key ? -1 : 1));
}

export function WeekSummary({ walks, weekStart }: Props) {
  if (walks.length === 0) return null;

  const groups = groupByDay(walks);
  const total = walks.length;
  const weekLabel = formatWeekLabel(weekStart);

  return (
    <details className="group">
      <summary className="cursor-pointer select-none text-xs font-semibold text-muted-color hover:text-dark transition-colors py-2 list-none flex items-center gap-2">
        <span className="material-symbols-rounded text-sm transition-transform group-open:rotate-90">chevron_left</span>
        {"השבוע"} · {total} {total === 1 ? "טיול" : "טיולים"}
      </summary>
      <div className="mt-2 rounded-xl border border-gray-100 bg-white/60 p-4 text-sm">
        <p className="text-[11px] font-medium text-muted-color mb-3">{`שבוע ${weekLabel}`}</p>
        <div className="space-y-3">
          {groups.map((g) => (
            <div key={g.key}>
              <p className="text-xs font-semibold text-dark mb-1">{g.header}</p>
              <ul className="space-y-0.5 pr-2">
                {g.entries.map((w, i) => (
                  <li key={`${g.key}-${i}`} className="text-xs text-dark/80">
                    {w.dogName}
                  </li>
                ))}
              </ul>
              {g.entries.length > 1 && (
                <p className="text-[11px] text-muted-color mt-1">
                  {g.entries.length} {"טיולים ביום זה"}
                </p>
              )}
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-color mt-4 pt-2 border-t border-gray-100">
          {"סה״כ"} {total} {total === 1 ? "טיול" : "טיולים"} {"ב-"}{groups.length} {groups.length === 1 ? "יום" : "ימים"}
        </p>
      </div>
    </details>
  );
}
