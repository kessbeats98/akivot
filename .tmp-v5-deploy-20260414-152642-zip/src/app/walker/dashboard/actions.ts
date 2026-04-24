"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
  redirect("/walker/live");
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
