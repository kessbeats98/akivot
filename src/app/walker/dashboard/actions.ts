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
  console.log("[walker/dashboard] loading dashboard for user:", user.id);
  try {
    const [assignedDogs, activeWalks] = await Promise.all([
      getAssignedDogsByWalker(user.id),
      getActiveWalksByWalker(user.id),
    ]);
    console.log("[walker/dashboard] loaded:", { dogs: assignedDogs.length, activeWalks: activeWalks.length });
    return { assignedDogs, activeWalks };
  } catch (err) {
    // User has no walker profile — return empty dashboard
    if (err instanceof Error && err.message === "Walker profile not found") {
      console.log("[walker/dashboard] no walker profile for user:", user.id);
      return { assignedDogs: [], activeWalks: [] };
    }
    throw err;
  }
}

export async function startWalkAction(dogId: string, _formData: FormData): Promise<void> {
  const user = await assertAuthenticated();
  console.log("[walker/dashboard] startWalkAction called", { userId: user.id, dogId });
  const input = startWalkSchema.parse({ dogId });
  const walkId = await startWalk(user.id, input);
  console.log("[walker/dashboard] walk started:", walkId);
  revalidatePath("/walker/dashboard");
  // 30s grace period — only notify if walk is still LIVE (guards accidental starts)
  if (walkId) {
    void (async () => {
      try {
        await new Promise((r) => setTimeout(r, 30_000));
        const db = getDb();
        const [row] = await db
          .select({ status: walks.status })
          .from(walks)
          .where(eq(walks.id, walkId))
          .limit(1);
        if (row?.status === "LIVE") {
          console.log("[walker/dashboard] 30s grace passed, notifying WALK_STARTED");
          void notifyWalkEvent(walkId, "WALK_STARTED");
        } else {
          console.log("[walker/dashboard] 30s grace: walk no longer LIVE, skipping notification");
        }
      } catch (err) {
        console.error("[walker/dashboard] 30s grace notification error:", err);
      }
    })();
  }
}

export async function endWalkAction(walkId: string, _formData: FormData): Promise<void> {
  const user = await assertAuthenticated();
  console.log("[walker/dashboard] endWalkAction called", { userId: user.id, walkId });
  const input = endWalkSchema.parse({ walkId });
  await endWalk(user.id, input);
  console.log("[walker/dashboard] walk ended:", walkId);
  revalidatePath("/walker/dashboard");
  // Fire-and-forget; notifyWalkEvent never throws
  void notifyWalkEvent(walkId, "WALK_COMPLETED");
}
