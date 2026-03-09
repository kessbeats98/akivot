"use server";

import { revalidatePath } from "next/cache";
import { assertAuthenticated } from "@/lib/auth/session";
import { createDogSchema, deactivateDogSchema } from "@/lib/validation/dogs";
import { getDogsByOwner, createDog, deactivateDog } from "@/lib/repositories/dogsRepo";

export async function getOwnerDogsAction() {
  const user = await assertAuthenticated();
  return getDogsByOwner(user.id);
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
