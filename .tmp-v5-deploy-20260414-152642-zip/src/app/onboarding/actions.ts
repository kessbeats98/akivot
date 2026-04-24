"use server";

import { headers } from "next/headers";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth/better-auth";
import { getDb } from "@/db/drizzle";
import { walkerProfiles } from "@/db/schema";
import { createDog } from "@/lib/repositories/dogsRepo";
import { getUserRole } from "@/lib/auth/get-user-role";

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthenticated");
  return session.user;
}

export async function getOnboardingState() {
  const user = await requireUser();
  const role = await getUserRole(user.id);
  return { role, userId: user.id };
}

export async function createOwnerProfileAction(formData: FormData) {
  const user = await requireUser();

  const name = (formData.get("dogName") as string)?.trim();
  if (!name || name.length < 1) throw new Error("Dog name required");

  const breed = (formData.get("breed") as string)?.trim() || undefined;

  await createDog(user.id, { name, breed });

  return { redirectTo: "/owner/dashboard" };
}

export async function createWalkerProfileAction(formData: FormData) {
  const user = await requireUser();

  const displayName = (formData.get("displayName") as string)?.trim();
  if (!displayName || displayName.length < 1) throw new Error("Display name required");

  const inviteCode = randomBytes(6).toString("hex");
  const now = new Date();
  const db = getDb();

  await db.insert(walkerProfiles).values({
    userId: user.id,
    displayName,
    inviteCode,
    updatedAt: now,
  });

  return { redirectTo: "/walker/dashboard" };
}
