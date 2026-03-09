import { eq, and, isNull, inArray } from "drizzle-orm";
import { getDb } from "@/db/drizzle";
import { paymentPeriods, paymentEntries, walks, dogWalkers, walkerProfiles, dogs, dogOwners } from "@/db/schema";
import { logAudit } from "@/lib/repositories/auditRepo";
import type { ClosePeriodInput } from "@/lib/validation/billing";
import type { PaymentPeriodWithEntries } from "@/lib/services/billing/types";

export async function assertPeriodOwnership(periodId: string, ownerUserId: string): Promise<void> {
  const db = getDb();
  const [row] = await db
    .select({ id: paymentPeriods.id })
    .from(paymentPeriods)
    .where(and(eq(paymentPeriods.id, periodId), eq(paymentPeriods.ownerUserId, ownerUserId)))
    .limit(1);
  if (!row) throw new Error("Forbidden");
}

// Private helper — upsert pattern; DB partial unique index is the final invariant
async function getOrCreateOpenPeriod(walkerProfileId: string, ownerUserId: string): Promise<string> {
  const db = getDb();
  const [existing] = await db
    .select({ id: paymentPeriods.id })
    .from(paymentPeriods)
    .where(and(
      eq(paymentPeriods.walkerProfileId, walkerProfileId),
      eq(paymentPeriods.ownerUserId, ownerUserId),
      eq(paymentPeriods.status, "OPEN"),
    ))
    .limit(1);
  if (existing) return existing.id;

  const now = new Date();
  try {
    const [inserted] = await db
      .insert(paymentPeriods)
      .values({ walkerProfileId, ownerUserId, status: "OPEN", updatedAt: now })
      .returning({ id: paymentPeriods.id });
    if (!inserted) throw new Error("Insert failed");
    return inserted.id;
  } catch (err: unknown) {
    // Unique constraint violation — concurrent insert won the race; re-read
    if (err instanceof Error && err.message.includes("payment_periods_open_unique_idx")) {
      const [row] = await db
        .select({ id: paymentPeriods.id })
        .from(paymentPeriods)
        .where(and(
          eq(paymentPeriods.walkerProfileId, walkerProfileId),
          eq(paymentPeriods.ownerUserId, ownerUserId),
          eq(paymentPeriods.status, "OPEN"),
        ))
        .limit(1);
      if (!row) throw new Error("Insert race: period not found after conflict");
      return row.id;
    }
    throw err;
  }
}

// Exported — called by getOwnerBillingAction to auto-materialize OPEN periods
export async function ensureOpenPeriods(ownerUserId: string): Promise<void> {
  const db = getDb();
  const pairs = await db
    .selectDistinct({ walkerProfileId: dogWalkers.walkerProfileId })
    .from(dogWalkers)
    .innerJoin(dogs, eq(dogs.id, dogWalkers.dogId))
    .innerJoin(dogOwners, eq(dogOwners.dogId, dogs.id))
    .where(and(
      eq(dogOwners.ownerUserId, ownerUserId),
      eq(dogWalkers.isActive, true),
      eq(dogs.isActive, true),
    ));
  for (const pair of pairs) {
    await getOrCreateOpenPeriod(pair.walkerProfileId, ownerUserId);
  }
}

export async function closePaymentPeriod(input: ClosePeriodInput, actorUserId: string): Promise<void> {
  const db = getDb();
  const now = new Date();

  await db.transaction(async (tx) => {
    // 1. Re-fetch period inside tx; assert OPEN + lockVersion
    const [period] = await tx
      .select({
        id: paymentPeriods.id,
        walkerProfileId: paymentPeriods.walkerProfileId,
        ownerUserId: paymentPeriods.ownerUserId,
        status: paymentPeriods.status,
        lockVersion: paymentPeriods.lockVersion,
      })
      .from(paymentPeriods)
      .where(eq(paymentPeriods.id, input.periodId))
      .limit(1);
    if (!period) throw new Error("Period not found");
    if (period.status !== "OPEN") throw new Error("Period not open");
    if (period.lockVersion !== input.lockVersion) throw new Error("Conflict");

    // 2. Fetch COMPLETED walks for this owner-walker pair only
    const untagged = await tx
      .select({ id: walks.id, dogWalkerId: walks.dogWalkerId })
      .from(walks)
      .innerJoin(dogOwners, and(
        eq(dogOwners.dogId, walks.dogId),
        eq(dogOwners.ownerUserId, period.ownerUserId),
      ))
      .where(and(
        eq(walks.walkerProfileId, period.walkerProfileId),
        eq(walks.status, "COMPLETED"),
        isNull(walks.paymentPeriodId),
        isNull(walks.deletedAt),
      ));

    // 3. Insert paymentEntry per walk; accumulate in integer agorot (ILS)
    let totalAgorot = 0;
    for (const walk of untagged) {
      const [dw] = await tx
        .select({ currentPrice: dogWalkers.currentPrice })
        .from(dogWalkers)
        .where(eq(dogWalkers.id, walk.dogWalkerId))
        .limit(1);
      const amount = dw?.currentPrice ?? "0.00";
      totalAgorot += Math.round(parseFloat(amount) * 100);
      await tx.insert(paymentEntries).values({
        paymentPeriodId: input.periodId,
        walkId: walk.id,
        ownerUserId: period.ownerUserId,
        amount,
        entryType: "WALK",
      });
    }

    // 4. Tag walks
    if (untagged.length > 0) {
      await tx
        .update(walks)
        .set({ paymentPeriodId: input.periodId, updatedAt: now, updatedByUserId: actorUserId })
        .where(inArray(walks.id, untagged.map((w) => w.id)));
    }

    // 5. Atomic CAS update — WHERE id + status=OPEN + lockVersion; throws "Conflict" if 0 rows updated
    const totalAmount = (totalAgorot / 100).toFixed(2);
    const updated = await tx
      .update(paymentPeriods)
      .set({ status: "PAID", totalAmount, paidAt: now, paidByUserId: actorUserId, updatedAt: now, lockVersion: period.lockVersion + 1 })
      .where(and(
        eq(paymentPeriods.id, input.periodId),
        eq(paymentPeriods.status, "OPEN"),
        eq(paymentPeriods.lockVersion, input.lockVersion),
      ))
      .returning({ id: paymentPeriods.id });
    if (updated.length === 0) throw new Error("Conflict");

    // 6. Audit
    await logAudit({
      tx,
      actorUserId,
      entityType: "PAYMENT_PERIOD",
      entityId: input.periodId,
      action: "CLOSE_PAYMENT_PERIOD",
      afterJson: { status: "PAID", totalAmount, entriesCount: untagged.length },
    });
  });
}

// Two-query: fetch periods, then entries, merge in JS
export async function getPeriodsByOwner(ownerUserId: string): Promise<PaymentPeriodWithEntries[]> {
  const db = getDb();
  const periods = await db
    .select()
    .from(paymentPeriods)
    .where(eq(paymentPeriods.ownerUserId, ownerUserId))
    .orderBy(paymentPeriods.createdAt);
  if (periods.length === 0) return [];
  const periodIds = periods.map((p) => p.id);
  const entries = await db
    .select()
    .from(paymentEntries)
    .where(inArray(paymentEntries.paymentPeriodId, periodIds));
  return periods.map((p) => ({
    ...p,
    entries: entries
      .filter((e) => e.paymentPeriodId === p.id)
      .map((e) => ({
        id: e.id,
        walkId: e.walkId,
        amount: e.amount,
        entryType: e.entryType as "WALK" | "ADJUSTMENT",
        createdAt: e.createdAt,
      })),
  }));
}

export async function getPeriodsByWalker(walkerUserId: string): Promise<PaymentPeriodWithEntries[]> {
  const db = getDb();
  const [profile] = await db
    .select({ id: walkerProfiles.id })
    .from(walkerProfiles)
    .where(eq(walkerProfiles.userId, walkerUserId))
    .limit(1);
  if (!profile) throw new Error("Walker profile not found");
  const periods = await db
    .select()
    .from(paymentPeriods)
    .where(eq(paymentPeriods.walkerProfileId, profile.id))
    .orderBy(paymentPeriods.createdAt);
  if (periods.length === 0) return [];
  const periodIds = periods.map((p) => p.id);
  const entries = await db
    .select()
    .from(paymentEntries)
    .where(inArray(paymentEntries.paymentPeriodId, periodIds));
  return periods.map((p) => ({
    ...p,
    entries: entries
      .filter((e) => e.paymentPeriodId === p.id)
      .map((e) => ({
        id: e.id,
        walkId: e.walkId,
        amount: e.amount,
        entryType: e.entryType as "WALK" | "ADJUSTMENT",
        createdAt: e.createdAt,
      })),
  }));
}
