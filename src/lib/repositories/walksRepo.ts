import { eq, and, isNull } from "drizzle-orm";
import { getDb } from "@/db/drizzle";
import { walks, dogWalkers, walkerProfiles, dogs } from "@/db/schema";
import { logAudit } from "@/lib/repositories/auditRepo";
import type { AssignWalkerInput, StartWalkInput, EndWalkInput } from "@/lib/validation/walks";
import type { WalkWithDog, AssignedDog } from "@/lib/services/walks/types";

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

  // Verify assignment (TOCTOU accepted — no concurrent deactivation UI in V1)
  const [dw] = await db
    .select({ id: dogWalkers.id })
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
      })
      .returning({ id: walks.id });
    const inserted = result[0];
    if (!inserted) throw new Error("Insert failed");

    await logAudit({
      tx,
      actorUserId: walkerUserId,
      entityType: "WALK",
      entityId: inserted.id,
      action: "START_WALK",
      afterJson: { dogId: input.dogId, walkerProfileId, status: "LIVE" },
    });

    return inserted.id;
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
        finalPrice: input.finalPrice ?? null,
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
    })
    .from(dogWalkers)
    .innerJoin(dogs, eq(dogs.id, dogWalkers.dogId))
    .where(and(
      eq(dogWalkers.walkerProfileId, walkerProfileId),
      eq(dogWalkers.isActive, true),
      eq(dogs.isActive, true),
    ));

  return rows.map((r) => ({ ...r }));
}
