"use server";

import { assertAuthenticated } from "@/lib/auth/session";
import { getDb } from "@/db/drizzle";
import { dogs, dogOwners, dogWalkers, walkerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

export async function seedTestScenarioAction(): Promise<{
  dogId: string;
  walkerProfileId: string;
  dogWalkerId: string;
}> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed is disabled in production");
  }

  const user = await assertAuthenticated();
  const db = getDb();
  const now = new Date();

  return await db.transaction(async (tx) => {
    // Ensure walker profile exists
    const [existing] = await tx
      .select({ id: walkerProfiles.id })
      .from(walkerProfiles)
      .where(eq(walkerProfiles.userId, user.id))
      .limit(1);

    let walkerProfileId: string;
    if (existing) {
      walkerProfileId = existing.id;
    } else {
      const [wp] = await tx
        .insert(walkerProfiles)
        .values({
          userId: user.id,
          displayName: user.name,
          inviteCode: `dev-${crypto.randomUUID()}`,
          updatedAt: now,
        })
        .returning({ id: walkerProfiles.id });
      walkerProfileId = wp!.id;
    }

    // Create dog
    const [dog] = await tx
      .insert(dogs)
      .values({
        name: "\u05E8\u05E7\u05E1 (\u05D8\u05E1\u05D8)",
        breed: "\u05DC\u05D1\u05E8\u05D3\u05D5\u05E8",
        isActive: true,
        updatedAt: now,
      })
      .returning({ id: dogs.id });
    const dogId = dog!.id;

    // Create dog owner (current user owns this dog)
    await tx.insert(dogOwners).values({
      dogId,
      ownerUserId: user.id,
      isPrimary: true,
    });

    // Create dog walker assignment
    const [dw] = await tx
      .insert(dogWalkers)
      .values({
        dogId,
        walkerProfileId,
        currentPrice: "50.00",
        currency: "ILS",
        isActive: true,
        startedAt: now,
        updatedAt: now,
      })
      .returning({ id: dogWalkers.id });
    const dogWalkerId = dw!.id;

    console.log("[dev/seed] seeded test scenario", { dogId, walkerProfileId, dogWalkerId });
    return { dogId, walkerProfileId, dogWalkerId };
  });
}
