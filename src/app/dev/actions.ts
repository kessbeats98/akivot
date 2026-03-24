"use server";

import { assertAuthenticated } from "@/lib/auth/session";
import { getDb } from "@/db/drizzle";
import {
  dogs,
  dogOwners,
  dogWalkers,
  walkerProfiles,
  walks,
  walkMedia,
  walkBatches,
  paymentEntries,
  paymentPeriods,
  auditLogs,
  notificationDeliveries,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import crypto from "node:crypto";

function assertDev() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Dev actions are disabled in production");
  }
}

// --- Legacy seed (kept for backward compat with window.__akivotSeed) ---

export async function seedTestScenarioAction(): Promise<{
  dogId: string;
  walkerProfileId: string;
  dogWalkerId: string;
}> {
  assertDev();
  const user = await assertAuthenticated();
  const db = getDb();
  const now = new Date();

  return await db.transaction(async (tx) => {
    const walkerProfileId = await ensureWalkerProfile(tx, user.id, user.name, now);

    const [dog] = await tx
      .insert(dogs)
      .values({ name: "רקס (טסט)", breed: "לברדור", isActive: true, updatedAt: now })
      .returning({ id: dogs.id });
    const dogId = dog!.id;

    await tx.insert(dogOwners).values({ dogId, ownerUserId: user.id, isPrimary: true });

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

    console.log("[dev/seed] seeded test scenario", { dogId, walkerProfileId, dogWalkerId: dw!.id });
    return { dogId, walkerProfileId, dogWalkerId: dw!.id };
  });
}

// --- Granular test actions ---

export async function createTestDogAction(name: string): Promise<{ dogId: string }> {
  assertDev();
  const user = await assertAuthenticated();
  const db = getDb();
  const now = new Date();

  return await db.transaction(async (tx) => {
    const [dog] = await tx
      .insert(dogs)
      .values({ name: name || "כלב טסט", isActive: true, updatedAt: now })
      .returning({ id: dogs.id });
    const dogId = dog!.id;

    await tx.insert(dogOwners).values({ dogId, ownerUserId: user.id, isPrimary: true });

    console.log("[dev] createTestDog", { dogId, name });
    return { dogId };
  });
}

export async function assignWalkerToSelfAction(dogId: string): Promise<{ dogWalkerId: string }> {
  assertDev();
  const user = await assertAuthenticated();
  const db = getDb();
  const now = new Date();

  return await db.transaction(async (tx) => {
    const walkerProfileId = await ensureWalkerProfile(tx, user.id, user.name, now);

    // Check if assignment already exists
    const [existing] = await tx
      .select({ id: dogWalkers.id, isActive: dogWalkers.isActive })
      .from(dogWalkers)
      .where(and(eq(dogWalkers.dogId, dogId), eq(dogWalkers.walkerProfileId, walkerProfileId)))
      .limit(1);

    if (existing) {
      if (!existing.isActive) {
        await tx
          .update(dogWalkers)
          .set({ isActive: true, startedAt: now, endedAt: null, updatedAt: now })
          .where(eq(dogWalkers.id, existing.id));
      }
      console.log("[dev] assignWalkerToSelf reactivated", { dogId, dogWalkerId: existing.id });
      return { dogWalkerId: existing.id };
    }

    const [dw] = await tx
      .insert(dogWalkers)
      .values({
        dogId,
        walkerProfileId,
        currentPrice: "0.00",
        currency: "ILS",
        isActive: true,
        startedAt: now,
        updatedAt: now,
      })
      .returning({ id: dogWalkers.id });

    console.log("[dev] assignWalkerToSelf", { dogId, dogWalkerId: dw!.id });
    return { dogWalkerId: dw!.id };
  });
}

export async function setTestPriceAction(dogWalkerId: string, price: string): Promise<void> {
  assertDev();
  await assertAuthenticated();
  const db = getDb();

  await db
    .update(dogWalkers)
    .set({ currentPrice: price, updatedAt: new Date() })
    .where(eq(dogWalkers.id, dogWalkerId));

  console.log("[dev] setTestPrice", { dogWalkerId, price });
}

export async function resetTestDataAction(): Promise<{ deleted: Record<string, number> }> {
  assertDev();
  const user = await assertAuthenticated();
  const db = getDb();

  // Delete in FK-safe order: leaves → roots
  // Only delete data owned by current user to avoid nuking other testers
  const result: Record<string, number> = {};

  await db.transaction(async (tx) => {
    // Get user's walker profile id (if any)
    const [wp] = await tx
      .select({ id: walkerProfiles.id })
      .from(walkerProfiles)
      .where(eq(walkerProfiles.userId, user.id))
      .limit(1);

    // Get user's dog ids
    const ownedDogRows = await tx
      .select({ dogId: dogOwners.dogId })
      .from(dogOwners)
      .where(eq(dogOwners.ownerUserId, user.id));
    const dogIds = ownedDogRows.map((r) => r.dogId);

    // Walk media (via walks by walker or walks for owned dogs)
    if (wp || dogIds.length > 0) {
      const walkRows = await tx
        .select({ id: walks.id })
        .from(walks)
        .where(
          dogIds.length > 0
            ? sql`${walks.dogId} IN ${dogIds}`
            : sql`${walks.walkerProfileId} = ${wp!.id}`,
        );
      const walkIds = walkRows.map((r) => r.id);
      if (walkIds.length > 0) {
        const wm = await tx.delete(walkMedia).where(sql`${walkMedia.walkId} IN ${walkIds}`);
        result.walkMedia = wm.rowCount ?? 0;
      }
    }

    // Notification deliveries (user's devices)
    // Skip — low value, FK chain is deep

    // Audit logs for user
    const al = await tx.delete(auditLogs).where(eq(auditLogs.actorUserId, user.id));
    result.auditLogs = al.rowCount ?? 0;

    // Payment entries (via payment periods owned by user)
    const periodRows = await tx
      .select({ id: paymentPeriods.id })
      .from(paymentPeriods)
      .where(eq(paymentPeriods.ownerUserId, user.id));
    const periodIds = periodRows.map((r) => r.id);
    if (periodIds.length > 0) {
      const pe = await tx
        .delete(paymentEntries)
        .where(sql`${paymentEntries.paymentPeriodId} IN ${periodIds}`);
      result.paymentEntries = pe.rowCount ?? 0;
    }

    // Payment periods
    const pp = await tx.delete(paymentPeriods).where(eq(paymentPeriods.ownerUserId, user.id));
    result.paymentPeriods = pp.rowCount ?? 0;

    // Walks (for owned dogs or by walker profile)
    if (dogIds.length > 0) {
      const w = await tx.delete(walks).where(sql`${walks.dogId} IN ${dogIds}`);
      result.walks = w.rowCount ?? 0;
    } else if (wp) {
      const w = await tx.delete(walks).where(eq(walks.walkerProfileId, wp.id));
      result.walks = w.rowCount ?? 0;
    }

    // Walk batches (walker profile)
    if (wp) {
      const wb = await tx.delete(walkBatches).where(eq(walkBatches.walkerProfileId, wp.id));
      result.walkBatches = wb.rowCount ?? 0;
    }

    // Dog walkers (for owned dogs)
    if (dogIds.length > 0) {
      const dwDel = await tx.delete(dogWalkers).where(sql`${dogWalkers.dogId} IN ${dogIds}`);
      result.dogWalkers = dwDel.rowCount ?? 0;
    }

    // Dog owners
    const doDel = await tx.delete(dogOwners).where(eq(dogOwners.ownerUserId, user.id));
    result.dogOwners = doDel.rowCount ?? 0;

    // Dogs (owned by user — now safe since dogOwners/dogWalkers/walks removed)
    if (dogIds.length > 0) {
      const dDel = await tx.delete(dogs).where(sql`${dogs.id} IN ${dogIds}`);
      result.dogs = dDel.rowCount ?? 0;
    }

    // Walker profile (last — everything referencing it is gone)
    if (wp) {
      await tx.delete(walkerProfiles).where(eq(walkerProfiles.id, wp.id));
      result.walkerProfiles = 1;
    }
  });

  console.log("[dev] resetTestData", { userId: user.id, deleted: result });
  return { deleted: result };
}

// List unassigned dogs owned by current user (for the assign dropdown)
export async function listOwnedDogsAction(): Promise<
  { dogId: string; dogName: string; walkerId: string | null }[]
> {
  assertDev();
  const user = await assertAuthenticated();
  const db = getDb();

  const rows = await db
    .select({
      dogId: dogs.id,
      dogName: dogs.name,
      walkerId: dogWalkers.id,
    })
    .from(dogs)
    .innerJoin(dogOwners, and(eq(dogOwners.dogId, dogs.id), eq(dogOwners.ownerUserId, user.id)))
    .leftJoin(dogWalkers, and(eq(dogWalkers.dogId, dogs.id), eq(dogWalkers.isActive, true)))
    .where(eq(dogs.isActive, true));

  return rows.map((r) => ({ dogId: r.dogId, dogName: r.dogName, walkerId: r.walkerId }));
}

// --- Helpers ---

async function ensureWalkerProfile(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any,
  userId: string,
  userName: string,
  now: Date,
): Promise<string> {
  const [existing] = await tx
    .select({ id: walkerProfiles.id })
    .from(walkerProfiles)
    .where(eq(walkerProfiles.userId, userId))
    .limit(1);

  if (existing) return existing.id;

  const [wp] = await tx
    .insert(walkerProfiles)
    .values({
      userId,
      displayName: userName,
      inviteCode: `dev-${crypto.randomUUID()}`,
      updatedAt: now,
    })
    .returning({ id: walkerProfiles.id });

  return wp!.id;
}
