export { type NormalizedWallpaper, normalizeWallpaper, FALLBACK_WALLPAPER_IMAGE } from "@/lib/types";

export interface Wallpaper {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  thumbnail: string;
  previewUrl: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  image4kUrl?: string;
  image1440Url?: string;
  image1080Url?: string;
  fileUrl?: string;
  fileUrl4k: string;
  fileUrl1440p?: string;
  fileUrl1080p?: string;
  category: string;
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
  createdAt: string;
  creatorName?: string;
  creatorUrl?: string;
  license?: string;
  collectionSlugs?: string[];
}


export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  order: number;
  wallpaperCount?: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  featured: boolean;
  wallpaperCount?: number;
  wallpaperSlugs?: string[];
  createdAt: string;
}

export type OrientationFilter = "all" | "landscape" | "portrait" | "ultrawide";

export type ResolutionFilter =
  | "all"
  | "3840x2160"
  | "2560x1440"
  | "1920x1080"
  | "3440x1440"
  | "5120x1440"
  | "7680x4320"
  | "4k"
  | "1440p"
  | "1080p"
  | "ultrawide"
  | "dual-monitor";

export type SortFilter = "trending" | "popular" | "newest" | "views";

export interface WallpaperFilterOptions {
  query?: string;
  category?: string;
  resolution?: string;
  orientation?: string;
  sort?: SortFilter;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}
