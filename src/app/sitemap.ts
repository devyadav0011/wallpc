import { MetadataRoute } from "next";
import { getWallpapers, getCategories, getCollections } from "@/lib/wallpaper-service";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://wallpc.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [wallpapersResult, categories, collections] = await Promise.all([
    getWallpapers({ limit: 1000 }),
    getCategories(),
    getCollections(),
  ]);

  const wallpapers = wallpapersResult.data;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/wallpapers`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/trending`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/latest`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/popular`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/collections`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/resolution/4k`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/resolution/1440p`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/resolution/1080p`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/resolution/ultrawide`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/copyright`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.flatMap((cat) => [
    {
      url: `${BASE_URL}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/category/${cat.slug}/4k`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/category/${cat.slug}/ultrawide`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ]);

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((col) => ({
    url: `${BASE_URL}/collections/${col.slug}`,
    lastModified: col.createdAt ? new Date(col.createdAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const wallpaperRoutes: MetadataRoute.Sitemap = wallpapers.map((w) => ({
    url: `${BASE_URL}/wallpapers/${w.slug}`,
    lastModified: w.createdAt ? new Date(w.createdAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...collectionRoutes, ...wallpaperRoutes];
}

