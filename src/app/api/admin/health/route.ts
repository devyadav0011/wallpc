import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/adminAuth";
import { db, isDatabaseConfigured, isPostgresConfigured } from "@/lib/db";
import { getWallpapers } from "@/lib/wallpaper-service";
import { getStorageProvider } from "@/lib/storage";

export interface WallpaperHealthItem {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  published: boolean;
  status: "healthy" | "broken_url" | "missing_url" | "missing_dimensions" | "unsafe_local_path";
  issue?: string;
}

export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Database health
    let dbStatus: {
      status: "connected" | "unavailable" | "not_configured";
      provider: "postgresql" | "sqlite" | "none";
      wallpapersCount?: number;
      categoriesCount?: number;
      error?: string;
    } = {
      status: "not_configured",
      provider: "none",
    };

    if (!isDatabaseConfigured()) {
      dbStatus = {
        status: "not_configured",
        provider: "none",
        error: "PostgreSQL DATABASE_URL is not configured. WallPC requires a hosted PostgreSQL database.",
      };
    } else {
      const provider = "postgresql";
      try {
        await db.$queryRaw`SELECT 1`;
        const [wCount, cCount] = await Promise.all([
          db.wallpaper.count(),
          db.category.count(),
        ]);
        dbStatus = {
          status: "connected",
          provider,
          wallpapersCount: wCount,
          categoriesCount: cCount,
        };
      } catch (dbErr: any) {
        dbStatus = {
          status: "unavailable",
          provider,
          error: dbErr?.message?.split("\n")[0] || "Failed to query database",
        };
      }
    }

    // 2. Storage health
    const storageProvider = getStorageProvider();
    const storageStatus = {
      status:
        storageProvider.name === "local" && process.env.VERCEL
          ? "in_memory_fallback"
          : "configured",
      provider: storageProvider.name,
    };

    // 3. Wallpaper Asset Health
    let wallpapers: any[] = [];
    if (dbStatus.status === "connected") {
      try {
        wallpapers = await db.wallpaper.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
        });
      } catch (e) {
        console.warn("[Admin Health] DB query failed, using static list:", e);
      }
    }

    if (wallpapers.length === 0) {
      const res = await getWallpapers({ limit: 100 });
      wallpapers = res.data;
    }

    const items: WallpaperHealthItem[] = wallpapers.map((w) => {
      const img = w.imageUrl || w.fileUrl || w.previewUrl || "";
      const thumb = w.thumbnailUrl || img;
      const width = parseInt(w.width || w.resolutionWidth || "0", 10);
      const height = parseInt(w.height || w.resolutionHeight || "0", 10);

      let status: WallpaperHealthItem["status"] = "healthy";
      let issue: string | undefined = undefined;

      if (!img || img === "undefined" || img === "null") {
        status = "missing_url";
        issue = "No image asset URL configured";
      } else if (
        img.startsWith("file://") ||
        img.startsWith("C:") ||
        img.startsWith("D:") ||
        img.startsWith("blob:")
      ) {
        status = "unsafe_local_path";
        issue = "Local or ephemeral file path cannot be served in production";
      } else if (!img.startsWith("https://") && !img.startsWith("http://") && !img.startsWith("/")) {
        status = "broken_url";
        issue = "Malformed or non-HTTP image URL protocol";
      } else if (width < 1920 || height < 1080) {
        status = "missing_dimensions";
        issue = `Resolution (${width}×${height}) is below minimum 1080p desktop standard`;
      }

      return {
        id: w.id,
        title: w.title,
        slug: w.slug,
        imageUrl: img,
        thumbnailUrl: thumb,
        width,
        height,
        published: !!w.published,
        status,
        issue,
      };
    });

    const summary = {
      total: items.length,
      healthy: items.filter((i) => i.status === "healthy").length,
      broken: items.filter(
        (i) =>
          i.status === "broken_url" ||
          i.status === "unsafe_local_path" ||
          i.status === "missing_url"
      ).length,
      missingDimensions: items.filter((i) => i.status === "missing_dimensions").length,
    };

    return NextResponse.json({
      database: dbStatus,
      storage: storageStatus,
      summary,
      items,
      wallpapers: items,
    });
  } catch (err: any) {
    console.error("Admin health check error:", err);
    return NextResponse.json({ error: "Health check failed" }, { status: 500 });
  }
}
