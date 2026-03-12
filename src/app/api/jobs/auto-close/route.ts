export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";
import { autoCloseWalks } from "@/lib/repositories/walksRepo";

export async function GET(req: NextRequest) {
  if (!config.cron.secret) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }
  const auth = req.headers.get("authorization");
  if (!auth || auth !== `Bearer ${config.cron.secret}`) {
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
