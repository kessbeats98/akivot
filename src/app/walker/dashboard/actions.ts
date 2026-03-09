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
  await startWalk(user.id, input);
  revalidatePath("/walker/dashboard");
}

export async function endWalkAction(walkId: string, _formData: FormData): Promise<void> {
  const user = await assertAuthenticated();
  const input = endWalkSchema.parse({ walkId });
  await endWalk(user.id, input);
  revalidatePath("/walker/dashboard");
}
