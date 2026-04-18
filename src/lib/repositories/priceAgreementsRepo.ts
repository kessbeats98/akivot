import { eq, and } from "drizzle-orm";
import { getDb } from "@/db/drizzle";
import { priceAgreements, dogOwners, walkerProfiles, dogWalkers } from "@/db/schema";
import { logAudit } from "@/lib/repositories/auditRepo";
import type { ProposePriceAgreementInput } from "@/lib/validation/billing";

async function resolveActorRole(
  actorUserId: string,
  dbOwnerUserId: string,
  walkerProfileId: string,
): Promise<"owner" | "walker"> {
  if (actorUserId === dbOwnerUserId) return "owner";
  const db = getDb();
  const [wp] = await db
    .select({ id: walkerProfiles.id })
    .from(walkerProfiles)
    .where(and(eq(walkerProfiles.userId, actorUserId), eq(walkerProfiles.id, walkerProfileId)))
    .limit(1);
  if (wp) return "walker";
  throw new Error("Forbidden");
}

async function getOwnerUserIdForDog(dogId: string): Promise<string> {
  const db = getDb();
  const [row] = await db
    .select({ ownerUserId: dogOwners.ownerUserId })
    .from(dogOwners)
    .where(and(eq(dogOwners.dogId, dogId), eq(dogOwners.isPrimary, true)))
    .limit(1);
  if (!row) throw new Error("Dog not found");
  return row.ownerUserId;
}

export async function proposePriceAgreement(
  input: ProposePriceAgreementInput,
  actorUserId: string,
): Promise<string> {
  const db = getDb();
  const dbOwnerUserId = await getOwnerUserIdForDog(input.dogId);
  const actorRole = await resolveActorRole(actorUserId, dbOwnerUserId, input.walkerProfileId);

  return db.transaction(async (tx) => {
    // Supersede any existing pending row for this trio
    await tx
      .update(priceAgreements)
      .set({ status: "superseded" })
      .where(and(
        eq(priceAgreements.ownerUserId, dbOwnerUserId),
        eq(priceAgreements.walkerProfileId, input.walkerProfileId),
        eq(priceAgreements.dogId, input.dogId),
        eq(priceAgreements.status, "pending"),
      ));

    const now = new Date();
    const [inserted] = await tx
      .insert(priceAgreements)
      .values({
        ownerUserId: dbOwnerUserId,
        walkerProfileId: input.walkerProfileId,
        dogId: input.dogId,
        proposedBy: actorRole,
        proposedPrice: input.proposedPrice,
        currency: input.currency ?? "ILS",
        ownerApprovedAt: actorRole === "owner" ? now : null,
        walkerApprovedAt: actorRole === "walker" ? now : null,
      })
      .returning({ id: priceAgreements.id });
    if (!inserted) throw new Error("Insert failed");

    await logAudit({
      tx,
      actorUserId,
      entityType: "PRICE_AGREEMENT",
      entityId: inserted.id,
      action: "PROPOSE_PRICE_AGREEMENT",
      afterJson: { proposedPrice: input.proposedPrice, proposedBy: actorRole },
    });

    return inserted.id;
  });
}

export async function approvePriceAgreement(
  agreementId: string,
  actorUserId: string,
): Promise<void> {
  const db = getDb();
  const [agreement] = await db
    .select()
    .from(priceAgreements)
    .where(eq(priceAgreements.id, agreementId))
    .limit(1);
  if (!agreement) throw new Error("Agreement not found");
  if (agreement.status !== "pending") throw new Error("Agreement not pending");

  const actorRole = await resolveActorRole(actorUserId, agreement.ownerUserId, agreement.walkerProfileId);
  if (actorRole === agreement.proposedBy) throw new Error("Proposing party cannot approve");

  await db.transaction(async (tx) => {
    const now = new Date();
    const ownerApprovedAt = actorRole === "owner" ? now : agreement.ownerApprovedAt;
    const walkerApprovedAt = actorRole === "walker" ? now : agreement.walkerApprovedAt;
    const bothApproved = ownerApprovedAt != null && walkerApprovedAt != null;

    if (bothApproved) {
      // Supersede prior active for same trio
      await tx
        .update(priceAgreements)
        .set({ status: "superseded" })
        .where(and(
          eq(priceAgreements.ownerUserId, agreement.ownerUserId),
          eq(priceAgreements.walkerProfileId, agreement.walkerProfileId),
          eq(priceAgreements.dogId, agreement.dogId),
          eq(priceAgreements.status, "active"),
        ));
    }

    await tx
      .update(priceAgreements)
      .set({
        ownerApprovedAt,
        walkerApprovedAt,
        status: bothApproved ? "active" : "pending",
      })
      .where(eq(priceAgreements.id, agreementId));

    await logAudit({
      tx,
      actorUserId,
      entityType: "PRICE_AGREEMENT",
      entityId: agreementId,
      action: "APPROVE_PRICE_AGREEMENT",
      afterJson: { status: bothApproved ? "active" : "pending", actorRole },
    });
  });
}

export async function rejectPriceAgreement(
  agreementId: string,
  actorUserId: string,
): Promise<void> {
  const db = getDb();
  const [agreement] = await db
    .select()
    .from(priceAgreements)
    .where(eq(priceAgreements.id, agreementId))
    .limit(1);
  if (!agreement) throw new Error("Agreement not found");
  if (agreement.status !== "pending") throw new Error("Agreement not pending");

  await resolveActorRole(actorUserId, agreement.ownerUserId, agreement.walkerProfileId);

  await db.transaction(async (tx) => {
    await tx
      .update(priceAgreements)
      .set({ status: "rejected" })
      .where(eq(priceAgreements.id, agreementId));

    await logAudit({
      tx,
      actorUserId,
      entityType: "PRICE_AGREEMENT",
      entityId: agreementId,
      action: "REJECT_PRICE_AGREEMENT",
      afterJson: { status: "rejected" },
    });
  });
}

export async function getActivePriceAgreement(
  ownerUserId: string,
  walkerProfileId: string,
  dogId: string,
) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(priceAgreements)
    .where(and(
      eq(priceAgreements.ownerUserId, ownerUserId),
      eq(priceAgreements.walkerProfileId, walkerProfileId),
      eq(priceAgreements.dogId, dogId),
      eq(priceAgreements.status, "active"),
    ))
    .limit(1);
  return row ?? null;
}

export async function hasActivePriceAgreementForDogWalker(dogWalkerId: string): Promise<boolean> {
  const db = getDb();
  const [dw] = await db
    .select({
      dogId: dogWalkers.dogId,
      walkerProfileId: dogWalkers.walkerProfileId,
    })
    .from(dogWalkers)
    .where(eq(dogWalkers.id, dogWalkerId))
    .limit(1);
  if (!dw) return false;

  const [ownerRow] = await db
    .select({ ownerUserId: dogOwners.ownerUserId })
    .from(dogOwners)
    .where(and(eq(dogOwners.dogId, dw.dogId), eq(dogOwners.isPrimary, true)))
    .limit(1);
  if (!ownerRow) return false;

  const agreement = await getActivePriceAgreement(ownerRow.ownerUserId, dw.walkerProfileId, dw.dogId);
  return agreement !== null;
}
