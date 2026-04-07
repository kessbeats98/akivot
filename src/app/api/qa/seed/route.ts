import { type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/db/drizzle";
import { walkerProfiles, dogs, dogOwners, dogWalkers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "node:crypto";

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

  let count = 1;
  try {
    const body = await req.json().catch(() => ({}));
    if (typeof body?.count === "number" && body.count >= 1 && body.count <= 5) {
      count = body.count;
    }
  } catch { /* ignore parse errors, use default */ }

  const db = getDb();
  const now = new Date();

  const result = await db.transaction(async (tx) => {
    // 1. Walker profile — get or create
    const [existingWp] = await tx
      .select({ id: walkerProfiles.id })
      .from(walkerProfiles)
      .where(eq(walkerProfiles.userId, user.id))
      .limit(1);

    let walkerProfileId: string;
    if (existingWp) {
      walkerProfileId = existingWp.id;
    } else {
      const [wp] = await tx
        .insert(walkerProfiles)
        .values({
          userId: user.id,
          displayName: user.name,
          inviteCode: `qa-${crypto.randomUUID()}`,
          updatedAt: now,
        })
        .returning({ id: walkerProfiles.id });
      walkerProfileId = wp!.id;
    }

    // 2. Dogs — get or create N dogs
    const dogIds: string[] = [];
    for (let i = 0; i < count; i++) {
      const dogName = count === 1 ? "QA Dog" : `QA Dog ${i + 1}`;

      const existingDogs = await tx
        .select({ id: dogs.id })
        .from(dogs)
        .innerJoin(dogOwners, and(eq(dogOwners.dogId, dogs.id), eq(dogOwners.ownerUserId, user.id)))
        .where(eq(dogs.name, dogName))
        .limit(1);

      let dogId: string;
      if (existingDogs.length > 0) {
        dogId = existingDogs[0]!.id;
      } else {
        const [dog] = await tx
          .insert(dogs)
          .values({ name: dogName, isActive: true, updatedAt: now })
          .returning({ id: dogs.id });
        dogId = dog!.id;

        await tx.insert(dogOwners).values({ dogId, ownerUserId: user.id, isPrimary: true });
      }

      // 3. Walker assignment — get or create
      const [existingDw] = await tx
        .select({ id: dogWalkers.id })
        .from(dogWalkers)
        .where(and(eq(dogWalkers.dogId, dogId), eq(dogWalkers.walkerProfileId, walkerProfileId)))
        .limit(1);

      if (!existingDw) {
        await tx.insert(dogWalkers).values({
          dogId,
          walkerProfileId,
          currentPrice: "50.00",
          currency: "ILS",
          isActive: true,
          startedAt: now,
          updatedAt: now,
        });
      }

      dogIds.push(dogId);
    }

    return { dogId: dogIds[0]!, dogIds, walkerProfileId };
  });

  return Response.json(result, { status: 200 });
}
