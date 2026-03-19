"use server";

import { eq, and, isNull, gte, lte } from "drizzle-orm";
import { assertAuthenticated } from "@/lib/auth/session";
import { getDb } from "@/db/drizzle";
import { walks, dogs, walkerProfiles, dogOwners, users } from "@/db/schema";

export type CalendarWalk = {
  id: string;
  dogName: string;
  ownerName: string;
  status: "LIVE" | "PLANNED" | "COMPLETED" | "AUTO_CLOSED" | "CANCELLED";
  startTime: Date;
  endTime: Date | null;
  durationMinutes: number | null;
};

export type CalendarDayData = {
  date: string; // YYYY-MM-DD
  walkCount: number;
  totalMinutes: number;
  hasLive: boolean;
  hasPlanned: boolean;
};

export type WalkerCalendarData = {
  userName: string;
  month: number; // 1-12
  year: number;
  days: CalendarDayData[];
  walks: CalendarWalk[];
};

export async function getWalkerCalendarAction(
  monthParam?: string
): Promise<WalkerCalendarData> {
  const sessionUser = await assertAuthenticated();
  const db = getDb();

  // Parse month parameter or use current month
  let year: number;
  let month: number;
  
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split("-").map(Number);
    year = y;
    month = m;
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth() + 1;
  }

  // Get walker profile
  const [profile] = await db
    .select({ id: walkerProfiles.id })
    .from(walkerProfiles)
    .where(eq(walkerProfiles.userId, sessionUser.id))
    .limit(1);
  
  if (!profile) {
    throw new Error("Walker profile not found");
  }

  // Calculate month boundaries
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  // Fetch all walks for this month
  const monthWalks = await db
    .select({
      id: walks.id,
      status: walks.status,
      startTime: walks.startTime,
      endTime: walks.endTime,
      durationMinutes: walks.durationMinutes,
      dogName: dogs.name,
    })
    .from(walks)
    .innerJoin(dogs, eq(dogs.id, walks.dogId))
    .where(
      and(
        eq(walks.walkerProfileId, profile.id),
        isNull(walks.deletedAt),
        gte(walks.startTime, startOfMonth),
        lte(walks.startTime, endOfMonth)
      )
    );

  // Get owner names for each walk
  const walksWithOwners: CalendarWalk[] = await Promise.all(
    monthWalks.map(async (walk) => {
      // Get dog's owner
      const [ownerData] = await db
        .select({
          ownerName: users.name,
        })
        .from(dogOwners)
        .innerJoin(users, eq(users.id, dogOwners.ownerUserId))
        .innerJoin(dogs, eq(dogs.id, dogOwners.dogId))
        .where(
          and(
            eq(dogOwners.dogId, (await db.select({ dogId: walks.dogId }).from(walks).where(eq(walks.id, walk.id)).limit(1))[0]?.dogId ?? ""),
            eq(dogOwners.isPrimary, true)
          )
        )
        .limit(1);

      return {
        id: walk.id,
        dogName: walk.dogName,
        ownerName: ownerData?.ownerName ?? "לא ידוע",
        status: walk.status as CalendarWalk["status"],
        startTime: walk.startTime,
        endTime: walk.endTime,
        durationMinutes: walk.durationMinutes,
      };
    })
  );

  // Build day-by-day summary
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: CalendarDayData[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayStart = new Date(year, month - 1, day);
    const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999);

    const dayWalks = walksWithOwners.filter((w) => {
      const walkDate = new Date(w.startTime);
      return walkDate >= dayStart && walkDate <= dayEnd;
    });

    days.push({
      date: dateStr,
      walkCount: dayWalks.length,
      totalMinutes: dayWalks.reduce((sum, w) => sum + (w.durationMinutes ?? 0), 0),
      hasLive: dayWalks.some((w) => w.status === "LIVE"),
      hasPlanned: dayWalks.some((w) => w.status === "PLANNED"),
    });
  }

  return {
    userName: sessionUser.name,
    month,
    year,
    days,
    walks: walksWithOwners,
  };
}
