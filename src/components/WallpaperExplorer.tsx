"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { WallpaperItem, SortFilter } from "@/lib/types";
import { FilterBar } from "./FilterBar";
import { WallpaperGrid } from "./WallpaperGrid";
import { Loader2, ArrowDown } from "lucide-react";

interface WallpaperExplorerProps {
  initialQuery?: string;
  initialCategory?: string;
  initialResolution?: string;
  initialOrientation?: string;
  initialSort?: SortFilter;
  categories: Array<{ id: string; name: string; slug: string }>;
  fixedCategory?: string; // If locked to category page
  fixedResolution?: string; // If locked to resolution page
}

export function WallpaperExplorer({
  initialQuery = "",
  initialCategory = "all",
  initialResolution = "all",
  initialOrientation = "all",
  initialSort = "trending",
  categories,
  fixedCategory,
  fixedResolution,
}: WallpaperExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(fixedCategory || initialCategory);
  const [resolution, setResolution] = useState(fixedResolution || initialResolution);
  const [orientation, setOrientation] = useState(initialOrientation);
  const [sort, setSort] = useState<SortFilter>(initialSort);
  const [query, setQuery] = useState(initialQuery);

  const [wallpapers, setWallpapers] = useState<WallpaperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchWallpapers = useCallback(
    async (
      pageNum: number,
      isLoadMore = false,
      customCat = category,
      customRes = resolution,
      customOri = orientation,
      customSort = sort,
      customQuery = query
    ) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams();
        if (customQuery) params.set("query", customQuery);
        if (customCat && customCat !== "all") params.set("category", customCat);
        if (customRes && customRes !== "all") params.set("resolution", customRes);
        if (customOri && customOri !== "all") params.set("orientation", customOri);
        params.set("sort", customSort);
        params.set("page", pageNum.toString());
        params.set("limit", "24");

        const res = await fetch(`/api/wallpapers?${params.toString()}`);
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();

        if (isLoadMore) {
          setWallpapers((prev) => [...prev, ...data.wallpapers]);
        } else {
          setWallpapers(data.wallpapers);
        }

        setTotalCount(data.total);
        setHasMore(data.hasMore);
        setPage(pageNum);
      } catch (err) {
        console.error("Failed to load wallpapers:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [category, resolution, orientation, sort, query]
  );

  // Initial load
  useEffect(() => {
    fetchWallpapers(1, false, category, resolution, orientation, sort, query);
  }, []); // Run on mount

  const handleCategoryChange = (newCat: string) => {
    if (fixedCategory) return;
    setCategory(newCat);
    fetchWallpapers(1, false, newCat, resolution, orientation, sort, query);
  };

  const handleResolutionChange = (newRes: string) => {
    if (fixedResolution) return;
    setResolution(newRes);
    fetchWallpapers(1, false, category, newRes, orientation, sort, query);
  };

  const handleOrientationChange = (newOri: string) => {
    setOrientation(newOri);
    fetchWallpapers(1, false, category, resolution, newOri, sort, query);
  };

  const handleSortChange = (newSort: SortFilter) => {
    setSort(newSort);
    fetchWallpapers(1, false, category, resolution, orientation, newSort, query);
  };

  const handleResetFilters = () => {
    const nextCat = fixedCategory || "all";
    const nextRes = fixedResolution || "all";
    const nextOri = "all";
    const nextSort: SortFilter = "trending";
    const nextQuery = "";

    setCategory(nextCat);
    setResolution(nextRes);
    setOrientation(nextOri);
    setSort(nextSort);
    setQuery(nextQuery);

    fetchWallpapers(1, false, nextCat, nextRes, nextOri, nextSort, nextQuery);
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    fetchWallpapers(page + 1, true);
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <FilterBar
        selectedCategory={category}
        onCategoryChange={handleCategoryChange}
        selectedResolution={resolution}
        onResolutionChange={handleResolutionChange}
        selectedOrientation={orientation}
        onOrientationChange={handleOrientationChange}
        selectedSort={sort}
        onSortChange={handleSortChange}
        categories={categories}
        onReset={handleResetFilters}
      />

      {/* Results Count & Current Filter Summary */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 px-1">
        <span>
          Showing <strong className="text-neutral-900 dark:text-neutral-100">{wallpapers.length}</strong> of{" "}
          <strong className="text-neutral-900 dark:text-neutral-100">{totalCount}</strong> wallpapers
        </span>
      </div>

      {/* Wallpaper Grid */}
      <WallpaperGrid
        wallpapers={wallpapers}
        loading={loading}
        onResetFilters={handleResetFilters}
      />

      {/* Load More Button / Cursor pagination */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-8 pb-4">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 font-bold text-sm text-neutral-900 dark:text-neutral-100 transition-all active:scale-95 shadow-sm"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Loading More 4K Wallpapers...</span>
              </>
            ) : (
              <>
                <ArrowDown className="w-4 h-4 text-indigo-500" />
                <span>Load More Wallpapers</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
