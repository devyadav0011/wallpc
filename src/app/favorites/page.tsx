"use client";

import { useFavorites } from "@/lib/favorites";
import { WallpaperGrid } from "@/components/WallpaperGrid";
import Link from "next/link";
import { Heart, HardDrive, Trash2, Compass } from "lucide-react";

export default function FavoritesPage() {
  const { favorites, mounted } = useFavorites();

  const handleClearAll = () => {
    if (typeof window !== "undefined" && window.confirm("Clear all favorites from this device?")) {
      window.localStorage.removeItem("wallpc_local_favorites_v1");
      window.localStorage.removeItem("wallnet_local_favorites_v1");
      window.dispatchEvent(new Event("wallpc_favorites_updated"));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Heart className="w-6 h-6 fill-rose-500" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                Device Storage
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
                My Favorites
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            <HardDrive className="w-4 h-4 text-emerald-500" />
            <span>Your favorites are saved locally on this device • No account or login required</span>
          </div>
        </div>

        {mounted && favorites.length > 0 && (
          <button
            onClick={handleClearAll}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-rose-500 hover:border-rose-500/40 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Favorites</span>
          </button>
        )}
      </div>

      {/* Grid or Empty state */}
      {!mounted ? (
        <WallpaperGrid wallpapers={[]} loading={true} />
      ) : favorites.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <Heart className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              No favorites saved yet
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
              Click the heart icon on any wallpaper card or detail page to save it to this device for quick access.
            </p>
          </div>
          <Link
            href="/wallpapers"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Explore 4K Wallpapers</span>
          </Link>
        </div>
      ) : (
        <WallpaperGrid wallpapers={favorites} />
      )}
    </div>
  );
}
