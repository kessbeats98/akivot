export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { assertAuthenticated } from "@/lib/auth/session";
import { assertDogOwnership, updateDogImageUrl } from "@/lib/repositories/dogsRepo";

export async function POST(req: NextRequest) {
  try {
    const user = await assertAuthenticated();

    const form = await req.formData();
    const dogId = form.get("dogId");
    const file = form.get("file");

    if (typeof dogId !== "string" || !(file instanceof File)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (file.size > 5_000_000) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    await assertDogOwnership(dogId, user.id);

    const buffer = Buffer.from(await file.arrayBuffer());
    const storageKey = `dogs/${dogId}/${Date.now()}-${file.name}`;
    const { url } = await put(storageKey, buffer, {
      access: "public",
      contentType: file.type,
    });

    await updateDogImageUrl(dogId, url);

    return NextResponse.json({ url }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("[POST /api/uploads/dog-image]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
