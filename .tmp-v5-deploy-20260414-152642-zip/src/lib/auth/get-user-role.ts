import { eq } from "drizzle-orm";
import { getDb } from "@/db/drizzle";
import { walkerProfiles, dogOwners } from "@/db/schema";

export type UserRole = "walker" | "owner" | "both" | "none";

export async function getUserRole(userId: string): Promise<UserRole> {
  const db = getDb();

  const [[walker], [owner]] = await Promise.all([
    db
      .select({ id: walkerProfiles.id })
      .from(walkerProfiles)
      .where(eq(walkerProfiles.userId, userId))
      .limit(1),
    db
      .select({ id: dogOwners.id })
      .from(dogOwners)
      .where(eq(dogOwners.ownerUserId, userId))
      .limit(1),
  ]);

  if (walker && owner) return "both";
  if (walker) return "walker";
  if (owner) return "owner";
  return "none";
}
