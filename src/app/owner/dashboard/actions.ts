"use server";

import { revalidatePath } from "next/cache";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { assertAuthenticated } from "@/lib/auth/session";
import { createDogSchema, deactivateDogSchema } from "@/lib/validation/dogs";
import { 
  getDogsByOwner, 
  createDog, 
  deactivateDog, 
  assertDogOwnership, 
  assertDogWalkerOwnership, 
  setDogWalkerPrice,
  type DogWithWalkers,
} from "@/lib/repositories/dogsRepo";
import { getDb } from "@/db/drizzle";
import { walkerProfiles, walks, dogs, users } from "@/db/schema";
import { setPriceSchema } from "@/lib/validation/billing";
import { assignWalkerSchema } from "@/lib/validation/walks";
import { assignWalker } from "@/lib/repositories/walksRepo";
import type { WalkStatus } from "@/lib/services/walks/types";

export type OwnerDashboardData = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  dogs: Array<DogWithWalkers & {
    liveWalk: {
      id: string;
      startTime: Date;
      walkerName: string;
    } | null;
    lastWalk: {
      id: string;
      completedAt: Date;
      durationMinutes: number;
      walkerName: string;
    } | null;
  }>;
  recentWalks: Array<{
    id: string;
    dogName: string;
    dogId: string;
    walkerName: string;
    status: WalkStatus;
    startTime: Date;
    endTime: Date | null;
    durationMinutes: number | null;
  }>;
  availableWalkers: Array<{ id: string; displayName: string }>;
};

export async function getOwnerDashboardAction(): Promise<OwnerDashboardData> {
  const user = await assertAuthenticated();
  const db = getDb();

  // Get dogs with walkers
  const dogsWithWalkers = await getDogsByOwner(user.id);
  
  // Get available walkers
  const availableWalkers = await db
    .select({ id: walkerProfiles.id, displayName: walkerProfiles.displayName })
    .from(walkerProfiles)
    .where(eq(walkerProfiles.isAcceptingClients, true));

  // Get dog IDs for querying walks
  const dogIds = dogsWithWalkers.map(d => d.id);

  // Get live walks for these dogs
  const liveWalks = dogIds.length > 0 ? await db
    .select({
      id: walks.id,
      dogId: walks.dogId,
      startTime: walks.startTime,
      walkerProfileId: walks.walkerProfileId,
    })
    .from(walks)
    .where(and(
      inArray(walks.dogId, dogIds),
      eq(walks.status, "LIVE"),
      isNull(walks.deletedAt)
    )) : [];

  // Get recent completed walks
  const recentWalksData = dogIds.length > 0 ? await db
    .select({
      id: walks.id,
      dogId: walks.dogId,
      walkerProfileId: walks.walkerProfileId,
      status: walks.status,
      startTime: walks.startTime,
      endTime: walks.endTime,
      durationMinutes: walks.durationMinutes,
      completedAt: walks.completedAt,
    })
    .from(walks)
    .where(and(
      inArray(walks.dogId, dogIds),
      isNull(walks.deletedAt)
    ))
    .orderBy(walks.startTime)
    .limit(10) : [];

  // Get walker names for all walks
  const walkerProfileIds = [...new Set([
    ...liveWalks.map(w => w.walkerProfileId),
    ...recentWalksData.map(w => w.walkerProfileId),
  ])];
  
  const walkerNames = walkerProfileIds.length > 0 ? await db
    .select({ id: walkerProfiles.id, displayName: walkerProfiles.displayName })
    .from(walkerProfiles)
    .where(inArray(walkerProfiles.id, walkerProfileIds)) : [];
  
  const walkerNameMap = new Map(walkerNames.map(w => [w.id, w.displayName]));

  // Build dogs with live/last walk info
  const dogsWithWalkInfo = dogsWithWalkers.map(dog => {
    const liveWalk = liveWalks.find(w => w.dogId === dog.id);
    const completedWalks = recentWalksData
      .filter(w => w.dogId === dog.id && w.status === "COMPLETED" && w.completedAt)
      .sort((a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0));
    const lastWalk = completedWalks[0];

    return {
      ...dog,
      liveWalk: liveWalk ? {
        id: liveWalk.id,
        startTime: liveWalk.startTime,
        walkerName: walkerNameMap.get(liveWalk.walkerProfileId) ?? "Unknown",
      } : null,
      lastWalk: lastWalk && lastWalk.completedAt ? {
        id: lastWalk.id,
        completedAt: lastWalk.completedAt,
        durationMinutes: lastWalk.durationMinutes ?? 0,
        walkerName: walkerNameMap.get(lastWalk.walkerProfileId) ?? "Unknown",
      } : null,
    };
  });

  // Build recent walks list
  const dogNameMap = new Map(dogsWithWalkers.map(d => [d.id, d.name]));
  const recentWalks = recentWalksData.map(walk => ({
    id: walk.id,
    dogName: dogNameMap.get(walk.dogId) ?? "Unknown",
    dogId: walk.dogId,
    walkerName: walkerNameMap.get(walk.walkerProfileId) ?? "Unknown",
    status: walk.status as WalkStatus,
    startTime: walk.startTime,
    endTime: walk.endTime,
    durationMinutes: walk.durationMinutes,
  }));

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    dogs: dogsWithWalkInfo,
    recentWalks,
    availableWalkers,
  };
}

export async function getOwnerDogsAction() {
  const user = await assertAuthenticated();
  return getDogsByOwner(user.id);
}

export async function getAvailableWalkersAction(): Promise<{ id: string; displayName: string }[]> {
  await assertAuthenticated();
  const db = getDb();
  return db
    .select({ id: walkerProfiles.id, displayName: walkerProfiles.displayName })
    .from(walkerProfiles)
    .where(eq(walkerProfiles.isAcceptingClients, true));
}

export async function createDogAction(formData: FormData) {
  const user = await assertAuthenticated();
  const input = createDogSchema.parse({
    name: formData.get("name"),
    breed: formData.get("breed") || undefined,
    birthDate: formData.get("birthDate") || undefined,
    notes: formData.get("notes") || undefined,
  });
  await createDog(user.id, input);
  revalidatePath("/owner");
  revalidatePath("/owner/dashboard");
}

export async function deactivateDogAction(dogId: string, _formData: FormData) {
  const user = await assertAuthenticated();
  const { dogId: validatedId } = deactivateDogSchema.parse({ dogId });
  await deactivateDog(validatedId, user.id);
  revalidatePath("/owner");
  revalidatePath("/owner/dashboard");
}

export async function setPriceAction(dogWalkerId: string, formData: FormData): Promise<void> {
  const user = await assertAuthenticated();
  await assertDogWalkerOwnership(dogWalkerId, user.id);
  const input = setPriceSchema.parse({ dogWalkerId, price: formData.get("price") });
  await setDogWalkerPrice(input.dogWalkerId, input.price);
  revalidatePath("/owner");
  revalidatePath("/owner/dashboard");
}

export async function assignWalkerAction(dogId: string, formData: FormData): Promise<void> {
  const user = await assertAuthenticated();
  await assertDogOwnership(dogId, user.id);
  const walkerProfileId = formData.get("walkerProfileId");
  if (!walkerProfileId) throw new Error("Walker is required");
  const input = assignWalkerSchema.parse({ dogId, walkerProfileId });
  await assignWalker(input);
  revalidatePath("/owner");
  revalidatePath("/owner/dashboard");
}
