"use server";

import { revalidatePath } from "next/cache";
import { assertAuthenticated } from "@/lib/auth/session";
import { getDogById, updateDog, getWalkHistoryByDog, getDogStats } from "@/lib/repositories/dogsRepo";
import { updateDogSchema } from "@/lib/validation/dogs";
import type { DogWithWalkers, DogStats } from "@/lib/repositories/dogsRepo";
import type { DogWalkHistoryItem } from "@/lib/services/walks/types";

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
