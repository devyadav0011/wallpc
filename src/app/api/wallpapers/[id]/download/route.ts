import { NextRequest, NextResponse } from "next/server";
import { getWallpaperById, incrementDownloads } from "@/lib/wallpaper-service";
import { isDatabaseConfigured, getDb } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const resolution = searchParams.get("resolution") || "4k";
    const anonId = searchParams.get("anonId") || "anon_browser";

    let wallpaper: any = null;
    if (isDatabaseConfigured()) {
      const client = getDb();
      if (client) {
        wallpaper = await client.wallpaper.findUnique({ where: { id } }).catch(() => null);
      }
    }

    if (!wallpaper) {
      wallpaper = await getWallpaperById(id);
    }

    if (!wallpaper) {
      return NextResponse.json({ error: "Wallpaper not found" }, { status: 404 });
    }

    // Determine target URL based on resolution
    let targetUrl = wallpaper.fileUrl4k || wallpaper.fileUrl;
    if (resolution === "1440p" && wallpaper.fileUrl1440p) {
      targetUrl = wallpaper.fileUrl1440p;
    } else if (resolution === "1080p" && wallpaper.fileUrl1080p) {
      targetUrl = wallpaper.fileUrl1080p;
    }

    // Increment downloads count and log anonymous event asynchronously
    await incrementDownloads(id);
    if (isDatabaseConfigured()) {
      const client = getDb();
      if (client) {
        Promise.all([
          client.wallpaper.update({
            where: { id },
            data: {
              downloads: { increment: 1 },
              trendingScore: { increment: 3 },
            },
          }),
          client.downloadEvent.create({
            data: {
              wallpaperId: id,
              resolution,
              anonymousIdentifier: anonId,
            },
          }),
        ]).catch(() => {});
      }
    }

    // Descriptive clean filename: e.g. wallpc-neon-cyberpunk-city-4k.webp
    const filename = `wallpc-${wallpaper.slug}-${resolution}.webp`;

    // Fetch the asset buffer and stream with attachment header so the browser directly downloads it!
    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "WallPC/1.0",
        },
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const contentType = response.headers.get("content-type") || "image/webp";

        return new NextResponse(arrayBuffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    } catch (fetchErr) {
      console.warn("Direct stream fetch failed, redirecting to target URL:", fetchErr);
    }

    // Fallback: Redirect directly to CDN URL
    return NextResponse.redirect(targetUrl, 302);
  } catch (err) {
    console.error("GET download error:", err);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
