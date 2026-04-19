import { eq, and, isNull, ne } from "drizzle-orm";
import { getDb } from "@/db/drizzle";
import { walkPriceOffers, dogOwners, walkerProfiles, walks } from "@/db/schema";
import { logAudit } from "@/lib/repositories/auditRepo";
import type { ProposeWalkOfferInput, CounterWalkOfferInput } from "@/lib/validation/billing";

type Tx = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];

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

async function resolveActorRole(
  actorUserId: string,
  ownerUserId: string,
  walkerProfileId: string,
): Promise<"owner" | "walker"> {
  if (actorUserId === ownerUserId) return "owner";
  const db = getDb();
  const [wp] = await db
    .select({ id: walkerProfiles.id })
    .from(walkerProfiles)
    .where(and(eq(walkerProfiles.userId, actorUserId), eq(walkerProfiles.id, walkerProfileId)))
    .limit(1);
  if (wp) return "walker";
  throw new Error("Forbidden");
}

export async function proposeWalkOffer(
  input: ProposeWalkOfferInput,
  actorUserId: string,
): Promise<string> {
  const db = getDb();
  const ownerUserId = await getOwnerUserIdForDog(input.dogId);
  const actorRole = await resolveActorRole(actorUserId, ownerUserId, input.walkerProfileId);

  return db.transaction(async (tx) => {
    if (input.walkId != null) {
      const [walk] = await tx
        .select({
          id: walks.id,
          dogId: walks.dogId,
          walkerProfileId: walks.walkerProfileId,
          status: walks.status,
        })
        .from(walks)
        .where(eq(walks.id, input.walkId))
        .limit(1);
      if (!walk) throw new Error("Walk not found");
      if (walk.dogId !== input.dogId) throw new Error("Walk dog mismatch");
      if (walk.walkerProfileId !== input.walkerProfileId) throw new Error("Walk walker mismatch");
      const blocked: string[] = ["LIVE", "COMPLETED", "AUTO_CLOSED", "CANCELLED"];
      if (blocked.includes(walk.status)) throw new Error(`Walk status ${walk.status} does not allow price offers`);
    } else {
      // Guard: block new proposal if an accepted unlinked pre-start offer already exists
      const [existing] = await tx
        .select({ id: walkPriceOffers.id })
        .from(walkPriceOffers)
        .where(and(
          eq(walkPriceOffers.ownerUserId, ownerUserId),
          eq(walkPriceOffers.walkerProfileId, input.walkerProfileId),
          eq(walkPriceOffers.dogId, input.dogId),
          eq(walkPriceOffers.status, "accepted"),
          isNull(walkPriceOffers.walkId),
        ))
        .limit(1);
      if (existing) throw new Error("Accepted price already agreed for next walk");

      // Supersede any open pending offers for this trio
      await tx
        .update(walkPriceOffers)
        .set({ status: "superseded" })
        .where(and(
          eq(walkPriceOffers.ownerUserId, ownerUserId),
          eq(walkPriceOffers.walkerProfileId, input.walkerProfileId),
          eq(walkPriceOffers.dogId, input.dogId),
          isNull(walkPriceOffers.walkId),
          eq(walkPriceOffers.status, "pending"),
        ));
    }

    const [inserted] = await tx
      .insert(walkPriceOffers)
      .values({
        walkId: input.walkId ?? null,
        ownerUserId,
        walkerProfileId: input.walkerProfileId,
        dogId: input.dogId,
        proposedBy: actorRole,
        proposedPrice: input.proposedPrice,
        proposedDurationMin: input.proposedDurationMin ?? null,
      })
      .returning({ id: walkPriceOffers.id });
    if (!inserted) throw new Error("Insert failed");

    await logAudit({
      tx,
      actorUserId,
      entityType: "WALK_PRICE_OFFER",
      entityId: inserted.id,
      action: "PROPOSE_WALK_OFFER",
      afterJson: { proposedPrice: input.proposedPrice, proposedBy: actorRole },
    });

    return inserted.id;
  });
}

export async function counterWalkOffer(
  existingOfferId: string,
  input: CounterWalkOfferInput,
  actorUserId: string,
): Promise<string> {
  const db = getDb();
  const [offer] = await db
    .select()
    .from(walkPriceOffers)
    .where(eq(walkPriceOffers.id, existingOfferId))
    .limit(1);
  if (!offer) throw new Error("Offer not found");
  if (offer.status !== "pending") throw new Error("Offer not pending");

  const ownerUserId = await getOwnerUserIdForDog(offer.dogId);
  const actorRole = await resolveActorRole(actorUserId, ownerUserId, offer.walkerProfileId);
  if (actorRole === offer.proposedBy) throw new Error("Cannot counter your own offer");

  return db.transaction(async (tx) => {
    await tx
      .update(walkPriceOffers)
      .set({ status: "superseded" })
      .where(eq(walkPriceOffers.id, existingOfferId));

    const [inserted] = await tx
      .insert(walkPriceOffers)
      .values({
        walkId: offer.walkId,
        ownerUserId: offer.ownerUserId,
        walkerProfileId: offer.walkerProfileId,
        dogId: offer.dogId,
        proposedBy: actorRole,
        proposedPrice: input.proposedPrice,
        proposedDurationMin: input.proposedDurationMin ?? null,
        supersedesOfferId: existingOfferId,
      })
      .returning({ id: walkPriceOffers.id });
    if (!inserted) throw new Error("Insert failed");

    await logAudit({
      tx,
      actorUserId,
      entityType: "WALK_PRICE_OFFER",
      entityId: inserted.id,
      action: "PROPOSE_WALK_OFFER",
      afterJson: { proposedPrice: input.proposedPrice, proposedBy: actorRole, counterOf: existingOfferId },
    });

    return inserted.id;
  });
}

export async function acceptWalkOffer(offerId: string, actorUserId: string): Promise<void> {
  const db = getDb();
  const [offer] = await db
    .select()
    .from(walkPriceOffers)
    .where(eq(walkPriceOffers.id, offerId))
    .limit(1);
  if (!offer) throw new Error("Offer not found");
  if (offer.status !== "pending") throw new Error("Offer not pending");

  const ownerUserId = await getOwnerUserIdForDog(offer.dogId);
  const actorRole = await resolveActorRole(actorUserId, ownerUserId, offer.walkerProfileId);
  if (actorRole === offer.proposedBy) throw new Error("Cannot accept your own offer");

  await db.transaction(async (tx) => {
    // Re-read inside tx — stale-state hardening (same pattern as approvePriceAgreement)
    const [fresh] = await tx
      .select({ status: walkPriceOffers.status })
      .from(walkPriceOffers)
      .where(eq(walkPriceOffers.id, offerId))
      .limit(1);
    if (!fresh || fresh.status !== "pending") throw new Error("Offer no longer pending");

    const now = new Date();
    await tx
      .update(walkPriceOffers)
      .set({ status: "accepted", respondedAt: now })
      .where(eq(walkPriceOffers.id, offerId));

    if (offer.walkId != null) {
      await tx
        .update(walks)
        .set({ finalPrice: offer.proposedPrice })
        .where(eq(walks.id, offer.walkId));
    } else {
      // Expire any other accepted unlinked pre-start offers for this trio
      await tx
        .update(walkPriceOffers)
        .set({ status: "expired" })
        .where(and(
          eq(walkPriceOffers.ownerUserId, offer.ownerUserId),
          eq(walkPriceOffers.walkerProfileId, offer.walkerProfileId),
          eq(walkPriceOffers.dogId, offer.dogId),
          eq(walkPriceOffers.status, "accepted"),
          isNull(walkPriceOffers.walkId),
          ne(walkPriceOffers.id, offerId),
        ));
    }

    // Expire all other pending offers for the trio
    await tx
      .update(walkPriceOffers)
      .set({ status: "expired" })
      .where(and(
        eq(walkPriceOffers.ownerUserId, offer.ownerUserId),
        eq(walkPriceOffers.walkerProfileId, offer.walkerProfileId),
        eq(walkPriceOffers.dogId, offer.dogId),
        eq(walkPriceOffers.status, "pending"),
        ne(walkPriceOffers.id, offerId),
      ));

    await logAudit({
      tx,
      actorUserId,
      entityType: "WALK_PRICE_OFFER",
      entityId: offerId,
      action: "ACCEPT_WALK_OFFER",
      afterJson: { status: "accepted", actorRole },
    });
  });
}

export async function rejectWalkOffer(offerId: string, actorUserId: string): Promise<void> {
  const db = getDb();
  const [offer] = await db
    .select()
    .from(walkPriceOffers)
    .where(eq(walkPriceOffers.id, offerId))
    .limit(1);
  if (!offer) throw new Error("Offer not found");
  if (offer.status !== "pending") throw new Error("Offer not pending");

  const ownerUserId = await getOwnerUserIdForDog(offer.dogId);
  const actorRole = await resolveActorRole(actorUserId, ownerUserId, offer.walkerProfileId);
  if (actorRole === offer.proposedBy) throw new Error("Cannot reject your own offer");

  await db.transaction(async (tx) => {
    // Re-read inside tx — stale-state hardening (same pattern as approvePriceAgreement)
    const [fresh] = await tx
      .select({ status: walkPriceOffers.status })
      .from(walkPriceOffers)
      .where(eq(walkPriceOffers.id, offerId))
      .limit(1);
    if (!fresh || fresh.status !== "pending") throw new Error("Offer no longer pending");

    const now = new Date();
    await tx
      .update(walkPriceOffers)
      .set({ status: "rejected", respondedAt: now })
      .where(eq(walkPriceOffers.id, offerId));

    await logAudit({
      tx,
      actorUserId,
      entityType: "WALK_PRICE_OFFER",
      entityId: offerId,
      action: "REJECT_WALK_OFFER",
      afterJson: { status: "rejected", actorRole },
    });
  });
}

export async function linkAndApplyAcceptedOffer(
  ownerUserId: string,
  walkerProfileId: string,
  dogId: string,
  walkId: string,
  tx: Tx,
): Promise<string | null> {
  const [offer] = await tx
    .select({ id: walkPriceOffers.id, proposedPrice: walkPriceOffers.proposedPrice })
    .from(walkPriceOffers)
    .where(and(
      eq(walkPriceOffers.ownerUserId, ownerUserId),
      eq(walkPriceOffers.walkerProfileId, walkerProfileId),
      eq(walkPriceOffers.dogId, dogId),
      eq(walkPriceOffers.status, "accepted"),
      isNull(walkPriceOffers.walkId),
    ))
    .limit(1);

  if (!offer) return null;

  await tx
    .update(walkPriceOffers)
    .set({ walkId })
    .where(eq(walkPriceOffers.id, offer.id));

  await tx
    .update(walks)
    .set({ finalPrice: offer.proposedPrice })
    .where(eq(walks.id, walkId));

  await tx
    .update(walkPriceOffers)
    .set({ status: "expired" })
    .where(and(
      eq(walkPriceOffers.ownerUserId, ownerUserId),
      eq(walkPriceOffers.walkerProfileId, walkerProfileId),
      eq(walkPriceOffers.dogId, dogId),
      eq(walkPriceOffers.status, "pending"),
    ));

  return offer.proposedPrice;
}
