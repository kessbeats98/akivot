"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { assertAuthenticated } from "@/lib/auth/session"
import { endWalkSchema } from "@/lib/validation/walks"
import { endWalk } from "@/lib/repositories/walksRepo"
import { notifyWalkEvent } from "@/lib/services/notifications/fcmService"
import { getDb } from "@/db/drizzle"
import { walks, walkerProfiles } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function endWalkFromLiveAction(walkId: string, fd: FormData) {
  const user = await assertAuthenticated()
  const rawNote = fd.get("note")
  const note = typeof rawNote === "string" && rawNote.trim() ? rawNote.trim() : undefined
  console.log("[walker/live] endWalkFromLiveAction called", { userId: user.id, walkId, hasNote: !!note })
  const input = endWalkSchema.parse({ walkId, note })
  await endWalk(user.id, input)
  console.log("[walker/live] walk ended:", walkId)
  void notifyWalkEvent(walkId, "WALK_COMPLETED")
  revalidatePath("/walker/dashboard")
  redirect("/walker/dashboard")
}

export async function checkWalkStatusAction(walkId: string): Promise<{ status: string }> {
  const user = await assertAuthenticated()
  const db = getDb()
  const [row] = await db
    .select({ status: walks.status })
    .from(walks)
    .innerJoin(walkerProfiles, eq(walkerProfiles.id, walks.walkerProfileId))
    .where(and(eq(walks.id, walkId), eq(walkerProfiles.userId, user.id)))
    .limit(1)
  return { status: row?.status ?? "NOT_FOUND" }
}
