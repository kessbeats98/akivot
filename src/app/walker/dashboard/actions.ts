"use server";

import { revalidatePath } from "next/cache";
import { assertAuthenticated } from "@/lib/auth/session";
import { startWalkSchema, endWalkSchema } from "@/lib/validation/walks";
import {
  startWalk,
  endWalk,
  getAssignedDogsByWalker,
  getActiveWalksByWalker,
} from "@/lib/repositories/walksRepo";
import type { WalkerDashboardData } from "@/lib/services/walks/types";
import { notifyWalkEvent } from "@/lib/services/notifications/fcmService";
import { getDb } from "@/db/drizzle";
import { walks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWalkerDashboardAction(): Promise<WalkerDashboardData> {
  const user = await assertAuthenticated();
  const [assignedDogs, activeWalks] = await Promise.all([
    getAssignedDogsByWalker(user.id),
    getActiveWalksByWalker(user.id),
  ]);
  return { assignedDogs, activeWalks };
}

export async function startWalkAction(dogId: string, _formData: FormData): Promise<void> {
  const user = await assertAuthenticated();
  const input = startWalkSchema.parse({ dogId });
  const walkId = await startWalk(user.id, input);
  revalidatePath("/walker/dashboard");
  // 30s grace period — only notify if walk is still LIVE (guards accidental starts)
  if (walkId) {
    void (async () => {
      await new Promise((r) => setTimeout(r, 30_000));
      const db = getDb();
      const [row] = await db
        .select({ status: walks.status })
        .from(walks)
        .where(eq(walks.id, walkId))
        .limit(1);
      if (row?.status === "LIVE") void notifyWalkEvent(walkId, "WALK_STARTED");
    })();
  }
}

export async function endWalkAction(walkId: string, _formData: FormData): Promise<void> {
  const user = await assertAuthenticated();
  const input = endWalkSchema.parse({ walkId });
  await endWalk(user.id, input);
  revalidatePath("/walker/dashboard");
  // Fire-and-forget; notifyWalkEvent never throws
  void notifyWalkEvent(walkId, "WALK_COMPLETED");
}
