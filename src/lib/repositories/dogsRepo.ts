import { eq, and, isNull, desc, inArray, asc, count, sql } from "drizzle-orm";
import { getDb } from "@/db/drizzle";
import { dogs, dogOwners, dogWalkers, walkerProfiles, walks, walkMedia } from "@/db/schema";
import type { CreateDogInput, UpdateDogInput } from "@/lib/validation/dogs";
import type { DogWalkHistoryItem } from "@/lib/services/walks/types";

export type DogWithWalkers = {
  id: string;
  name: string;
  breed: string | null;
  birthDate: string | null;
  imageUrl: string | null;
  notes: string | null;
  walkers: { dogWalkerId: string; walkerProfileId: string; displayName: string; isActive: boolean }[];
};

/** All active dogs owned by a user, with assigned walkers. */
export async function getDogsByOwner(ownerUserId: string): Promise<DogWithWalkers[]> {
  const db = getDb();
  const rows = await db
    .select({
      dog: dogs,
      dogWalkerId: dogWalkers.id,
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
        dogWalkerId: row.dogWalkerId ?? "",
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

export async function assertDogWalkerOwnership(dogWalkerId: string, ownerUserId: string): Promise<void> {
  const db = getDb();
  const [row] = await db
    .select({ id: dogOwners.id })
    .from(dogWalkers)
    .innerJoin(dogs, eq(dogs.id, dogWalkers.dogId))
    .innerJoin(dogOwners, eq(dogOwners.dogId, dogs.id))
    .where(and(eq(dogWalkers.id, dogWalkerId), eq(dogOwners.ownerUserId, ownerUserId)))
    .limit(1);
  if (!row) throw new Error("Forbidden");
}

export async function setDogWalkerPrice(dogWalkerId: string, price: string): Promise<void> {
  const db = getDb();
  await db
    .update(dogWalkers)
    .set({ currentPrice: price, currency: "ILS", updatedAt: new Date() })
    .where(eq(dogWalkers.id, dogWalkerId));
}

export async function deactivateDog(dogId: string, ownerUserId: string): Promise<void> {
  await assertDogOwnership(dogId, ownerUserId);
  const db = getDb();
  await db
    .update(dogs)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(dogs.id, dogId));
}

/** Get single dog by ID with walkers. Throws "Forbidden" if not owned. */
export async function getDogById(dogId: string, ownerUserId: string): Promise<DogWithWalkers> {
  await assertDogOwnership(dogId, ownerUserId);
  const db = getDb();
  const rows = await db
    .select({
      dog: dogs,
      dogWalkerId: dogWalkers.id,
      walkerProfileId: dogWalkers.walkerProfileId,
      walkerDisplayName: walkerProfiles.displayName,
      walkerIsActive: dogWalkers.isActive,
    })
    .from(dogs)
    .leftJoin(dogWalkers, eq(dogWalkers.dogId, dogs.id))
    .leftJoin(walkerProfiles, eq(walkerProfiles.id, dogWalkers.walkerProfileId))
    .where(eq(dogs.id, dogId));

  if (rows.length === 0) throw new Error("Dog not found");

  const first = rows[0]!;
  const dog: DogWithWalkers = {
    id: first.dog.id,
    name: first.dog.name,
    breed: first.dog.breed,
    birthDate: first.dog.birthDate,
    imageUrl: first.dog.imageUrl,
    notes: first.dog.notes,
    walkers: [],
  };

  for (const row of rows) {
    if (row.walkerProfileId) {
      dog.walkers.push({
        dogWalkerId: row.dogWalkerId ?? "",
        walkerProfileId: row.walkerProfileId,
        displayName: row.walkerDisplayName ?? "",
        isActive: row.walkerIsActive ?? false,
      });
    }
  }

  return dog;
}

/** Update dog fields. Ownership check included. */
export async function updateDog(dogId: string, ownerUserId: string, input: UpdateDogInput): Promise<void> {
  await assertDogOwnership(dogId, ownerUserId);
  const db = getDb();
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (input.name !== undefined) updates.name = input.name;
  if (input.breed !== undefined) updates.breed = input.breed;
  if (input.birthDate !== undefined) updates.birthDate = input.birthDate;
  if (input.notes !== undefined) updates.notes = input.notes;
  await db.update(dogs).set(updates).where(eq(dogs.id, dogId));
}

/** Walk history for a specific dog (owner perspective). */
export async function getWalkHistoryByDog(
  dogId: string,
  ownerUserId: string,
  limit = 20,
): Promise<DogWalkHistoryItem[]> {
  await assertDogOwnership(dogId, ownerUserId);
  const db = getDb();
  const rows = await db
    .select({
      id: walks.id,
      status: walks.status,
      startTime: walks.startTime,
      endTime: walks.endTime,
      durationMinutes: walks.durationMinutes,
      finalPrice: walks.finalPrice,
      walkerName: walkerProfiles.displayName,
      note: walks.note,
    })
    .from(walks)
    .innerJoin(walkerProfiles, eq(walkerProfiles.id, walks.walkerProfileId))
    .where(and(eq(walks.dogId, dogId), isNull(walks.deletedAt)))
    .orderBy(desc(walks.startTime))
    .limit(limit);

  if (rows.length === 0) return [];

  const walkIds = rows.map((r) => r.id);
  const photos = await db
    .select({
      id: walkMedia.id,
      walkId: walkMedia.walkId,
      storageKey: walkMedia.storageKey,
      capturedAt: walkMedia.capturedAt,
    })
    .from(walkMedia)
    .where(and(inArray(walkMedia.walkId, walkIds), eq(walkMedia.uploadStatus, "UPLOADED")))
    .orderBy(asc(walkMedia.capturedAt));

  const photosByWalkId = new Map<string, { id: string; storageKey: string; capturedAt: Date }[]>();
  for (const p of photos) {
    if (!p.storageKey) continue;
    const arr = photosByWalkId.get(p.walkId) ?? [];
    arr.push({ id: p.id, storageKey: p.storageKey, capturedAt: p.capturedAt });
    photosByWalkId.set(p.walkId, arr);
  }

  return rows.map((r) => ({ ...r, mediaPhotos: photosByWalkId.get(r.id) ?? [] }));
}

export type DogStats = {
  totalWalks: number;
  totalMinutes: number;
  favoriteWalkerName: string | null;
};

export async function getDogStats(dogId: string): Promise<DogStats> {
  const db = getDb();
  const [totals] = await db
    .select({
      totalWalks: count(),
      totalMinutes: sql<number>`coalesce(sum(${walks.durationMinutes}), 0)`,
    })
    .from(walks)
    .where(and(eq(walks.dogId, dogId), isNull(walks.deletedAt)));

  const [favoriteRow] = await db
    .select({ name: walkerProfiles.displayName })
    .from(walks)
    .innerJoin(walkerProfiles, eq(walkerProfiles.id, walks.walkerProfileId))
    .where(and(eq(walks.dogId, dogId), isNull(walks.deletedAt)))
    .groupBy(walks.walkerProfileId, walkerProfiles.displayName)
    .orderBy(desc(count()))
    .limit(1);

  return {
    totalWalks: totals?.totalWalks ?? 0,
    totalMinutes: Number(totals?.totalMinutes ?? 0),
    favoriteWalkerName: favoriteRow?.name ?? null,
  };
}

export type ActiveLiveWalk = {
  walkId: string;
  dogId: string;
  dogName: string;
  walkerName: string;
  startTime: Date;
};

export async function getActiveLiveWalks(ownerUserId: string): Promise<ActiveLiveWalk[]> {
  const db = getDb();
  const rows = await db
    .select({
      walkId: walks.id,
      dogId: dogs.id,
      dogName: dogs.name,
      walkerName: walkerProfiles.displayName,
      startTime: walks.startTime,
    })
    .from(dogOwners)
    .innerJoin(dogs, eq(dogs.id, dogOwners.dogId))
    .innerJoin(walks, and(eq(walks.dogId, dogs.id), eq(walks.status, "LIVE")))
    .innerJoin(walkerProfiles, eq(walkerProfiles.id, walks.walkerProfileId))
    .where(and(eq(dogOwners.ownerUserId, ownerUserId), eq(dogs.isActive, true)));
  return rows;
}

export async function updateDogImageUrl(dogId: string, imageUrl: string): Promise<void> {
  const db = getDb();
  await db.update(dogs).set({ imageUrl, updatedAt: new Date() }).where(eq(dogs.id, dogId));
}
