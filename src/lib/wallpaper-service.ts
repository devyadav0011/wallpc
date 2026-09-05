import {
  Wallpaper,
  Category,
  Collection,
  WallpaperFilterOptions,
  PaginatedResult,
} from "@/types";
import { WallpaperItem, CategoryItem, CollectionItem } from "@/lib/types";
import { WALLPAPERS } from "@/data/wallpapers";
import { CATEGORIES } from "@/data/categories";
import { COLLECTIONS } from "@/data/collections";

export type FullWallpaper = Omit<WallpaperItem, "category"> & {
  category: {
    id: string;
    name: string;
    slug: string;
  };
  width: number;
  height: number;
  resolution: string;
  image: string;
  thumbnail: string;
  categorySlug: string;
  collectionSlugs?: string[];
  [key: string]: any;
};

export type FullCategory = CategoryItem & Category;
export type FullCollection = CollectionItem & Collection;

// In-memory / dynamic store for demo session mutations
let wallpapersStore = [...WALLPAPERS];
let categoriesStore = [...CATEGORIES];
let collectionsStore = [...COLLECTIONS];

export function formatWallpaperToItem(w: Wallpaper): FullWallpaper {
  const tagsList = (w.tags || []).map((t: any) => {
    if (typeof t === "string") {
      return {
        tag: {
          id: t.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          name: t,
          slug: t.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        },
      };
    }
    return t;
  });

  return {
    id: w.id,
    title: w.title,
    slug: w.slug,
    description: w.description || null,
    categoryId: w.categorySlug,
    category: {
      id: w.categorySlug,
      name: w.category,
      slug: w.categorySlug,
    },
    categorySlug: w.categorySlug,
    resolutionWidth: w.width,
    resolutionHeight: w.height,
    width: w.width,
    height: w.height,
    resolution: w.resolution || `${w.width}×${w.height}`,
    orientation: w.orientation,
    fileUrl: w.fileUrl4k || w.image,
    fileUrl4k: w.fileUrl4k || w.image,
    fileUrl1440p: w.fileUrl1440p || null,
    fileUrl1080p: w.fileUrl1080p || null,
    thumbnailUrl: w.thumbnail,
    thumbnail: w.thumbnail,
    previewUrl: w.previewUrl,
    image: w.image,
    fileType: w.fileType || "WEBP",
    fileSize: w.fileSize || "4.2 MB",
    views: w.views || 0,
    downloads: w.downloads || 0,
    trendingScore: w.trendingScore || 0,
    featured: !!w.featured,
    trending: !!w.trending,
    published: true,
    creatorName: w.creatorName || null,
    creatorUrl: w.creatorUrl || null,
    sourceUrl: w.creatorUrl || null,
    license: w.license || "Free for personal desktop use",
    createdAt: w.createdAt,
    tags: tagsList as any,
    collectionSlugs: w.collectionSlugs || [],
  };
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
  return categoriesStore.map((cat) => {
    const count = wallpapersStore.filter(
      (w) => w.categorySlug.toLowerCase() === cat.slug.toLowerCase()
    ).length;
    return formatCategory(cat, count);
  });
}

export async function getCategoryBySlug(slug: string): Promise<FullCategory | null> {
  const cat = categoriesStore.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
  if (!cat) return null;
  const count = wallpapersStore.filter(
    (w) => w.categorySlug.toLowerCase() === cat.slug.toLowerCase()
  ).length;
  return formatCategory(cat, count);
}

export async function getCollections(): Promise<FullCollection[]> {
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
  const col = collectionsStore.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
  if (!col) return null;

  const items = wallpapersStore.filter((w) =>
    w.collectionSlugs?.includes(col.slug)
  );

  return {
    collection: formatCollection(col, items.length),
    wallpapers: items.map(formatWallpaperToItem),
  };
}

export async function getWallpaperBySlug(slug: string): Promise<FullWallpaper | null> {
  const item = wallpapersStore.find((w) => w.slug === slug);
  return item ? formatWallpaperToItem(item) : null;
}

export async function getWallpaperById(id: string): Promise<FullWallpaper | null> {
  const item = wallpapersStore.find((w) => w.id === id);
  return item ? formatWallpaperToItem(item) : null;
}

export async function getTrendingWallpapers(limit = 10): Promise<FullWallpaper[]> {
  return [...wallpapersStore]
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit)
    .map(formatWallpaperToItem);
}

export async function getLatestWallpapers(limit = 10): Promise<FullWallpaper[]> {
  return [...wallpapersStore]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map(formatWallpaperToItem);
}

export async function getPopularWallpapers(limit = 10): Promise<FullWallpaper[]> {
  return [...wallpapersStore]
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, limit)
    .map(formatWallpaperToItem);
}

export async function getRelatedWallpapers(
  currentId: string,
  categorySlug: string,
  limit = 8
): Promise<FullWallpaper[]> {
  return wallpapersStore
    .filter((w) => w.id !== currentId && w.categorySlug.toLowerCase() === categorySlug.toLowerCase())
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, limit)
    .map(formatWallpaperToItem);
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

  let filtered = [...wallpapersStore];

  // 1. Text Search
  if (query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q) ||
        (Array.isArray(w.tags) &&
          w.tags.some((t) =>
            typeof t === "string"
              ? t.toLowerCase().includes(q)
              : (t as any)?.tag?.name?.toLowerCase().includes(q)
          ))
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
    // Trending default
    filtered.sort((a, b) => b.trendingScore - a.trendingScore);
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedData = filtered.slice(offset, offset + limit).map(formatWallpaperToItem);

  return {
    data: paginatedData,
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  };
}

export async function incrementDownloads(id: string): Promise<boolean> {
  const item = wallpapersStore.find((w) => w.id === id);
  if (item) {
    item.downloads += 1;
    item.trendingScore += 3;
    return true;
  }
  return false;
}

export async function incrementViews(id: string): Promise<boolean> {
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
    .slice(0, 5)
    .map(formatWallpaperToItem);
  const trendingWallpapers = [...wallpapersStore]
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, 5)
    .map(formatWallpaperToItem);

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

