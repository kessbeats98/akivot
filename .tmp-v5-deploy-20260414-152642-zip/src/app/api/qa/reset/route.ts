import { type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
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
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";

function checkSecret(req: NextRequest): Response | null {
  const secret = process.env.QA_SEED_SECRET;
  if (secret) {
    const header = req.headers.get("x-qa-seed-secret");
    if (header !== secret) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const deny = checkSecret(req);
  if (deny) return deny;

  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const result: Record<string, number> = {};

  await db.transaction(async (tx) => {
    const [wp] = await tx
      .select({ id: walkerProfiles.id })
      .from(walkerProfiles)
      .where(eq(walkerProfiles.userId, user.id))
      .limit(1);

    const ownedDogRows = await tx
      .select({ dogId: dogOwners.dogId })
      .from(dogOwners)
      .where(eq(dogOwners.ownerUserId, user.id));
    const dogIds = ownedDogRows.map((r) => r.dogId);

    // Walk media
    if (wp || dogIds.length > 0) {
      const walkRows = await tx
        .select({ id: walks.id })
        .from(walks)
        .where(
          dogIds.length > 0 && wp
            ? sql`${walks.dogId} IN ${dogIds} OR ${walks.walkerProfileId} = ${wp.id}`
            : dogIds.length > 0
              ? sql`${walks.dogId} IN ${dogIds}`
              : sql`${walks.walkerProfileId} = ${wp!.id}`,
        );
      const walkIds = walkRows.map((r) => r.id);
      if (walkIds.length > 0) {
        const wm = await tx.delete(walkMedia).where(sql`${walkMedia.walkId} IN ${walkIds}`);
        result.walkMedia = wm.rowCount ?? 0;
      }
    }

    // Audit logs
    const al = await tx.delete(auditLogs).where(eq(auditLogs.actorUserId, user.id));
    result.auditLogs = al.rowCount ?? 0;

    // Payment entries
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

    // Walks
    if (dogIds.length > 0 && wp) {
      const w = await tx.delete(walks).where(
        sql`${walks.dogId} IN ${dogIds} OR ${walks.walkerProfileId} = ${wp.id}`,
      );
      result.walks = w.rowCount ?? 0;
    } else if (dogIds.length > 0) {
      const w = await tx.delete(walks).where(sql`${walks.dogId} IN ${dogIds}`);
      result.walks = w.rowCount ?? 0;
    } else if (wp) {
      const w = await tx.delete(walks).where(eq(walks.walkerProfileId, wp.id));
      result.walks = w.rowCount ?? 0;
    }

    // Walk batches
    if (wp) {
      const wb = await tx.delete(walkBatches).where(eq(walkBatches.walkerProfileId, wp.id));
      result.walkBatches = wb.rowCount ?? 0;
    }

    // Dog walkers
    if (dogIds.length > 0 && wp) {
      const dwDel = await tx.delete(dogWalkers).where(
        sql`${dogWalkers.dogId} IN ${dogIds} OR ${dogWalkers.walkerProfileId} = ${wp.id}`,
      );
      result.dogWalkers = dwDel.rowCount ?? 0;
    } else if (dogIds.length > 0) {
      const dwDel = await tx.delete(dogWalkers).where(sql`${dogWalkers.dogId} IN ${dogIds}`);
      result.dogWalkers = dwDel.rowCount ?? 0;
    } else if (wp) {
      const dwDel = await tx.delete(dogWalkers).where(eq(dogWalkers.walkerProfileId, wp.id));
      result.dogWalkers = dwDel.rowCount ?? 0;
    }

    // Dog owners
    const doDel = await tx.delete(dogOwners).where(eq(dogOwners.ownerUserId, user.id));
    result.dogOwners = doDel.rowCount ?? 0;

    // Dogs
    if (dogIds.length > 0) {
      const dDel = await tx.delete(dogs).where(sql`${dogs.id} IN ${dogIds}`);
      result.dogs = dDel.rowCount ?? 0;
    }

    // Walker profile
    if (wp) {
      await tx.delete(walkerProfiles).where(eq(walkerProfiles.id, wp.id));
      result.walkerProfiles = 1;
    }
  });

  return Response.json({ ok: true, deleted: result }, { status: 200 });
}
