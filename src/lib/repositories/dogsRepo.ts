import { eq, and } from "drizzle-orm";
import { getDb } from "@/db/drizzle";
import { dogs, dogOwners, dogWalkers, walkerProfiles } from "@/db/schema";
import type { CreateDogInput } from "@/lib/validation/dogs";

export type DogWithWalkers = {
  id: string;
  name: string;
  breed: string | null;
  birthDate: string | null;
  imageUrl: string | null;
  notes: string | null;
  walkers: { walkerProfileId: string; displayName: string; isActive: boolean }[];
};

/** All active dogs owned by a user, with assigned walkers. */
export async function getDogsByOwner(ownerUserId: string): Promise<DogWithWalkers[]> {
  const db = getDb();
  const rows = await db
    .select({
      dog: dogs,
      walkerProfileId: dogWalkers.walkerProfileId,
      walkerDisplayName: walkerProfiles.displayName,
      walkerIsActive: dogWalkers.isActive,
    })
    .from(dogOwners)
    .innerJoin(dogs, eq(dogs.id, dogOwners.dogId))
    .leftJoin(dogWalkers, eq(dogWalkers.dogId, dogs.id))
    .leftJoin(walkerProfiles, eq(walkerProfiles.id, dogWalkers.walkerProfileId))
    .where(and(eq(dogOwners.ownerUserId, ownerUserId), eq(dogs.isActive, true)));

  const map = new Map<string, DogWithWalkers>();
  for (const row of rows) {
    if (!map.has(row.dog.id)) {
      map.set(row.dog.id, {
        id: row.dog.id,
        name: row.dog.name,
        breed: row.dog.breed,
        birthDate: row.dog.birthDate,
        imageUrl: row.dog.imageUrl,
        notes: row.dog.notes,
        walkers: [],
      });
    }
    if (row.walkerProfileId) {
      map.get(row.dog.id)!.walkers.push({
        walkerProfileId: row.walkerProfileId,
        displayName: row.walkerDisplayName ?? "",
        isActive: row.walkerIsActive ?? false,
      });
    }
  }
  return Array.from(map.values());
}

/** Throws "Forbidden" if dog is not owned by user. */
export async function assertDogOwnership(dogId: string, ownerUserId: string): Promise<void> {
  const db = getDb();
  const [row] = await db
    .select({ id: dogOwners.id })
    .from(dogOwners)
    .where(and(eq(dogOwners.dogId, dogId), eq(dogOwners.ownerUserId, ownerUserId)))
    .limit(1);
  if (!row) throw new Error("Forbidden");
}

/** Insert dog + dogOwner in a transaction. DB generates UUID for dog.id. */
export async function createDog(ownerUserId: string, input: CreateDogInput): Promise<void> {
  const db = getDb();
  const now = new Date();
  await db.transaction(async (tx) => {
    const result = await tx
      .insert(dogs)
      .values({
        name: input.name,
        breed: input.breed ?? null,
        birthDate: input.birthDate ?? null,
        imageUrl: null,
        notes: input.notes ?? null,
        isActive: true,
        updatedAt: now,
      })
      .returning({ id: dogs.id });
    const inserted = result[0];
    if (!inserted) throw new Error("Insert failed");
    await tx.insert(dogOwners).values({
      dogId: inserted.id,
      ownerUserId,
      isPrimary: true,
    });
  });
}

export async function deactivateDog(dogId: string, ownerUserId: string): Promise<void> {
  await assertDogOwnership(dogId, ownerUserId);
  const db = getDb();
  await db
    .update(dogs)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(dogs.id, dogId));
}
