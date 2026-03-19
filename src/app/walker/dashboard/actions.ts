"use server";

import { revalidatePath } from "next/cache";
import { eq, and, isNull } from "drizzle-orm";
import { assertAuthenticated } from "@/lib/auth/session";
import { startWalkSchema, endWalkSchema } from "@/lib/validation/walks";
import {
  startWalk,
  endWalk,
  getAssignedDogsByWalker,
  getActiveWalksByWalker,
} from "@/lib/repositories/walksRepo";
import { getPeriodsByWalker } from "@/lib/repositories/billingRepo";
import { getUserWithWalkerProfile } from "@/lib/repositories/usersRepo";
import { getDb } from "@/db/drizzle";
import { walks, walkBatches, dogs, users, dogOwners } from "@/db/schema";
import type { WalkWithDog, AssignedDog } from "@/lib/services/walks/types";
import type { PaymentPeriodWithEntries } from "@/lib/services/billing/types";
import { notifyWalkEvent } from "@/lib/services/notifications/fcmService";

export type WalkerDashboardData = {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    walkerDisplayName: string;
  };
  assignedDogs: AssignedDog[];
  activeWalks: WalkWithDog[];
  activeBatch: {
    id: string;
    startedAt: Date;
    dogNames: string[];
  } | null;
  todaySummary: {
    walkCount: number;
    totalMinutes: number;
    earnings: number;
  };
  openPeriods: Array<{
    id: string;
    ownerName: string;
    ownerUserId: string;
    totalAmount: string;
    walkCount: number;
  }>;
};

export async function getWalkerDashboardAction(): Promise<WalkerDashboardData> {
  const sessionUser = await assertAuthenticated();
  const db = getDb();
  
  // Get user with walker profile
  const userWithProfile = await getUserWithWalkerProfile(sessionUser.id);
  if (!userWithProfile?.walkerProfile) {
    throw new Error("Walker profile not found");
  }

  const [assignedDogs, activeWalks, allPeriods] = await Promise.all([
    getAssignedDogsByWalker(sessionUser.id),
    getActiveWalksByWalker(sessionUser.id),
    getPeriodsByWalker(sessionUser.id),
  ]);

  // Get active batch if there are active walks
  let activeBatch: WalkerDashboardData["activeBatch"] = null;
  if (activeWalks.length > 0) {
    const firstWalk = activeWalks[0];
    // Find the batch for these walks
    const [batch] = await db
      .select({
        id: walkBatches.id,
        startedAt: walkBatches.startedAt,
      })
      .from(walkBatches)
      .where(and(
        eq(walkBatches.walkerProfileId, userWithProfile.walkerProfile.id),
        eq(walkBatches.status, "LIVE")
      ))
      .limit(1);

    if (batch) {
      activeBatch = {
        id: batch.id,
        startedAt: batch.startedAt,
        dogNames: activeWalks.map(w => w.dogName),
      };
    } else {
      // Use the first walk's start time if no batch
      activeBatch = {
        id: "single",
        startedAt: firstWalk.startTime,
        dogNames: activeWalks.map(w => w.dogName),
      };
    }
  }

  // Calculate today's summary
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayWalks = await db
    .select({
      id: walks.id,
      durationMinutes: walks.durationMinutes,
      finalPrice: walks.finalPrice,
    })
    .from(walks)
    .where(and(
      eq(walks.walkerProfileId, userWithProfile.walkerProfile.id),
      eq(walks.status, "COMPLETED"),
      isNull(walks.deletedAt)
    ));

  // Filter walks that started today (simplified - in production use proper date filtering)
  const todaySummary = {
    walkCount: todayWalks.length,
    totalMinutes: todayWalks.reduce((sum, w) => sum + (w.durationMinutes ?? 0), 0),
    earnings: todayWalks.reduce((sum, w) => sum + parseFloat(w.finalPrice ?? "0"), 0),
  };

  // Get open periods with owner names
  const openPeriods: WalkerDashboardData["openPeriods"] = [];
  for (const period of allPeriods.filter(p => p.status === "OPEN")) {
    const [owner] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, period.ownerUserId))
      .limit(1);
    
    openPeriods.push({
      id: period.id,
      ownerName: owner?.name ?? "Unknown",
      ownerUserId: period.ownerUserId,
      totalAmount: period.totalAmount,
      walkCount: period.entries.filter(e => e.entryType === "WALK").length,
    });
  }

  return {
    user: {
      id: userWithProfile.id,
      name: userWithProfile.name,
      email: userWithProfile.email,
      image: userWithProfile.image,
      walkerDisplayName: userWithProfile.walkerProfile.displayName,
    },
    assignedDogs,
    activeWalks,
    activeBatch,
    todaySummary,
    openPeriods,
  };
}

export async function startWalkAction(dogId: string, _formData: FormData): Promise<void> {
  const user = await assertAuthenticated();
  const input = startWalkSchema.parse({ dogId });
  const walkId = await startWalk(user.id, input);
  revalidatePath("/walker");
  revalidatePath("/walker/dashboard");
  // Fire-and-forget; notifyWalkEvent never throws
  if (walkId) void notifyWalkEvent(walkId, "WALK_STARTED");
}

export async function endWalkAction(walkId: string, _formData: FormData): Promise<void> {
  const user = await assertAuthenticated();
  const input = endWalkSchema.parse({ walkId });
  await endWalk(user.id, input);
  revalidatePath("/walker");
  revalidatePath("/walker/dashboard");
  // Fire-and-forget; notifyWalkEvent never throws
  void notifyWalkEvent(walkId, "WALK_COMPLETED");
}

export async function startBatchWalksAction(dogIds: string[]): Promise<void> {
  const user = await assertAuthenticated();
  // Start walks for all selected dogs
  for (const dogId of dogIds) {
    const input = startWalkSchema.parse({ dogId });
    const walkId = await startWalk(user.id, input);
    if (walkId) void notifyWalkEvent(walkId, "WALK_STARTED");
  }
  revalidatePath("/walker");
  revalidatePath("/walker/dashboard");
}

export async function endAllActiveWalksAction(): Promise<void> {
  const user = await assertAuthenticated();
  const activeWalks = await getActiveWalksByWalker(user.id);
  
  for (const walk of activeWalks) {
    const input = endWalkSchema.parse({ walkId: walk.id });
    await endWalk(user.id, input);
    void notifyWalkEvent(walk.id, "WALK_COMPLETED");
  }
  
  revalidatePath("/walker");
  revalidatePath("/walker/dashboard");
}
