"use server";

import { revalidatePath } from "next/cache";
import { assertAuthenticated } from "@/lib/auth/session";
import { getDogById, updateDog, getWalkHistoryByDog, getDogStats, assertDogOwnership } from "@/lib/repositories/dogsRepo";
import { updateDogSchema } from "@/lib/validation/dogs";
import { assignWalkerSchema } from "@/lib/validation/walks";
import { assignWalker } from "@/lib/repositories/walksRepo";
import type { DogWithWalkers, DogStats } from "@/lib/repositories/dogsRepo";
import type { DogWalkHistoryItem } from "@/lib/services/walks/types";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/drizzle";
import { walkerProfiles } from "@/db/schema";

export async function getAvailableWalkersAction(): Promise<{ id: string; displayName: string }[]> {
  await assertAuthenticated();
  const db = getDb();
  return db
    .select({ id: walkerProfiles.id, displayName: walkerProfiles.displayName })
    .from(walkerProfiles)
    .where(eq(walkerProfiles.isAcceptingClients, true));
}

export async function assignWalkerAction(dogId: string, formData: FormData): Promise<void> {
  const user = await assertAuthenticated();
  await assertDogOwnership(dogId, user.id);
  const walkerProfileId = formData.get("walkerProfileId");
  if (!walkerProfileId) throw new Error("Walker is required");
  const input = assignWalkerSchema.parse({ dogId, walkerProfileId });
  await assignWalker(input);
  revalidatePath(`/owner/dog-profile/${dogId}`);
  revalidatePath("/owner/dashboard");
}

export async function getDogProfileAction(dogId: string): Promise<{
  dog: DogWithWalkers;
  walkHistory: DogWalkHistoryItem[];
  stats: DogStats;
}> {
  const user = await assertAuthenticated();
  const [dog, walkHistory, stats] = await Promise.all([
    getDogById(dogId, user.id),
    getWalkHistoryByDog(dogId, user.id),
    getDogStats(dogId),
  ]);
  return { dog, walkHistory, stats };
}

export async function updateDogAction(dogId: string, formData: FormData): Promise<void> {
  const user = await assertAuthenticated();
  const raw = {
    name: formData.get("name") as string | null ?? undefined,
    breed: formData.get("breed") as string | null ?? undefined,
    birthDate: formData.get("birthDate") as string | null ?? undefined,
    notes: formData.get("notes") as string | null ?? undefined,
  };
  // Remove empty strings
  const cleaned = Object.fromEntries(
    Object.entries(raw).filter(([, v]) => v !== undefined && v !== ""),
  );
  const input = updateDogSchema.parse(cleaned);
  await updateDog(dogId, user.id, input);
  revalidatePath(`/owner/dog-profile/${dogId}`);
}
