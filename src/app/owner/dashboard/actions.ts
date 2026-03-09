"use server";

import { revalidatePath } from "next/cache";
import { assertAuthenticated } from "@/lib/auth/session";
import { createDogSchema, deactivateDogSchema } from "@/lib/validation/dogs";
import { getDogsByOwner, createDog, deactivateDog, assertDogOwnership, assertDogWalkerOwnership, setDogWalkerPrice } from "@/lib/repositories/dogsRepo";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/drizzle";
import { walkerProfiles } from "@/db/schema";
import { setPriceSchema } from "@/lib/validation/billing";
import { assignWalkerSchema } from "@/lib/validation/walks";
import { assignWalker } from "@/lib/repositories/walksRepo";

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
