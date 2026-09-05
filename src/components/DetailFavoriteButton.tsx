"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import { WallpaperItem } from "@/lib/types";

export function DetailFavoriteButton({ wallpaper }: { wallpaper: WallpaperItem }) {
  const { isFavorited, toggle } = useFavorites();
  const favorited = isFavorited(wallpaper.id);

  return (
    <button
      onClick={() => toggle(wallpaper)}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
        favorited
          ? "bg-rose-500/10 border-rose-500 text-rose-500 shadow-sm shadow-rose-500/10"
          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121216] text-neutral-700 dark:text-neutral-300 hover:text-rose-500 hover:border-rose-500/40"
      }`}
      title={favorited ? "Remove from favorites" : "Save to device favorites"}
    >
      <Heart className={`w-4 h-4 ${favorited ? "fill-rose-500 text-rose-500" : ""}`} />
      <span>{favorited ? "Favorited" : "Favorite"}</span>
    </button>
  );
}
