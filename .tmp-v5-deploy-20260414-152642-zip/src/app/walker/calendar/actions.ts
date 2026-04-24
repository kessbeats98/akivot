"use server";

import { assertAuthenticated } from "@/lib/auth/session";
import { getWalksByDateRange } from "@/lib/repositories/walksRepo";
import type { WalkerCalendarData } from "@/lib/services/walks/types";

export async function getWalkerCalendarAction(
  weekStartIso: string,
): Promise<WalkerCalendarData> {
  const user = await assertAuthenticated();
  const start = new Date(weekStartIso);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const walks = await getWalksByDateRange(user.id, start, end);
  return { walks };
}
