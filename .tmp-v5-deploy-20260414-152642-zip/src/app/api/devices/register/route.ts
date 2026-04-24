import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAuthenticated } from "@/lib/auth/session";
import { registerDeviceSchema } from "@/lib/validation/devices";
import { upsertDevice } from "@/lib/repositories/notificationsRepo";

export async function POST(req: NextRequest) {
  try {
    const user = await assertAuthenticated();
    const body = await req.json();
    const input = registerDeviceSchema.parse(body);
    const deviceId = await upsertDevice(user.id, input);
    return NextResponse.json({ deviceId }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("[POST /api/devices/register]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
