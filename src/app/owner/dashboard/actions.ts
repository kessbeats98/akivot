"use server";

import { revalidatePath } from "next/cache";
import { assertAuthenticated } from "@/lib/auth/session";
import { createDogSchema, deactivateDogSchema } from "@/lib/validation/dogs";
import { getDogsByOwner, createDog, deactivateDog, assertDogOwnership, assertDogWalkerOwnership, setDogWalkerPrice, getActiveLiveWalks, getWalkHistoryByDog } from "@/lib/repositories/dogsRepo";
import type { ActiveLiveWalk } from "@/lib/repositories/dogsRepo";
import type { DogWalkHistoryItem } from "@/lib/services/walks/types";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/drizzle";
import { walkerProfiles } from "@/db/schema";
import { setPriceSchema } from "@/lib/validation/billing";
import { assignWalkerSchema } from "@/lib/validation/walks";
import { assignWalker } from "@/lib/repositories/walksRepo";

export async function getOwnerDogsAction() {
  const user = await assertAuthenticated();
  console.log("[owner/dashboard] loading dogs for user:", user.id);
  const dogs = await getDogsByOwner(user.id);
  console.log("[owner/dashboard] loaded:", dogs.length, "dogs");
  return dogs;
}

export async function getActiveLiveWalksAction(): Promise<ActiveLiveWalk[]> {
  const user = await assertAuthenticated();
  const walks = await getActiveLiveWalks(user.id);
  console.log("[owner/dashboard] live walks:", walks.length);
  return walks;
}

export async function getWalkHistoryForDogAction(dogId: string): Promise<DogWalkHistoryItem[]> {
  const user = await assertAuthenticated();
  console.log("[owner/dashboard] loading walk history", { userId: user.id, dogId });
  const history = await getWalkHistoryByDog(dogId, user.id, 50);
  console.log("[owner/dashboard] walk history loaded:", history.length, "walks");
  return history;
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
  revalidatePath("/owner/dashboard");
}

// Signature: dogId bound via .bind(null, dogId), FormData second
export async function deactivateDogAction(dogId: string, _formData: FormData) {
  const user = await assertAuthenticated();
  const { dogId: validatedId } = deactivateDogSchema.parse({ dogId });
  await deactivateDog(validatedId, user.id);
  revalidatePath("/owner/dashboard");
}

// dogWalkerId bound via .bind(null, dogWalkerId)
export async function setPriceAction(dogWalkerId: string, formData: FormData): Promise<void> {
  const user = await assertAuthenticated();
  await assertDogWalkerOwnership(dogWalkerId, user.id);
  const input = setPriceSchema.parse({ dogWalkerId, price: formData.get("price") });
  await setDogWalkerPrice(input.dogWalkerId, input.price);
  revalidatePath("/owner/dashboard");
  revalidatePath("/owner/dog-profile", "layout");
}

// dogId bound via .bind(null, dogId); FormData: walkerProfileId*
export async function assignWalkerAction(dogId: string, formData: FormData): Promise<void> {
  const user = await assertAuthenticated();
  await assertDogOwnership(dogId, user.id);
  const walkerProfileId = formData.get("walkerProfileId");
  if (!walkerProfileId) throw new Error("Walker is required");
  const input = assignWalkerSchema.parse({ dogId, walkerProfileId });
  await assignWalker(input);
  revalidatePath("/owner/dashboard");
}
