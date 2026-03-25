"use server";

import { assertAuthenticated } from "@/lib/auth/session";
import { getWalksByOwner } from "@/lib/repositories/walksRepo";
import type { OwnerCalendarData } from "@/lib/services/walks/types";

export async function getOwnerCalendarAction(
  monthIso: string,
): Promise<OwnerCalendarData> {
  const user = await assertAuthenticated();
  const start = new Date(monthIso + "-01");
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  const walks = await getWalksByOwner(user.id, start, end);
  return { walks };
}
