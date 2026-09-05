import { NextRequest, NextResponse } from "next/server";
import { incrementViews } from "@/lib/wallpaper-service";
import { isDatabaseConfigured, getDb } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const anonId = body.anonymousId || "anon";

    await incrementViews(id);

    if (isDatabaseConfigured()) {
      const client = getDb();
      if (client) {
        Promise.all([
          client.wallpaper.update({
            where: { id },
            data: {
              views: { increment: 1 },
              trendingScore: { increment: 0.5 },
            },
          }),
          client.viewEvent.create({
            data: {
              wallpaperId: id,
              anonymousIdentifier: anonId,
            },
          }),
        ]).catch(() => {});
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST view error:", err);
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}
