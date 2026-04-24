// Max body size: ~10 MB soft limit (Node.js runtime, not Edge).
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { assertAuthenticated } from "@/lib/auth/session";
import { getDb } from "@/db/drizzle";
import { walkerProfiles, walks, walkMedia } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const user = await assertAuthenticated();

    const form = await req.formData();
    const walkId = form.get("walkId");
    const capturedAtRaw = form.get("capturedAt");
    const file = form.get("file");

    if (
      typeof walkId !== "string" ||
      typeof capturedAtRaw !== "string" ||
      !(file instanceof File)
    ) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const capturedAt = new Date(capturedAtRaw);
    if (isNaN(capturedAt.getTime())) {
      return NextResponse.json(
        { error: "Invalid capturedAt" },
        { status: 400 },
      );
    }

    const db = getDb();

    // Resolve walkerProfile for this user
    const walkerProfile = await db.query.walkerProfiles.findFirst({
      where: eq(walkerProfiles.userId, user.id),
    });
    if (!walkerProfile) {
      return NextResponse.json(
        { error: "Walker profile not found" },
        { status: 404 },
      );
    }

    // Validate the walk
    const walk = await db.query.walks.findFirst({
      where: eq(walks.id, walkId),
    });
    if (!walk) {
      return NextResponse.json({ error: "Walk not found" }, { status: 404 });
    }
    if (walk.walkerProfileId !== walkerProfile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (walk.status !== "LIVE") {
      return NextResponse.json(
        { error: "Walk is not LIVE" },
        { status: 400 },
      );
    }

    // Upload to Vercel Blob
    const buffer = Buffer.from(await file.arrayBuffer());
    const storageKey = `walks/${walkId}/${Date.now()}-${file.name}`;
    const { url: publicUrl } = await put(storageKey, buffer, {
      access: "private",
      contentType: file.type || "application/octet-stream",
    });

    // Record in DB
    await db.insert(walkMedia).values({
      walkId,
      mediaType: "PHOTO",
      storageProvider: "VERCEL_BLOB",
      storageKey,
      publicUrl,
      uploadedByUserId: user.id,
      uploadStatus: "UPLOADED",
      capturedAt,
      uploadedAt: new Date(),
    });

    return NextResponse.json({ url: publicUrl }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[POST /api/uploads/walk-media]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
