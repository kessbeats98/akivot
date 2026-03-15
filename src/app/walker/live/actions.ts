"use server"

import { redirect } from "next/navigation"
import { assertAuthenticated } from "@/lib/auth/session"
import { endWalkSchema } from "@/lib/validation/walks"
import { endWalk } from "@/lib/repositories/walksRepo"
import { notifyWalkEvent } from "@/lib/services/notifications/fcmService"

export async function endWalkFromLiveAction(walkId: string, _fd: FormData) {
  const user = await assertAuthenticated()
  const input = endWalkSchema.parse({ walkId })
  await endWalk(user.id, input)
  void notifyWalkEvent(walkId, "WALK_COMPLETED")
  redirect("/walker/dashboard")
}
