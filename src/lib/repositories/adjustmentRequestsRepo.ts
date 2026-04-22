import { eq, and, desc } from "drizzle-orm";
import { getDb } from "@/db/drizzle";
import {
  adjustmentRequests,
  paymentEntries,
  paymentPeriods,
  walks,
  walkerProfiles,
} from "@/db/schema";
import { logAudit } from "@/lib/repositories/auditRepo";
import type {
  RequestAdjustmentInput,
  ApproveAdjustmentInput,
  RejectAdjustmentInput,
} from "@/lib/validation/billing";

export async function requestAdjustment(
  input: RequestAdjustmentInput,
  actorUserId: string,
): Promise<string> {
  const db = getDb();
  const now = new Date();

  return db.transaction(async (tx) => {
    // All critical reads inside the transaction — prevents stale-state race where
    // a concurrent approveAdjustment could change oldPrice between pre-tx read and insert.
    const [period] = await tx
      .select({
        id: paymentPeriods.id,
        status: paymentPeriods.status,
        ownerUserId: paymentPeriods.ownerUserId,
        walkerProfileId: paymentPeriods.walkerProfileId,
      })
      .from(paymentPeriods)
      .where(eq(paymentPeriods.id, input.paymentPeriodId))
      .limit(1);
    if (!period) throw new Error("Period not found");
    if (period.status !== "REOPENED") throw new Error("Period not reopened");

    const [walk] = await tx
      .select({ id: walks.id, status: walks.status, finalPrice: walks.finalPrice, paymentPeriodId: walks.paymentPeriodId })
      .from(walks)
      .where(eq(walks.id, input.walkId))
      .limit(1);
    if (!walk) throw new Error("Walk not found");
    if (walk.status !== "COMPLETED") throw new Error("Walk not completed");
    if (walk.paymentPeriodId !== input.paymentPeriodId) throw new Error("Walk not in this period");
    if (walk.finalPrice === null) throw new Error("Walk has no final price");

    const [walkerProfile] = await tx
      .select({ id: walkerProfiles.id, userId: walkerProfiles.userId })
      .from(walkerProfiles)
      .where(eq(walkerProfiles.id, period.walkerProfileId))
      .limit(1);
    if (!walkerProfile) throw new Error("Walker profile not found");

    let requestedBy: "owner" | "walker";
    if (actorUserId === period.ownerUserId) {
      requestedBy = "owner";
    } else if (actorUserId === walkerProfile.userId) {
      requestedBy = "walker";
    } else {
      throw new Error("Forbidden");
    }

    // Derive oldPrice from last approved adjustment, or fall back to finalPrice
    const [lastApproved] = await tx
      .select({ newPrice: adjustmentRequests.newPrice })
      .from(adjustmentRequests)
      .where(
        and(
          eq(adjustmentRequests.walkId, input.walkId),
          eq(adjustmentRequests.paymentPeriodId, input.paymentPeriodId),
          eq(adjustmentRequests.status, "approved"),
        ),
      )
      .orderBy(desc(adjustmentRequests.createdAt))
      .limit(1);
    const oldPrice = lastApproved ? lastApproved.newPrice : walk.finalPrice;

    // Supersede any existing pending adjustment for same (walkId, paymentPeriodId)
    await tx
      .update(adjustmentRequests)
      .set({ status: "rejected" })
      .where(
        and(
          eq(adjustmentRequests.walkId, input.walkId),
          eq(adjustmentRequests.paymentPeriodId, input.paymentPeriodId),
          eq(adjustmentRequests.status, "pending"),
        ),
      );

    const ownerApprovedAt  = requestedBy === "owner"  ? now : null;
    const walkerApprovedAt = requestedBy === "walker" ? now : null;

    const [inserted] = await tx
      .insert(adjustmentRequests)
      .values({
        paymentPeriodId: input.paymentPeriodId,
        walkId: input.walkId,
        ownerUserId: period.ownerUserId,
        walkerProfileId: period.walkerProfileId,
        requestedBy,
        oldPrice,
        newPrice: input.newPrice,
        reason: input.reason,
        ownerApprovedAt,
        walkerApprovedAt,
      })
      .returning({ id: adjustmentRequests.id });
    if (!inserted) throw new Error("Insert failed");

    await logAudit({
      tx,
      actorUserId,
      entityType: "ADJUSTMENT_REQUEST",
      entityId: inserted.id,
      action: "REQUEST_ADJUSTMENT",
      afterJson: { requestedBy, oldPrice, newPrice: input.newPrice, reason: input.reason },
    });

    return inserted.id;
  });
}

export async function approveAdjustment(
  input: ApproveAdjustmentInput,
  actorUserId: string,
): Promise<void> {
  const db = getDb();

  await db.transaction(async (tx) => {
    const [adjustment] = await tx
      .select()
      .from(adjustmentRequests)
      .where(eq(adjustmentRequests.id, input.adjustmentId))
      .limit(1);
    if (!adjustment) throw new Error("Adjustment not found");
    if (adjustment.status !== "pending") throw new Error("Adjustment not pending");

    const [period] = await tx
      .select({
        id: paymentPeriods.id,
        status: paymentPeriods.status,
        totalAmount: paymentPeriods.totalAmount,
        lockVersion: paymentPeriods.lockVersion,
      })
      .from(paymentPeriods)
      .where(eq(paymentPeriods.id, adjustment.paymentPeriodId))
      .limit(1);
    if (!period) throw new Error("Period not found");
    if (period.status !== "REOPENED") throw new Error("Period not reopened");

    const [walkerProfile] = await tx
      .select({ userId: walkerProfiles.userId })
      .from(walkerProfiles)
      .where(eq(walkerProfiles.id, adjustment.walkerProfileId))
      .limit(1);
    if (!walkerProfile) throw new Error("Walker profile not found");

    // Actor must be the non-requesting party
    const isOwner  = actorUserId === adjustment.ownerUserId;
    const isWalker = actorUserId === walkerProfile.userId;
    if (!isOwner && !isWalker) throw new Error("Forbidden");
    if (adjustment.requestedBy === "owner" && isOwner) throw new Error("Requester cannot self-approve");
    if (adjustment.requestedBy === "walker" && isWalker) throw new Error("Requester cannot self-approve");

    const now = new Date();
    const ownerApprovedAt  = adjustment.requestedBy === "walker" ? now : adjustment.ownerApprovedAt;
    const walkerApprovedAt = adjustment.requestedBy === "owner"  ? now : adjustment.walkerApprovedAt;

    const delta = parseFloat(adjustment.newPrice) - parseFloat(adjustment.oldPrice);
    const currentTotal = parseFloat(period.totalAmount);
    if (currentTotal + delta < 0) throw new Error("Adjustment would produce negative period total");

    const newTotal = (currentTotal + delta).toFixed(2);

    await tx
      .update(adjustmentRequests)
      .set({ status: "approved", ownerApprovedAt, walkerApprovedAt })
      .where(eq(adjustmentRequests.id, input.adjustmentId));

    await tx.insert(paymentEntries).values({
      paymentPeriodId: adjustment.paymentPeriodId,
      walkId: null,
      ownerUserId: adjustment.ownerUserId,
      amount: delta.toFixed(2),
      entryType: "ADJUSTMENT",
    });

    const updated = await tx
      .update(paymentPeriods)
      .set({ totalAmount: newTotal, lockVersion: period.lockVersion + 1, updatedAt: now })
      .where(
        and(
          eq(paymentPeriods.id, adjustment.paymentPeriodId),
          eq(paymentPeriods.lockVersion, period.lockVersion),
        ),
      )
      .returning({ id: paymentPeriods.id });
    if (updated.length === 0) throw new Error("Conflict");

    await logAudit({
      tx,
      actorUserId,
      entityType: "ADJUSTMENT_REQUEST",
      entityId: input.adjustmentId,
      action: "APPROVE_ADJUSTMENT",
      afterJson: { delta: delta.toFixed(2), newTotal, status: "approved" },
    });
  });
}

export async function rejectAdjustment(
  input: RejectAdjustmentInput,
  actorUserId: string,
): Promise<void> {
  const db = getDb();

  await db.transaction(async (tx) => {
    const [adjustment] = await tx
      .select()
      .from(adjustmentRequests)
      .where(eq(adjustmentRequests.id, input.adjustmentId))
      .limit(1);
    if (!adjustment) throw new Error("Adjustment not found");
    if (adjustment.status !== "pending") throw new Error("Adjustment not pending");

    const [walkerProfile] = await tx
      .select({ userId: walkerProfiles.userId })
      .from(walkerProfiles)
      .where(eq(walkerProfiles.id, adjustment.walkerProfileId))
      .limit(1);
    if (!walkerProfile) throw new Error("Walker profile not found");

    const isOwner  = actorUserId === adjustment.ownerUserId;
    const isWalker = actorUserId === walkerProfile.userId;
    if (!isOwner && !isWalker) throw new Error("Forbidden");

    await tx
      .update(adjustmentRequests)
      .set({ status: "rejected" })
      .where(eq(adjustmentRequests.id, input.adjustmentId));

    await logAudit({
      tx,
      actorUserId,
      entityType: "ADJUSTMENT_REQUEST",
      entityId: input.adjustmentId,
      action: "REJECT_ADJUSTMENT",
      afterJson: { status: "rejected" },
    });
  });
}
