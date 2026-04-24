import { Suspense } from "react";
import { startOfWeek, format } from "date-fns";
import { getWalkerCalendarAction } from "./actions";
import { WalkerCalendarClient } from "./WalkerCalendarClient";

interface Props {
  searchParams: Promise<{ week?: string }>;
}

export default async function WalkerCalendarPage({ searchParams }: Props) {
  const params = await searchParams;
  const weekStart = params.week ?? format(startOfWeek(new Date(), { weekStartsOn: 0 }), "yyyy-MM-dd");
  const { walks } = await getWalkerCalendarAction(weekStart);

  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-400">טוען...</div>}>
      <WalkerCalendarClient walks={walks} weekStart={weekStart} />
    </Suspense>
  );
}
