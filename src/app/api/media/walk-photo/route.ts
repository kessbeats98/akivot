export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { head } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { assertAuthenticated } from "@/lib/auth/session";
import { getDb } from "@/db/drizzle";
import { walkMedia, walks } from "@/db/schema";
import { assertDogOwnership } from "@/lib/repositories/dogsRepo";

export async function GET(req: NextRequest) {
  try {
    const user = await assertAuthenticated();

    const key = req.nextUrl.searchParams.get("key");
    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    const db = getDb();

    const [mediaRow] = await db
      .select({ id: walkMedia.id, walkId: walkMedia.walkId })
      .from(walkMedia)
      .where(eq(walkMedia.storageKey, key))
      .limit(1);

    if (!mediaRow) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [walkRow] = await db
      .select({ dogId: walks.dogId })
      .from(walks)
      .where(eq(walks.id, mediaRow.walkId))
      .limit(1);

    if (!walkRow) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await assertDogOwnership(walkRow.dogId, user.id);

    const blobMeta = await head(key);

    // head() returns a signed downloadUrl for private blobs
    const downloadUrl = blobMeta.downloadUrl ?? blobMeta.url;
    const blobRes = await fetch(downloadUrl);
    if (!blobRes.ok) {
      return NextResponse.json({ error: "Blob fetch failed" }, { status: 502 });
    }

    return new NextResponse(blobRes.body, {
      headers: {
        "Content-Type": blobMeta.contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("[GET /api/media/walk-photo]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
