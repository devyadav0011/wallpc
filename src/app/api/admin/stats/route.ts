import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConfigured } from "@/lib/db";
import { verifyAdminAuth } from "@/lib/adminAuth";
import { getPlatformStats } from "@/lib/wallpaper-service";

export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (isDatabaseConfigured()) {
      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [
          totalWallpapers,
          categoriesCount,
          collectionsCount,
          aggregates,
          newUploads,
          topDownloaded,
          trendingWallpapers,
        ] = await Promise.all([
          db.wallpaper.count(),
          db.category.count(),
          db.collection.count(),
          db.wallpaper.aggregate({
            _sum: {
              downloads: true,
              views: true,
            },
          }),
          db.wallpaper.count({
            where: {
              createdAt: { gte: sevenDaysAgo },
            },
          }),
          db.wallpaper.findMany({
            take: 5,
            orderBy: { downloads: "desc" },
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnailUrl: true,
              downloads: true,
              views: true,
              resolutionWidth: true,
              resolutionHeight: true,
            },
          }),
          db.wallpaper.findMany({
            take: 5,
            where: { trending: true },
            orderBy: { trendingScore: "desc" },
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnailUrl: true,
              downloads: true,
              views: true,
              trendingScore: true,
            },
          }),
        ]);

        return NextResponse.json({
          totalWallpapers,
          totalDownloads: aggregates._sum.downloads || 0,
          totalViews: aggregates._sum.views || 0,
          totalCategories: categoriesCount,
          totalCollections: collectionsCount,
          newUploads,
          topDownloaded,
          trendingWallpapers,
        });
      } catch (dbErr) {
        console.warn("DB stats query failed, using static platform stats:", dbErr);
      }
    }

    const fallbackStats = await getPlatformStats();
    return NextResponse.json(fallbackStats);
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

