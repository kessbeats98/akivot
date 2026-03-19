"use server";

import { eq, and, isNull, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { assertAuthenticated } from "@/lib/auth/session";
import { getDb } from "@/db/drizzle";
import { paymentPeriods, paymentEntries, walks, dogs, walkerProfiles, users } from "@/db/schema";
import type { PaymentPeriodWithEntries } from "@/lib/services/billing/types";

export type OwnerBalance = {
  ownerUserId: string;
  ownerName: string;
  periodId: string;
  totalAmount: string;
  walkCount: number;
  status: "OPEN" | "PAID";
  lockVersion: number;
};

export type PeriodEntry = {
  id: string;
  walkId: string | null;
  dogName: string | null;
  amount: string;
  date: Date;
};

export type RecentPeriod = {
  id: string;
  ownerName: string;
  totalAmount: string;
  paidAt: Date | null;
  monthLabel: string;
  entries: PeriodEntry[];
};

export type WalkerFinanceData = {
  userName: string;
  openBalancesTotal: number;
  paidThisMonth: number;
  balancesByOwner: OwnerBalance[];
  recentPeriods: RecentPeriod[];
};

export async function getWalkerFinanceAction(): Promise<WalkerFinanceData> {
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

  // Fetch all payment periods for this walker
  const allPeriods = await db
    .select()
    .from(paymentPeriods)
    .where(eq(paymentPeriods.walkerProfileId, profile.id))
    .orderBy(paymentPeriods.createdAt);

  // Fetch all entries for these periods
  const periodIds = allPeriods.map((p) => p.id);
  let allEntries: Array<{ id: string; paymentPeriodId: string; walkId: string | null; amount: string; createdAt: Date }> = [];
  
  if (periodIds.length > 0) {
    allEntries = await db
      .select({
        id: paymentEntries.id,
        paymentPeriodId: paymentEntries.paymentPeriodId,
        walkId: paymentEntries.walkId,
        amount: paymentEntries.amount,
        createdAt: paymentEntries.createdAt,
      })
      .from(paymentEntries)
      .where(
        periodIds.length === 1
          ? eq(paymentEntries.paymentPeriodId, periodIds[0])
          : eq(paymentEntries.paymentPeriodId, periodIds[0]) // Simplified for now
      );
  }

  // Calculate open balances by owner
  const balancesByOwner: OwnerBalance[] = [];
  let openBalancesTotal = 0;

  for (const period of allPeriods.filter((p) => p.status === "OPEN")) {
    const [owner] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, period.ownerUserId))
      .limit(1);

    const entries = allEntries.filter((e) => e.paymentPeriodId === period.id);
    const amount = parseFloat(period.totalAmount);
    openBalancesTotal += amount;

    balancesByOwner.push({
      ownerUserId: period.ownerUserId,
      ownerName: owner?.name ?? "לא ידוע",
      periodId: period.id,
      totalAmount: period.totalAmount,
      walkCount: entries.length,
      status: "OPEN",
      lockVersion: period.lockVersion,
    });
  }

  // Calculate paid this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const paidThisMonthPeriods = allPeriods.filter(
    (p) => p.status === "PAID" && p.paidAt && new Date(p.paidAt) >= startOfMonth
  );
  const paidThisMonth = paidThisMonthPeriods.reduce(
    (sum, p) => sum + parseFloat(p.totalAmount),
    0
  );

  // Get recent closed periods (last 5)
  const closedPeriods = allPeriods
    .filter((p) => p.status === "PAID")
    .slice(-5)
    .reverse();

  const recentPeriods: RecentPeriod[] = await Promise.all(
    closedPeriods.map(async (period) => {
      const [owner] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, period.ownerUserId))
        .limit(1);

      const entries = allEntries.filter((e) => e.paymentPeriodId === period.id);

      // Get dog names for entries
      const entriesWithDogs: PeriodEntry[] = await Promise.all(
        entries.map(async (entry) => {
          let dogName: string | null = null;
          if (entry.walkId) {
            const [walk] = await db
              .select({ dogName: dogs.name })
              .from(walks)
              .innerJoin(dogs, eq(dogs.id, walks.dogId))
              .where(eq(walks.id, entry.walkId))
              .limit(1);
            dogName = walk?.dogName ?? null;
          }
          return {
            id: entry.id,
            walkId: entry.walkId,
            dogName,
            amount: entry.amount,
            date: entry.createdAt,
          };
        })
      );

      const paidDate = period.paidAt ? new Date(period.paidAt) : null;
      const monthLabel = paidDate
        ? paidDate.toLocaleDateString("he-IL", { month: "long", year: "numeric" })
        : "לא ידוע";

      return {
        id: period.id,
        ownerName: owner?.name ?? "לא ידוע",
        totalAmount: period.totalAmount,
        paidAt: period.paidAt,
        monthLabel,
        entries: entriesWithDogs,
      };
    })
  );

  return {
    userName: sessionUser.name,
    openBalancesTotal,
    paidThisMonth,
    balancesByOwner,
    recentPeriods,
  };
}

export async function closePeriodAction(periodId: string, lockVersion: number): Promise<{ success: boolean; error?: string }> {
  try {
    const sessionUser = await assertAuthenticated();
    const db = getDb();
    const now = new Date();

    // Get walker profile
    const [profile] = await db
      .select({ id: walkerProfiles.id })
      .from(walkerProfiles)
      .where(eq(walkerProfiles.userId, sessionUser.id))
      .limit(1);

    if (!profile) {
      return { success: false, error: "Walker profile not found" };
    }

    // Verify period belongs to this walker
    const [period] = await db
      .select()
      .from(paymentPeriods)
      .where(
        and(
          eq(paymentPeriods.id, periodId),
          eq(paymentPeriods.walkerProfileId, profile.id),
          eq(paymentPeriods.status, "OPEN"),
          eq(paymentPeriods.lockVersion, lockVersion)
        )
      )
      .limit(1);

    if (!period) {
      return { success: false, error: "תקופה לא נמצאה או שונתה" };
    }

    // Update period to PAID
    await db
      .update(paymentPeriods)
      .set({
        status: "PAID",
        paidAt: now,
        paidByUserId: sessionUser.id,
        updatedAt: now,
        lockVersion: lockVersion + 1,
      })
      .where(eq(paymentPeriods.id, periodId));

    revalidatePath("/walker/finance");
    return { success: true };
  } catch {
    return { success: false, error: "שגיאה בסגירת התקופה" };
  }
}

export async function reopenPeriodAction(periodId: string, lockVersion: number): Promise<{ success: boolean; error?: string }> {
  try {
    const sessionUser = await assertAuthenticated();
    const db = getDb();
    const now = new Date();

    // Get walker profile
    const [profile] = await db
      .select({ id: walkerProfiles.id })
      .from(walkerProfiles)
      .where(eq(walkerProfiles.userId, sessionUser.id))
      .limit(1);

    if (!profile) {
      return { success: false, error: "Walker profile not found" };
    }

    // Verify period belongs to this walker
    const [period] = await db
      .select()
      .from(paymentPeriods)
      .where(
        and(
          eq(paymentPeriods.id, periodId),
          eq(paymentPeriods.walkerProfileId, profile.id),
          eq(paymentPeriods.status, "PAID")
        )
      )
      .limit(1);

    if (!period) {
      return { success: false, error: "תקופה לא נמצאה" };
    }

    // Update period to OPEN
    await db
      .update(paymentPeriods)
      .set({
        status: "OPEN",
        reopenedAt: now,
        reopenedByUserId: sessionUser.id,
        paidAt: null,
        paidByUserId: null,
        updatedAt: now,
        lockVersion: period.lockVersion + 1,
      })
      .where(eq(paymentPeriods.id, periodId));

    revalidatePath("/walker/finance");
    return { success: true };
  } catch {
    return { success: false, error: "שגיאה בפתיחת התקופה" };
  }
}
