import { generateSlug } from "./utils";

export interface NormalizedWallpaper {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;          // Canonical high-resolution display URL
  thumbnailUrl: string;      // Canonical optimized grid thumbnail URL
  image4kUrl?: string;       // 4K version if available
  image1440Url?: string;     // 1440p version if available
  image1080Url?: string;     // 1080p version if available
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  categorySlug: string;
  tags: string[];
  width: number;
  height: number;
  resolution: string;
  orientation: "landscape" | "portrait" | "ultrawide";
  fileType: string;
  fileSize: string;
  downloads: number;
  views: number;
  trendingScore: number;
  featured: boolean;
  trending: boolean;
  published: boolean;
  createdAt: string;
  creatorName?: string;
  creatorUrl?: string;
  license?: string;
  collectionSlugs?: string[];

  // Legacy field compatibility aliases
  image: string;
  thumbnail: string;
  previewUrl: string;
  fileUrl: string;
  fileUrl4k?: string;
  fileUrl1440p?: string;
  fileUrl1080p?: string;
  resolutionWidth: number;
  resolutionHeight: number;
  sourceUrl?: string | null;
}

export const FALLBACK_WALLPAPER_IMAGE = "/wallpapers/fallback.webp";

export function isValidImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return false;
  if (
    trimmed.startsWith("file://") ||
    trimmed.startsWith("C:") ||
    trimmed.startsWith("D:") ||
    trimmed.startsWith("blob:")
  ) {
    return false;
  }
  return true;
}

export function normalizeWallpaper(raw: any): NormalizedWallpaper {
  if (!raw) {
    throw new Error("Cannot normalize null or undefined wallpaper");
  }

  // 1. Resolve canonical high-res image URL
  let imageUrl = FALLBACK_WALLPAPER_IMAGE;
  const rawImageCandidates = [
    raw.imageUrl,
    raw.fileUrl4k,
    raw.fileUrl,
    raw.image,
    raw.rawUrl,
    raw.previewUrl,
    raw.thumbnailUrl,
    raw.thumbnail,
  ];

  for (const candidate of rawImageCandidates) {
    if (isValidImageUrl(candidate)) {
      imageUrl = candidate.trim();
      break;
    }
  }

  // 2. Resolve canonical thumbnail URL
  let thumbnailUrl = imageUrl;
  const rawThumbCandidates = [
    raw.thumbnailUrl,
    raw.thumbnail,
    raw.previewUrl,
    raw.fileUrl1080p,
    raw.fileUrl1440p,
    raw.imageUrl,
    raw.fileUrl,
    raw.image,
  ];

  for (const candidate of rawThumbCandidates) {
    if (isValidImageUrl(candidate)) {
      thumbnailUrl = candidate.trim();
      break;
    }
  }

  // 3. Resolve resolution
  const width = parseInt(raw.width || raw.resolutionWidth || "3840", 10);
  const height = parseInt(raw.height || raw.resolutionHeight || "2160", 10);
  const resolution = raw.resolution || `${width}×${height}`;

  // 4. Resolve orientation
  let orientation: "landscape" | "portrait" | "ultrawide" = "landscape";
  if (
    raw.orientation === "ultrawide" ||
    raw.orientation === "portrait" ||
    raw.orientation === "landscape"
  ) {
    orientation = raw.orientation;
  } else {
    const ratio = width / height;
    orientation = ratio >= 2.1 ? "ultrawide" : ratio < 1 ? "portrait" : "landscape";
  }

  // 5. Resolve category
  let categoryName = "General";
  let categorySlug = "general";
  let categoryId = "general";

  if (raw.category && typeof raw.category === "object") {
    categoryName = raw.category.name || "General";
    categorySlug = raw.category.slug || "general";
    categoryId = raw.category.id || categorySlug;
  } else if (typeof raw.category === "string") {
    categoryName = raw.category;
    categorySlug = raw.categorySlug || raw.category.toLowerCase().replace(/[^a-z0-9]/g, "-");
    categoryId = categorySlug;
  } else if (raw.categorySlug) {
    categorySlug = raw.categorySlug;
    categoryName = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
    categoryId = categorySlug;
  }

  // 6. Resolve tags
  let tags: string[] = [];
  if (Array.isArray(raw.tags)) {
    tags = raw.tags
      .map((t: any) => {
        if (typeof t === "string") return t;
        if (t && typeof t === "object") return t.tag?.name || t.name || "";
        return "";
      })
      .filter(Boolean);
  }

  // 7. Resolve slug
  const slug = raw.slug
    ? raw.slug.toLowerCase().trim()
    : raw.title
    ? generateSlug(raw.title)
    : `wallpaper-${raw.id || Date.now()}`;

  const image4kUrl = isValidImageUrl(raw.image4kUrl || raw.fileUrl4k)
    ? raw.image4kUrl || raw.fileUrl4k
    : width >= 3840
    ? imageUrl
    : undefined;
  const image1440Url = isValidImageUrl(raw.image1440Url || raw.fileUrl1440p)
    ? raw.image1440Url || raw.fileUrl1440p
    : undefined;
  const image1080Url = isValidImageUrl(raw.image1080Url || raw.fileUrl1080p)
    ? raw.image1080Url || raw.fileUrl1080p
    : undefined;

  return {
    id: String(raw.id || `wp-${slug}`),
    slug,
    title: raw.title || "Untitled Wallpaper",
    description: raw.description || "",
    imageUrl,
    thumbnailUrl,
    image4kUrl,
    image1440Url,
    image1080Url,
    categoryId,
    category: {
      id: categoryId,
      name: categoryName,
      slug: categorySlug,
    },
    categorySlug,
    tags,
    width,
    height,
    resolution,
    orientation,
    fileType: raw.fileType ? String(raw.fileType).toUpperCase() : "WEBP",
    fileSize: raw.fileSize || "4.8 MB",
    downloads: typeof raw.downloads === "number" ? raw.downloads : 0,
    views: typeof raw.views === "number" ? raw.views : 0,
    trendingScore: typeof raw.trendingScore === "number" ? raw.trendingScore : 0,
    featured: !!raw.featured,
    trending: !!raw.trending,
    published: raw.published !== undefined ? !!raw.published : true,
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
    creatorName: raw.creatorName || undefined,
    creatorUrl: raw.creatorUrl || undefined,
    license: raw.license || "Free for personal desktop use",
    collectionSlugs: Array.isArray(raw.collectionSlugs) ? raw.collectionSlugs : [],

    // Legacy fields
    image: imageUrl,
    thumbnail: thumbnailUrl,
    previewUrl: imageUrl,
    fileUrl: imageUrl,
    fileUrl4k: image4kUrl,
    fileUrl1440p: image1440Url,
    fileUrl1080p: image1080Url,
    resolutionWidth: width,
    resolutionHeight: height,
    sourceUrl: raw.creatorUrl || raw.sourceUrl || null,
  };
}

export interface WallpaperItem extends NormalizedWallpaper {
  categoryId: string;
}


export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  order: number;
  _count?: {
    wallpapers: number;
  };
}

export interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  featured: boolean;
  createdAt: string | Date;
  _count?: {
    wallpapers: number;
  };
}

export type OrientationFilter = "all" | "landscape" | "portrait" | "ultrawide";

export type ResolutionFilter =
  | "all"
  | "3840x2160" // 4K
  | "2560x1440" // 1440p
  | "1920x1080" // 1080p
  | "3440x1440" // Ultrawide 21:9
  | "5120x1440" // Dual / Super Ultrawide 32:9
  | "7680x4320"; // 8K

export type SortFilter = "trending" | "popular" | "newest" | "views";

export interface WallpaperQueryParams {
  query?: string;
  category?: string;
  resolution?: string;
  orientation?: string;
  sort?: SortFilter;
  page?: number;
  limit?: number;
}
