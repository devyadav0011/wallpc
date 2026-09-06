import {
  Category,
  Collection,
  WallpaperFilterOptions,
  PaginatedResult,
} from "@/types";
import {
  NormalizedWallpaper,
  normalizeWallpaper,
  CategoryItem,
  CollectionItem,
  WallpaperItem,
} from "@/lib/types";
import { WALLPAPERS } from "@/data/wallpapers";
import { CATEGORIES } from "@/data/categories";
import { COLLECTIONS } from "@/data/collections";
import { db, isDatabaseConfigured } from "@/lib/db";

export type FullWallpaper = NormalizedWallpaper;
export type FullCategory = CategoryItem & Category;
export type FullCollection = CollectionItem & Collection;

// Shared singleton stores across Next.js server chunks
const globalRef = globalThis as any;
if (!globalRef.__wallpc_wallpapers_store__) {
  globalRef.__wallpc_wallpapers_store__ = [...WALLPAPERS].map(normalizeWallpaper);
}
if (!globalRef.__wallpc_categories_store__) {
  globalRef.__wallpc_categories_store__ = [...CATEGORIES];
}
if (!globalRef.__wallpc_collections_store__) {
  globalRef.__wallpc_collections_store__ = [...COLLECTIONS];
}

export function getWallpapersStore(): NormalizedWallpaper[] {
  if (!globalRef.__wallpc_wallpapers_store__) {
    globalRef.__wallpc_wallpapers_store__ = [...WALLPAPERS].map(normalizeWallpaper);
  }
  return globalRef.__wallpc_wallpapers_store__;
}

export function getCategoriesStore(): Category[] {
  if (!globalRef.__wallpc_categories_store__) {
    globalRef.__wallpc_categories_store__ = [...CATEGORIES];
  }
  return globalRef.__wallpc_categories_store__;
}

export function getCollectionsStore(): Collection[] {
  if (!globalRef.__wallpc_collections_store__) {
    globalRef.__wallpc_collections_store__ = [...COLLECTIONS];
  }
  return globalRef.__wallpc_collections_store__;
}

let wallpapersStore: NormalizedWallpaper[] = globalRef.__wallpc_wallpapers_store__;
let categoriesStore: Category[] = globalRef.__wallpc_categories_store__;
let collectionsStore: Collection[] = globalRef.__wallpc_collections_store__;

export function formatWallpaperToItem(w: any): NormalizedWallpaper {
  return normalizeWallpaper(w);
}

export function formatCategory(cat: Category, count: number): FullCategory {
  return {
    ...cat,
    wallpaperCount: count,
    _count: {
      wallpapers: count,
    },
  };
}

export function formatCollection(col: Collection, count: number): FullCollection {
  return {
    ...col,
    wallpaperCount: count,
    _count: {
      wallpapers: count,
    },
    createdAt: col.createdAt,
  };
}

export async function getCategories(): Promise<FullCategory[]> {
  if (isDatabaseConfigured()) {
    try {
      const dbCategories = await db.category.findMany({
        orderBy: { order: "asc" },
        include: {
          _count: {
            select: { wallpapers: true },
          },
        },
      });

      if (dbCategories && dbCategories.length > 0) {
        return dbCategories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || "",
          coverImage: c.coverImage,
          order: c.order,
          wallpaperCount: c._count?.wallpapers || 0,
          _count: c._count,
        }));
      }
    } catch (err) {
      console.warn("Database getCategories failed, falling back to static catalog:", err);
    }
  }

  return categoriesStore.map((cat) => {
    const count = wallpapersStore.filter(
      (w) => w.categorySlug.toLowerCase() === cat.slug.toLowerCase()
    ).length;
    return formatCategory(cat, count);
  });
}

export async function getCategoryBySlug(slug: string): Promise<FullCategory | null> {
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();

  if (isDatabaseConfigured()) {
    try {
      const dbCategory = await db.category.findUnique({
        where: { slug: cleanSlug },
        include: {
          _count: {
            select: { wallpapers: true },
          },
        },
      });

      if (dbCategory) {
        return {
          id: dbCategory.id,
          name: dbCategory.name,
          slug: dbCategory.slug,
          description: dbCategory.description || "",
          coverImage: dbCategory.coverImage,
          order: dbCategory.order,
          wallpaperCount: dbCategory._count?.wallpapers || 0,
          _count: dbCategory._count,
        };
      }
    } catch (err) {
      console.warn("Database getCategoryBySlug failed, falling back to static:", err);
    }
  }

  const cat = categoriesStore.find((c) => c.slug.toLowerCase() === cleanSlug);
  if (!cat) return null;
  const count = wallpapersStore.filter(
    (w) => w.categorySlug.toLowerCase() === cat.slug.toLowerCase()
  ).length;
  return formatCategory(cat, count);
}

export async function getCollections(): Promise<FullCollection[]> {
  if (isDatabaseConfigured()) {
    try {
      const dbCollections = await db.collection.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { wallpapers: true },
          },
        },
      });

      if (dbCollections && dbCollections.length > 0) {
        return dbCollections.map((col) => ({
          id: col.id,
          name: col.name,
          slug: col.slug,
          description: col.description || "",
          coverImage: col.coverImage,
          featured: col.featured,
          wallpaperCount: col._count?.wallpapers || 0,
          _count: col._count,
          createdAt: col.createdAt ? new Date(col.createdAt).toISOString() : new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.warn("Database getCollections failed, falling back to static:", err);
    }
  }

  return collectionsStore.map((col) => {
    const count = wallpapersStore.filter((w) =>
      w.collectionSlugs?.includes(col.slug)
    ).length;
    return formatCollection(col, count);
  });
}

export async function getFeaturedCollections(limit = 6): Promise<FullCollection[]> {
  const all = await getCollections();
  return all.filter((c) => c.featured).slice(0, limit);
}

export async function getCollectionBySlug(
  slug: string
): Promise<{ collection: FullCollection; wallpapers: FullWallpaper[] } | null> {
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();

  if (isDatabaseConfigured()) {
    try {
      const dbCol = await db.collection.findUnique({
        where: { slug: cleanSlug },
        include: {
          wallpapers: {
            include: {
              wallpaper: {
                include: { category: true, tags: { include: { tag: true } } },
              },
            },
          },
          _count: {
            select: { wallpapers: true },
          },
        },
      });

      if (dbCol) {
        const wallpapers = dbCol.wallpapers.map((item) =>
          normalizeWallpaper(item.wallpaper)
        );
        return {
          collection: {
            id: dbCol.id,
            name: dbCol.name,
            slug: dbCol.slug,
            description: dbCol.description || "",
            coverImage: dbCol.coverImage,
            featured: dbCol.featured,
            wallpaperCount: wallpapers.length,
            _count: { wallpapers: wallpapers.length },
            createdAt: dbCol.createdAt ? new Date(dbCol.createdAt).toISOString() : new Date().toISOString(),
          },
          wallpapers,
        };
      }
    } catch (err) {
      console.warn("Database getCollectionBySlug failed, falling back to static:", err);
    }
  }

  const col = collectionsStore.find((c) => c.slug.toLowerCase() === cleanSlug);
  if (!col) return null;

  const items = wallpapersStore.filter((w) =>
    w.collectionSlugs?.includes(col.slug)
  );

  return {
    collection: formatCollection(col, items.length),
    wallpapers: items.map(normalizeWallpaper),
  };
}

export async function getWallpaperBySlug(slug: string): Promise<FullWallpaper | null> {
  if (!slug) return null;
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();

  // 1. Try querying Prisma database first if configured
  if (isDatabaseConfigured()) {
    try {
      const dbWallpaper = await db.wallpaper.findFirst({
        where: {
          OR: [
            { slug: cleanSlug },
            { slug: slug.trim() },
            { id: slug.trim() },
          ],
        },
        include: {
          category: true,
          tags: {
            include: { tag: true },
          },
        },
      });

      if (dbWallpaper) {
        return normalizeWallpaper(dbWallpaper);
      }

      // If DB is configured, check if this is an initial static seed wallpaper
      const isStaticSeed = WALLPAPERS.some(
        (s) => s.slug.toLowerCase() === cleanSlug || s.id === slug || s.id === cleanSlug
      );
      if (isStaticSeed) {
        const staticItem = getWallpapersStore().find(
          (w) =>
            w.slug.toLowerCase() === cleanSlug ||
            w.slug === slug ||
            w.id === slug
        );
        return staticItem ? normalizeWallpaper(staticItem) : null;
      }

      // If not in DB and not a static seed wallpaper, it does not exist (or was deleted)
      return null;
    } catch (dbErr) {
      console.warn("DB findFirst by slug failed, checking in-memory catalog store:", dbErr);
    }
  }

  // 2. Query singleton catalog store when database is not configured
  const item = getWallpapersStore().find(
    (w) =>
      w.slug.toLowerCase() === cleanSlug ||
      w.slug === slug ||
      w.id === slug
  );

  return item ? normalizeWallpaper(item) : null;
}

export async function getWallpaperById(id: string): Promise<FullWallpaper | null> {
  return getWallpaperBySlug(id);
}

export async function getWallpapers(
  options: WallpaperFilterOptions = {}
): Promise<PaginatedResult<FullWallpaper>> {
  const {
    query = "",
    category = "all",
    resolution = "all",
    orientation = "all",
    sort = "trending",
    page = 1,
    limit = 24,
  } = options;

  let allWallpapers: FullWallpaper[] = [];

  if (isDatabaseConfigured()) {
    try {
      const dbWallpapers = await db.wallpaper.findMany({
        where: {
          published: true,
        },
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          tags: {
            include: { tag: true },
          },
        },
      });

      if (dbWallpapers && dbWallpapers.length > 0) {
        allWallpapers = dbWallpapers.map(normalizeWallpaper);
      }
    } catch (err) {
      console.warn("Database getWallpapers query failed, falling back to static catalog:", err);
    }
  }

  // Merge static catalog items if database has fewer items or fallback
  if (allWallpapers.length === 0) {
    allWallpapers = wallpapersStore.map(normalizeWallpaper);
  } else {
    const existingSlugs = new Set(allWallpapers.map((w) => w.slug.toLowerCase()));
    for (const item of wallpapersStore) {
      if (!existingSlugs.has(item.slug.toLowerCase())) {
        allWallpapers.push(normalizeWallpaper(item));
      }
    }
  }

  let filtered = allWallpapers;

  // 1. Text Search
  if (query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.category.name.toLowerCase().includes(q) ||
        w.categorySlug.toLowerCase().includes(q) ||
        (Array.isArray(w.tags) && w.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  // 2. Category Filter
  if (category && category !== "all") {
    filtered = filtered.filter(
      (w) => w.categorySlug.toLowerCase() === category.toLowerCase()
    );
  }

  // 3. Orientation Filter
  if (orientation && orientation !== "all") {
    filtered = filtered.filter((w) => w.orientation === orientation);
  }

  // 4. Resolution Filter
  if (resolution && resolution !== "all") {
    const res = resolution.toLowerCase();
    if (res === "4k" || res === "3840x2160") {
      filtered = filtered.filter((w) => w.width >= 3840 && w.height >= 2160);
    } else if (res === "1440p" || res === "2560x1440") {
      filtered = filtered.filter((w) => w.width === 2560 && w.height === 1440);
    } else if (res === "1080p" || res === "1920x1080") {
      filtered = filtered.filter((w) => w.width === 1920 && w.height === 1080);
    } else if (res === "ultrawide" || res === "3440x1440") {
      filtered = filtered.filter(
        (w) => w.orientation === "ultrawide" || w.width / w.height >= 2.1
      );
    } else if (res === "dual-monitor" || res === "5120x1440") {
      filtered = filtered.filter((w) => w.width >= 5120);
    } else if (res === "8k" || res === "7680x4320") {
      filtered = filtered.filter((w) => w.width >= 7680);
    }
  }

  // 5. Sorting
  if (sort === "popular") {
    filtered.sort((a, b) => b.downloads - a.downloads);
  } else if (sort === "newest") {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sort === "views") {
    filtered.sort((a, b) => b.views - a.views);
  } else {
    filtered.sort((a, b) => b.trendingScore - a.trendingScore);
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedData = filtered.slice(offset, offset + limit);

  return {
    data: paginatedData,
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  };
}

export async function getTrendingWallpapers(limit = 10): Promise<FullWallpaper[]> {
  const res = await getWallpapers({ sort: "trending", limit });
  return res.data;
}

export async function getLatestWallpapers(limit = 10): Promise<FullWallpaper[]> {
  const res = await getWallpapers({ sort: "newest", limit });
  return res.data;
}

export async function getPopularWallpapers(limit = 10): Promise<FullWallpaper[]> {
  const res = await getWallpapers({ sort: "popular", limit });
  return res.data;
}

export async function getRelatedWallpapers(
  currentId: string,
  categorySlug: string,
  limit = 8
): Promise<FullWallpaper[]> {
  const res = await getWallpapers({ category: categorySlug, limit: limit + 5 });
  return res.data.filter((w) => w.id !== currentId).slice(0, limit);
}

export async function incrementDownloads(id: string): Promise<boolean> {
  if (isDatabaseConfigured()) {
    try {
      await db.wallpaper.update({
        where: { id },
        data: {
          downloads: { increment: 1 },
          trendingScore: { increment: 3 },
        },
      });
      return true;
    } catch {
      // Fall through to memory
    }
  }

  const item = wallpapersStore.find((w) => w.id === id);
  if (item) {
    item.downloads += 1;
    item.trendingScore += 3;
    return true;
  }
  return false;
}

export async function incrementViews(id: string): Promise<boolean> {
  if (isDatabaseConfigured()) {
    try {
      await db.wallpaper.update({
        where: { id },
        data: {
          views: { increment: 1 },
          trendingScore: { increment: 0.5 },
        },
      });
      return true;
    } catch {
      // Fall through to memory
    }
  }

  const item = wallpapersStore.find((w) => w.id === id);
  if (item) {
    item.views += 1;
    item.trendingScore += 0.5;
    return true;
  }
  return false;
}

export async function getPlatformStats() {
  const totalDownloads = wallpapersStore.reduce((acc, w) => acc + w.downloads, 0);
  const totalViews = wallpapersStore.reduce((acc, w) => acc + w.views, 0);
  const topDownloaded = [...wallpapersStore]
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5);
  const trendingWallpapers = [...wallpapersStore]
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, 5);

  return {
    totalWallpapers: wallpapersStore.length,
    totalDownloads,
    totalViews,
    totalCategories: categoriesStore.length,
    totalCollections: collectionsStore.length,
    newUploads: 8,
    topDownloaded,
    trendingWallpapers,
  };
}

export function addWallpaperToStore(wallpaper: any): FullWallpaper {
  const normalized = normalizeWallpaper(wallpaper);
  const store = getWallpapersStore();
  const cleanId = String(normalized.id || "").toLowerCase();
  const cleanSlug = normalized.slug.toLowerCase();

  for (let i = store.length - 1; i >= 0; i--) {
    if (
      store[i].id.toLowerCase() === cleanId ||
      store[i].slug.toLowerCase() === cleanSlug
    ) {
      store.splice(i, 1);
    }
  }

  store.unshift(normalized);
  return normalized;
}

export function removeWallpaperFromStore(idOrSlug: string): boolean {
  if (!idOrSlug) return false;
  const clean = idOrSlug.toLowerCase().trim();
  const store = getWallpapersStore();
  let removed = false;

  for (let i = store.length - 1; i >= 0; i--) {
    if (
      store[i].id === idOrSlug ||
      store[i].id.toLowerCase() === clean ||
      store[i].slug.toLowerCase() === clean
    ) {
      store.splice(i, 1);
      removed = true;
    }
  }

  return removed;
}

export function updateWallpaperInStore(idOrSlug: string, updates: any): FullWallpaper | null {
  if (!idOrSlug) return null;
  const clean = idOrSlug.toLowerCase().trim();
  const store = getWallpapersStore();
  const item = store.find(
    (w) => w.id === idOrSlug || w.slug.toLowerCase() === clean
  );
  if (!item) return null;

  Object.assign(item, updates);
  return normalizeWallpaper(item);
}
