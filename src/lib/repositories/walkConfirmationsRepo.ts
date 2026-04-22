import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/drizzle";
import {
  dogOwners,
  dogWalkers,
  walkConfirmations,
  walkerProfiles,
} from "@/db/schema";
import type {
  ConfirmationCardView,
  ConfirmationState,
  OwnerAnswer,
} from "@/lib/services/confirmations/types";

const TZ = "Asia/Jerusalem";

function localDayKey(ts: Date, now: Date): { tsKey: string; nowKey: string } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return { tsKey: fmt.format(ts), nowKey: fmt.format(now) };
}

export function isSameLocalDay(ts: Date, now: Date): boolean {
  const { tsKey, nowKey } = localDayKey(ts, now);
  return tsKey === nowKey;
}

type Row = typeof walkConfirmations.$inferSelect;

function rowToView(row: Row, now: Date): ConfirmationCardView | null {
  if (!isSameLocalDay(row.updatedAt, now)) return null;
  return {
    dogId: row.dogId,
    state: row.state as ConfirmationState,
    updatedAt: row.updatedAt,
    lastUnsureAt: row.lastUnsureAt,
  };
}

export async function getConfirmationForDog(
  dogId: string,
  now: Date = new Date(),
): Promise<ConfirmationCardView | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(walkConfirmations)
    .where(eq(walkConfirmations.dogId, dogId))
    .limit(1);
  if (!row) return null;
  return rowToView(row, now);
}

export async function getConfirmationsByOwner(
  ownerUserId: string,
  now: Date = new Date(),
): Promise<Map<string, ConfirmationCardView>> {
  const db = getDb();
  const ownedDogs = await db
    .select({ dogId: dogOwners.dogId })
    .from(dogOwners)
    .where(and(eq(dogOwners.ownerUserId, ownerUserId), eq(dogOwners.isPrimary, true)));
  const dogIds = ownedDogs.map((d) => d.dogId);
  const result = new Map<string, ConfirmationCardView>();
  if (dogIds.length === 0) return result;
  const rows = await db
    .select()
    .from(walkConfirmations)
    .where(inArray(walkConfirmations.dogId, dogIds));
  for (const row of rows) {
    const view = rowToView(row, now);
    if (view) result.set(view.dogId, view);
  }
  return result;
}

export async function getConfirmationsByWalker(
  walkerUserId: string,
  now: Date = new Date(),
): Promise<Map<string, ConfirmationCardView>> {
  const db = getDb();
  const [profile] = await db
    .select({ id: walkerProfiles.id })
    .from(walkerProfiles)
    .where(eq(walkerProfiles.userId, walkerUserId))
    .limit(1);
  const result = new Map<string, ConfirmationCardView>();
  if (!profile) return result;
  const assigned = await db
    .select({ dogId: dogWalkers.dogId })
    .from(dogWalkers)
    .where(
      and(
        eq(dogWalkers.walkerProfileId, profile.id),
        eq(dogWalkers.isActive, true),
      ),
    );
  const dogIds = assigned.map((a) => a.dogId);
  if (dogIds.length === 0) return result;
  const rows = await db
    .select()
    .from(walkConfirmations)
    .where(inArray(walkConfirmations.dogId, dogIds));
  for (const row of rows) {
    const view = rowToView(row, now);
    if (view) result.set(view.dogId, view);
  }
  return result;
}

export async function requestConfirmation(
  walkerUserId: string,
  dogId: string,
): Promise<void> {
  const db = getDb();
  const [profile] = await db
    .select({ id: walkerProfiles.id })
    .from(walkerProfiles)
    .where(eq(walkerProfiles.userId, walkerUserId))
    .limit(1);
  if (!profile) throw new Error("Forbidden");

  const [link] = await db
    .select({ id: dogWalkers.id })
    .from(dogWalkers)
    .where(
      and(
        eq(dogWalkers.dogId, dogId),
        eq(dogWalkers.walkerProfileId, profile.id),
        eq(dogWalkers.isActive, true),
      ),
    )
    .limit(1);
  if (!link) throw new Error("Forbidden");

  const now = new Date();
  await db
    .insert(walkConfirmations)
    .values({
      dogId,
      walkerProfileId: profile.id,
      state: "WAITING",
      lastUpdatedByUserId: walkerUserId,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: walkConfirmations.dogId,
      set: {
        walkerProfileId: profile.id,
        state: "WAITING",
        lastUnsureAt: null,
        lastUpdatedByUserId: walkerUserId,
        updatedAt: now,
      },
    });
}

export async function answerConfirmation(
  ownerUserId: string,
  dogId: string,
  answer: OwnerAnswer,
): Promise<void> {
  const db = getDb();
  const [ownership] = await db
    .select({ id: dogOwners.id, isPrimary: dogOwners.isPrimary })
    .from(dogOwners)
    .where(
      and(eq(dogOwners.dogId, dogId), eq(dogOwners.ownerUserId, ownerUserId)),
    )
    .limit(1);
  if (!ownership || !ownership.isPrimary) throw new Error("Forbidden");

  const [existing] = await db
    .select({
      walkerProfileId: walkConfirmations.walkerProfileId,
    })
    .from(walkConfirmations)
    .where(eq(walkConfirmations.dogId, dogId))
    .limit(1);
  if (!existing) throw new Error("NotFound");

  const now = new Date();
  if (answer === "UNSURE") {
    await db
      .update(walkConfirmations)
      .set({
        state: "WAITING",
        lastUnsureAt: now,
        lastUpdatedByUserId: ownerUserId,
        updatedAt: now,
      })
      .where(eq(walkConfirmations.dogId, dogId));
    return;
  }

  await db
    .update(walkConfirmations)
    .set({
      state: answer,
      lastUpdatedByUserId: ownerUserId,
      updatedAt: now,
    })
    .where(eq(walkConfirmations.dogId, dogId));
}
