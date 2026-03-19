import { eq } from "drizzle-orm";
import { getDb } from "@/db/drizzle";
import { users, walkerProfiles } from "@/db/schema";

export type UserWithWalkerProfile = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  walkerProfile: {
    id: string;
    displayName: string;
    inviteCode: string;
  } | null;
};

export async function getUserWithWalkerProfile(userId: string): Promise<UserWithWalkerProfile | null> {
  const db = getDb();
  
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return null;

  const [walkerProfile] = await db
    .select({
      id: walkerProfiles.id,
      displayName: walkerProfiles.displayName,
      inviteCode: walkerProfiles.inviteCode,
    })
    .from(walkerProfiles)
    .where(eq(walkerProfiles.userId, userId))
    .limit(1);

  return {
    ...user,
    walkerProfile: walkerProfile ?? null,
  };
}

export async function hasWalkerProfile(userId: string): Promise<boolean> {
  const db = getDb();
  const [row] = await db
    .select({ id: walkerProfiles.id })
    .from(walkerProfiles)
    .where(eq(walkerProfiles.userId, userId))
    .limit(1);
  return !!row;
}
