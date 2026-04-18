import { eq, and, isNull, lte, gte, asc } from "drizzle-orm";
import { getDb } from "@/db/drizzle";
import { walks, dogWalkers, walkerProfiles, dogs, dogOwners, users, priceAgreements } from "@/db/schema";
import { config } from "@/lib/config";
import { logAudit } from "@/lib/repositories/auditRepo";
import type { AssignWalkerInput, StartWalkInput, EndWalkInput } from "@/lib/validation/walks";
import type { WalkWithDog, AssignedDog, CalendarWalk, OwnerCalendarWalk } from "@/lib/services/walks/types";

// Private helper — walker-side functions only
async function getWalkerProfileIdByUserId(userId: string): Promise<string> {
  const db = getDb();
  const [row] = await db
    .select({ id: walkerProfiles.id })
    .from(walkerProfiles)
    .where(eq(walkerProfiles.userId, userId))
    .limit(1);
  if (!row) throw new Error("Walker profile not found");
  return row.id;
}

// Called by owner action. Ownership verified by caller (assertDogOwnership).
// input.walkerProfileId is the target walker's walkerProfiles.id.
export async function assignWalker(input: AssignWalkerInput): Promise<void> {
  const db = getDb();
  const now = new Date();

  const [existing] = await db
    .select({ id: dogWalkers.id, isActive: dogWalkers.isActive })
    .from(dogWalkers)
    .where(and(eq(dogWalkers.dogId, input.dogId), eq(dogWalkers.walkerProfileId, input.walkerProfileId)))
    .limit(1);

  if (existing) {
    if (existing.isActive) throw new Error("Already assigned");
    await db
      .update(dogWalkers)
      .set({ isActive: true, startedAt: now, endedAt: null, updatedAt: now })
      .where(eq(dogWalkers.id, existing.id));
    return;
  }

  await db.insert(dogWalkers).values({
    dogId: input.dogId,
    walkerProfileId: input.walkerProfileId,
    currentPrice: "0.00", // V1 placeholder — price set in TASK-06
    currency: "ILS",
    isActive: true,
    startedAt: now,
    updatedAt: now,
  });
}

export async function startWalk(walkerUserId: string, input: StartWalkInput): Promise<string> {
  const db = getDb();
  const walkerProfileId = await getWalkerProfileIdByUserId(walkerUserId);
  const now = new Date();

  // Verify assignment and fetch price in one query (TOCTOU accepted — no concurrent deactivation UI in V1)
  const [dw] = await db
    .select({ id: dogWalkers.id, currentPrice: dogWalkers.currentPrice })
    .from(dogWalkers)
    .where(and(
      eq(dogWalkers.dogId, input.dogId),
      eq(dogWalkers.walkerProfileId, walkerProfileId),
      eq(dogWalkers.isActive, true),
    ))
    .limit(1);
  if (!dw) throw new Error("Dog not assigned");

  // App-level LIVE uniqueness guard (no DB partial index in V1)
  const [liveWalk] = await db
    .select({ id: walks.id })
    .from(walks)
    .where(and(
      eq(walks.dogId, input.dogId),
      eq(walks.walkerProfileId, walkerProfileId),
      eq(walks.status, "LIVE"),
      isNull(walks.deletedAt),
    ))
    .limit(1);
  if (liveWalk) throw new Error("Walk already active");

  return db.transaction(async (tx) => {
    const [ownerRow] = await tx
      .select({ ownerUserId: dogOwners.ownerUserId })
      .from(dogOwners)
      .where(and(eq(dogOwners.dogId, input.dogId), eq(dogOwners.isPrimary, true)))
      .limit(1);

    const activeAgreement = ownerRow
      ? await tx
          .select({ proposedPrice: priceAgreements.proposedPrice })
          .from(priceAgreements)
          .where(and(
            eq(priceAgreements.ownerUserId, ownerRow.ownerUserId),
            eq(priceAgreements.walkerProfileId, walkerProfileId),
            eq(priceAgreements.dogId, input.dogId),
            eq(priceAgreements.status, "active"),
          ))
          .limit(1)
          .then(r => r[0] ?? null)
      : null;

    const resolvedPrice = activeAgreement?.proposedPrice ?? dw.currentPrice;
    if (!resolvedPrice || resolvedPrice === "0.00") throw new Error("Price not set");

    let insertedId: string;
    try {
      const result = await tx
        .insert(walks)
        .values({
          dogId: input.dogId,
          walkerProfileId,
          dogWalkerId: dw.id,
          status: "LIVE",
          startTime: now,
          statusUpdatedAt: now,
          createdByUserId: walkerUserId,
          updatedByUserId: walkerUserId,
          updatedAt: now,
          finalPrice: resolvedPrice,
        })
        .returning({ id: walks.id });
      const inserted = result[0];
      if (!inserted) throw new Error("Insert failed");
      insertedId = inserted.id;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("walks_live_unique_idx")) {
        throw new Error("Walk already active");
      }
      throw err;
    }

    await logAudit({
      tx,
      actorUserId: walkerUserId,
      entityType: "WALK",
      entityId: insertedId,
      action: "START_WALK",
      afterJson: { dogId: input.dogId, walkerProfileId, status: "LIVE" },
    });

    return insertedId;
  });
}

export async function endWalk(walkerUserId: string, input: EndWalkInput): Promise<void> {
  const db = getDb();
  const walkerProfileId = await getWalkerProfileIdByUserId(walkerUserId);
  const now = new Date();

  const [walk] = await db
    .select({
      id: walks.id,
      status: walks.status,
      startTime: walks.startTime,
      walkerProfileId: walks.walkerProfileId,
    })
    .from(walks)
    .where(and(eq(walks.id, input.walkId), isNull(walks.deletedAt)))
    .limit(1);

  if (!walk) throw new Error("Walk not found");
  if (walk.walkerProfileId !== walkerProfileId) throw new Error("Forbidden");
  if (walk.status !== "LIVE") throw new Error("Walk not LIVE");

  const durationMinutes = Math.round((now.getTime() - walk.startTime.getTime()) / 60_000);

  await db.transaction(async (tx) => {
    await tx
      .update(walks)
      .set({
        status: "COMPLETED",
        endTime: now,
        durationMinutes,
        completedAt: now,
        statusUpdatedAt: now,
        updatedByUserId: walkerUserId,
        updatedAt: now,
        ...(input.finalPrice != null && { finalPrice: input.finalPrice }),
        note: input.note ?? null,
        closureReason: "MANUAL",
      })
      .where(eq(walks.id, input.walkId));

    await logAudit({
      tx,
      actorUserId: walkerUserId,
      entityType: "WALK",
      entityId: input.walkId,
      action: "END_WALK",
      beforeJson: { status: "LIVE" },
      afterJson: { status: "COMPLETED", durationMinutes },
    });
  });
}

export async function getActiveWalksByWalker(walkerUserId: string): Promise<WalkWithDog[]> {
  const db = getDb();
  const walkerProfileId = await getWalkerProfileIdByUserId(walkerUserId);

  const rows = await db
    .select({
      id: walks.id,
      status: walks.status,
      startTime: walks.startTime,
      endTime: walks.endTime,
      durationMinutes: walks.durationMinutes,
      finalPrice: walks.finalPrice,
      note: walks.note,
      dogId: walks.dogId,
      walkerProfileId: walks.walkerProfileId,
      dogWalkerId: walks.dogWalkerId,
      dogName: dogs.name,
      dogBreed: dogs.breed,
    })
    .from(walks)
    .innerJoin(dogs, eq(dogs.id, walks.dogId))
    .where(and(
      eq(walks.walkerProfileId, walkerProfileId),
      eq(walks.status, "LIVE"),
      isNull(walks.deletedAt),
    ));

  return rows.map((r) => ({ ...r }));
}

export async function getAssignedDogsByWalker(walkerUserId: string): Promise<AssignedDog[]> {
  const db = getDb();
  const walkerProfileId = await getWalkerProfileIdByUserId(walkerUserId);

  const rows = await db
    .select({
      dogWalkerId: dogWalkers.id,
      dogId: dogWalkers.dogId,
      currentPrice: dogWalkers.currentPrice,
      currency: dogWalkers.currency,
      dogName: dogs.name,
      dogBreed: dogs.breed,
      ownerName: users.name,
      ownerPhone: users.phone,
    })
    .from(dogWalkers)
    .innerJoin(dogs, eq(dogs.id, dogWalkers.dogId))
    .leftJoin(dogOwners, and(eq(dogOwners.dogId, dogs.id), eq(dogOwners.isPrimary, true)))
    .leftJoin(users, eq(users.id, dogOwners.ownerUserId))
    .where(and(
      eq(dogWalkers.walkerProfileId, walkerProfileId),
      eq(dogWalkers.isActive, true),
      eq(dogs.isActive, true),
    ))
    .orderBy(
      asc(dogWalkers.startedAt),
      asc(dogWalkers.createdAt),
      asc(dogs.name),
    );

  return rows.map((r) => ({ ...r }));
}

// Called by /api/jobs/auto-close. No user session — actorUserId is "system".
// Idempotent: autoClosedAt IS NULL guard prevents double-close.
export async function autoCloseWalks(): Promise<number> {
  const db = getDb();
  const cutoff = new Date(Date.now() - config.cron.autoCloseMinutes * 60_000);

  const stale = await db
    .select({ id: walks.id, startTime: walks.startTime })
    .from(walks)
    .where(and(
      eq(walks.status, "LIVE"),
      isNull(walks.deletedAt),
      isNull(walks.autoClosedAt),
      lte(walks.startTime, cutoff),
    ));

  for (const walk of stale) {
    const now = new Date();
    const durationMinutes = Math.round((now.getTime() - walk.startTime.getTime()) / 60_000);
    await db.transaction(async (tx) => {
      await tx
        .update(walks)
        .set({
          status: "AUTO_CLOSED",
          endTime: now,
          durationMinutes,
          autoClosedAt: now,
          closureReason: "AUTO_TIMEOUT",
          statusUpdatedAt: now,
          updatedAt: now,
          updatedByUserId: null,
        })
        .where(eq(walks.id, walk.id));

      await logAudit({
        tx,
        actorUserId: null,
        entityType: "WALK",
        entityId: walk.id,
        action: "AUTO_CLOSE_WALK",
        beforeJson: { status: "LIVE" },
        afterJson: { status: "AUTO_CLOSED", durationMinutes },
      });
    });
  }

  return stale.length;
}

/** Walks for a walker within a date range (calendar view). */
export async function getWalksByDateRange(
  walkerUserId: string,
  startDate: Date,
  endDate: Date,
): Promise<CalendarWalk[]> {
  const db = getDb();
  const walkerProfileId = await getWalkerProfileIdByUserId(walkerUserId);

  const rows = await db
    .select({
      id: walks.id,
      dogName: dogs.name,
      dogBreed: dogs.breed,
      status: walks.status,
      startTime: walks.startTime,
      endTime: walks.endTime,
      durationMinutes: walks.durationMinutes,
    })
    .from(walks)
    .innerJoin(dogs, eq(dogs.id, walks.dogId))
    .where(and(
      eq(walks.walkerProfileId, walkerProfileId),
      gte(walks.startTime, startDate),
      lte(walks.startTime, endDate),
      isNull(walks.deletedAt),
    ))
    .orderBy(asc(walks.startTime));

  return rows.map((r) => ({ ...r }));
}

/** Walks for an owner within a date range (owner calendar view). */
export async function getWalksByOwner(
  ownerUserId: string,
  startDate: Date,
  endDate: Date,
): Promise<OwnerCalendarWalk[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: walks.id,
      dogName: dogs.name,
      dogBreed: dogs.breed,
      status: walks.status,
      startTime: walks.startTime,
      endTime: walks.endTime,
      durationMinutes: walks.durationMinutes,
      walkerName: walkerProfiles.displayName,
    })
    .from(walks)
    .innerJoin(dogs, eq(dogs.id, walks.dogId))
    .innerJoin(dogOwners, and(eq(dogOwners.dogId, dogs.id), eq(dogOwners.ownerUserId, ownerUserId)))
    .innerJoin(walkerProfiles, eq(walkerProfiles.id, walks.walkerProfileId))
    .where(and(
      gte(walks.startTime, startDate),
      lte(walks.startTime, endDate),
      isNull(walks.deletedAt),
    ))
    .orderBy(asc(walks.startTime));

  return rows.map((r) => ({ ...r }));
}
