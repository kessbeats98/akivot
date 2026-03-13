export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { config } from "@/lib/config";
import { autoCloseWalks } from "@/lib/repositories/walksRepo";

function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function GET(req: NextRequest) {
  if (!config.cron.secret) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }
  const auth = req.headers.get("authorization") ?? "";
  if (!timingSafeCompare(auth, `Bearer ${config.cron.secret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const closed = await autoCloseWalks();
    return NextResponse.json({ closed }, { status: 200 });
  } catch (err: unknown) {
    console.error("[GET /api/jobs/auto-close]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
