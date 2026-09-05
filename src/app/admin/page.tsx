import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, isDatabaseConfigured } from "@/lib/db";
import {
  getWallpapers,
  getCategories,
  getCollections,
  getPlatformStats,
} from "@/lib/wallpaper-service";
import { AdminPanel } from "@/components/AdminPanel";

export const revalidate = 0; // Dynamic admin data

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("wallpc_admin_token")?.value || cookieStore.get("wallnet_admin_token")?.value;
  const adminSecret = process.env.ADMIN_SECRET_KEY;

  if (!adminSecret || !token || token !== adminSecret) {
    redirect("/admin/login");
  }

  let stats: any;
  let wallpapers: any[] = [];
  let categories: any[] = [];
  let collections: any[] = [];

  if (isDatabaseConfigured()) {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [
        totalWallpapers,
        totalCategories,
        totalCollections,
        aggregates,
        newUploads,
        dbWallpapers,
        dbCategories,
        dbCollections,
      ] = await Promise.all([
        db.wallpaper.count(),
        db.category.count(),
        db.collection.count(),
        db.wallpaper.aggregate({
          _sum: { downloads: true, views: true },
        }),
        db.wallpaper.count({
          where: { createdAt: { gte: sevenDaysAgo } },
        }),
        db.wallpaper.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
        }),
        db.category.findMany({
          orderBy: { order: "asc" },
        }),
        db.collection.findMany({
          orderBy: { createdAt: "desc" },
        }),
      ]);

      stats = {
        totalWallpapers,
        totalDownloads: aggregates._sum.downloads || 0,
        totalViews: aggregates._sum.views || 0,
        totalCategories,
        totalCollections,
        newUploads,
      };
      wallpapers = dbWallpapers;
      categories = dbCategories;
      collections = dbCollections;
    } catch (err) {
      console.warn("Admin DB load failed, falling back to static service:", err);
    }
  }

  if (!stats) {
    const [platformStats, wpResult, allCategories, allCollections] = await Promise.all([
      getPlatformStats(),
      getWallpapers({ limit: 50, sort: "newest" }),
      getCategories(),
      getCollections(),
    ]);

    stats = {
      totalWallpapers: platformStats.totalWallpapers,
      totalDownloads: platformStats.totalDownloads,
      totalViews: platformStats.totalViews,
      totalCategories: platformStats.totalCategories,
      totalCollections: platformStats.totalCollections,
      newUploads: platformStats.newUploads,
    };
    wallpapers = wpResult.data;
    categories = allCategories;
    collections = allCollections;
  }

  return (
    <AdminPanel
      initialStats={stats}
      initialWallpapers={wallpapers}
      categories={categories}
      collections={collections}
    />
  );
}

