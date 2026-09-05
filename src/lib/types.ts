export interface WallpaperItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  resolutionWidth: number;
  resolutionHeight: number;
  orientation: string;
  fileUrl: string;
  fileUrl4k: string | null;
  fileUrl1440p: string | null;
  fileUrl1080p: string | null;
  thumbnailUrl: string;
  previewUrl: string;
  fileType: string;
  fileSize: string;
  views: number;
  downloads: number;
  trendingScore: number;
  featured: boolean;
  trending: boolean;
  published: boolean;
  creatorName: string | null;
  creatorUrl: string | null;
  sourceUrl: string | null;
  license: string | null;
  createdAt: string | Date;
  tags?: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
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
