import { Suspense } from "react";
import { format } from "date-fns";
import { getOwnerCalendarAction } from "./actions";
import { OwnerCalendarClient } from "./OwnerCalendarClient";

interface Props {
  searchParams: Promise<{ month?: string }>;
}

export default async function OwnerCalendarPage({ searchParams }: Props) {
  const params = await searchParams;
  const month = params.month ?? format(new Date(), "yyyy-MM");
  const { walks } = await getOwnerCalendarAction(month);

  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-400">טוען...</div>}>
      <OwnerCalendarClient walks={walks} month={month} />
    </Suspense>
  );
}
