"use client";

import Link from "next/link";
import { WallpaperItem, NormalizedWallpaper } from "@/lib/types";
import { WallpaperCard } from "./WallpaperCard";
import { SearchX, RotateCcw, Compass } from "lucide-react";

interface WallpaperGridProps {
  wallpapers: (WallpaperItem | NormalizedWallpaper)[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
  priorityCount?: number;
}

export function WallpaperGrid({
  wallpapers,
  loading = false,
  emptyTitle = "No wallpapers found",
  emptyDescription = "Try adjusting your search terms or clearing selected filters to find more wallpapers.",
  onResetFilters,
  priorityCount = 4,
}: WallpaperGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 animate-pulse"
          >
            <div className="aspect-[16/9] w-full bg-neutral-200 dark:bg-neutral-800" />
            <div className="p-3.5 space-y-2.5">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-md w-3/4" />
              <div className="flex justify-between">
                <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
                <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (wallpapers.length === 0) {
    return (
      <div className="py-16 sm:py-24 px-4 text-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20 max-w-xl mx-auto my-8">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-200/60 dark:bg-neutral-800/60 flex items-center justify-center text-neutral-500 mb-4">
          <SearchX className="w-7 h-7" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {emptyTitle}
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
          {emptyDescription}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {onResetFilters && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
          )}
          <Link
            href="/wallpapers"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-sm font-semibold transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Browse All Wallpapers</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5">
      {wallpapers.map((wallpaper, idx) => (
        <WallpaperCard
          key={wallpaper.id}
          wallpaper={wallpaper}
          priority={idx < priorityCount}
        />
      ))}
    </div>
  );
}
