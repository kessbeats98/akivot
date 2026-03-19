"use server";

import { eq, and } from "drizzle-orm";
import { assertAuthenticated } from "@/lib/auth/session";
import { getDb } from "@/db/drizzle";
import { dogs, dogWalkers, dogOwners, walkerProfiles, users } from "@/db/schema";

export type WalkerDog = {
  id: string;
  name: string;
  breed: string | null;
  imageUrl: string | null;
  notes: string | null;
  ownerName: string;
  ownerPhone: string | null;
  currentPrice: string;
  tags: string[];
  isNew: boolean;
};

export type WalkerDogsData = {
  userName: string;
  dogs: WalkerDog[];
};

// Parse tags from notes field
function parseNoteTags(notes: string | null): string[] {
  if (!notes) return [];
  
  const tags: string[] = [];
  const notesLower = notes.toLowerCase();
  
  if (notesLower.includes("חרדתי") || notesLower.includes("anxiety") || notesLower.includes("anxious")) {
    tags.push("חרדתי");
  }
  if (notesLower.includes("ריאקטיבי") || notesLower.includes("reactive")) {
    tags.push("ריאקטיבי");
  }
  if (notesLower.includes("גור") || notesLower.includes("puppy")) {
    tags.push("גור");
  }
  if (notesLower.includes("אנרגטי") || notesLower.includes("energetic") || notesLower.includes("energy")) {
    tags.push("אנרגטי");
  }
  if (notesLower.includes("זקן") || notesLower.includes("senior") || notesLower.includes("old")) {
    tags.push("מבוגר");
  }
  
  return tags;
}

export async function getWalkerDogsAction(): Promise<WalkerDogsData> {
  const sessionUser = await assertAuthenticated();
  const db = getDb();

  // Get walker profile
  const [profile] = await db
    .select({ id: walkerProfiles.id })
    .from(walkerProfiles)
    .where(eq(walkerProfiles.userId, sessionUser.id))
    .limit(1);

  if (!profile) {
    throw new Error("Walker profile not found");
  }

  // Fetch all assigned dogs with owner info
  const rows = await db
    .select({
      dogId: dogs.id,
      dogName: dogs.name,
      breed: dogs.breed,
      imageUrl: dogs.imageUrl,
      notes: dogs.notes,
      currentPrice: dogWalkers.currentPrice,
      startedAt: dogWalkers.startedAt,
      ownerName: users.name,
    })
    .from(dogWalkers)
    .innerJoin(dogs, eq(dogs.id, dogWalkers.dogId))
    .innerJoin(dogOwners, and(eq(dogOwners.dogId, dogs.id), eq(dogOwners.isPrimary, true)))
    .innerJoin(users, eq(users.id, dogOwners.ownerUserId))
    .where(
      and(
        eq(dogWalkers.walkerProfileId, profile.id),
        eq(dogWalkers.isActive, true),
        eq(dogs.isActive, true)
      )
    );

  // Check if dog was added in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const walkerDogs: WalkerDog[] = rows.map((row) => ({
    id: row.dogId,
    name: row.dogName,
    breed: row.breed,
    imageUrl: row.imageUrl,
    notes: row.notes,
    ownerName: row.ownerName,
    ownerPhone: null, // Phone not available in current schema
    currentPrice: row.currentPrice,
    tags: parseNoteTags(row.notes),
    isNew: new Date(row.startedAt) >= thirtyDaysAgo,
  }));

  return {
    userName: sessionUser.name,
    dogs: walkerDogs,
  };
}
