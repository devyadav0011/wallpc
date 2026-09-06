"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Heart, Eye, ArrowUpRight, Check, Sparkles } from "lucide-react";
import { WallpaperItem, NormalizedWallpaper } from "@/lib/types";
import { formatCount, getResolutionBadge } from "@/lib/utils";
import { useFavorites } from "@/lib/favorites";
import { triggerWallpaperDownload } from "@/lib/analytics";

interface WallpaperCardProps {
  wallpaper: WallpaperItem | NormalizedWallpaper;
  priority?: boolean;
}

export function WallpaperCard({ wallpaper, priority = false }: WallpaperCardProps) {
  const { isFavorited, toggle } = useFavorites();
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(() => {
    return (
      wallpaper.thumbnailUrl ||
      wallpaper.imageUrl ||
      wallpaper.previewUrl ||
      wallpaper.fileUrl ||
      "/wallpapers/fallback.webp"
    );
  });
  const [hasError, setHasError] = useState(false);
  const favorited = isFavorited(wallpaper.id);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (downloading) return;
    setDownloading(true);

    const downloadAsset =
      wallpaper.image4kUrl ||
      wallpaper.imageUrl ||
      wallpaper.fileUrl4k ||
      wallpaper.fileUrl ||
      "/wallpapers/fallback.webp";

    try {
      await triggerWallpaperDownload(
        wallpaper.id,
        "4k",
        downloadAsset,
        `${wallpaper.slug}-4k.webp`
      );
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } finally {
      setDownloading(false);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(wallpaper);
  };

  const isUltrawide =
    wallpaper.orientation === "ultrawide" ||
    wallpaper.resolutionWidth / wallpaper.resolutionHeight >= 2.1;

  return (
    <div
      className={`group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-[#121217] border border-neutral-200/80 dark:border-neutral-800/80 hover:border-indigo-500/50 dark:hover:border-indigo-500/40 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 ${
        isUltrawide ? "col-span-2" : "col-span-1"
      }`}
    >
      {/* Image Thumbnail Container */}
      <Link
        href={`/wallpapers/${wallpaper.slug}`}
        className={`relative w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900 ${
          isUltrawide ? "aspect-[21/9]" : "aspect-[16/9]"
        }`}
      >
        <Image
          src={imgSrc}
          alt={`${wallpaper.title} 4K PC Wallpaper`}
          fill
          sizes={
            isUltrawide
              ? "(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
              : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          }
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          onError={() => {
            if (imgSrc !== "/wallpapers/fallback.webp") {
              setImgSrc("/wallpapers/fallback.webp");
              setHasError(true);
            }
          }}
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 sm:p-4 text-white">
          {/* Top row: Badges & Favorite Heart */}
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-neutral-200">
              {wallpaper.category?.name || "4K"}
            </span>

            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
                favorited
                  ? "bg-rose-500/90 border-rose-400 text-white shadow-lg shadow-rose-500/30"
                  : "bg-black/50 border-white/20 text-white/90 hover:bg-rose-500/80 hover:border-rose-400"
              }`}
              title={favorited ? "Remove from favorites" : "Save to device favorites"}
              aria-label="Favorite wallpaper"
            >
              <Heart
                className={`w-4 h-4 transition-transform active:scale-75 ${
                  favorited ? "fill-current" : ""
                }`}
              />
            </button>
          </div>

          {/* Bottom hover bar: View & Quick 4K Download */}
          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-semibold text-white drop-shadow-sm line-clamp-1">
              {wallpaper.title}
            </h3>

            <div className="flex items-center gap-2 pt-1">
              <span className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-medium text-white transition-colors">
                <span>View Details</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>

              <button
                onClick={handleDownload}
                disabled={downloading}
                className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-md ${
                  downloadSuccess
                    ? "bg-emerald-500 text-white shadow-emerald-500/30"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
                }`}
                title="Instant 4K Download • No Login"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Download className={`w-3.5 h-3.5 ${downloading ? "animate-bounce" : ""}`} />
                    <span>Download 4K</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Always visible Resolution Badge on top-left of image */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 group-hover:opacity-0 transition-opacity">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-black/65 backdrop-blur-md border border-white/15 text-white/95">
            {getResolutionBadge(wallpaper.resolutionWidth, wallpaper.resolutionHeight)}
          </span>
        </div>

        {/* Mobile quick-action heart icon (visible on mobile where hover is absent) */}
        <div className="md:hidden absolute top-2.5 right-2.5">
          <button
            onClick={handleToggleFavorite}
            className={`p-1.5 rounded-lg backdrop-blur-md border ${
              favorited
                ? "bg-rose-500 border-rose-400 text-white"
                : "bg-black/50 border-white/20 text-white/90"
            }`}
            aria-label="Save to favorites"
          >
            <Heart className={`w-3.5 h-3.5 ${favorited ? "fill-current" : ""}`} />
          </button>
        </div>
      </Link>

      {/* Card Info (Visible below thumbnail) */}
      <div className="p-3 sm:p-3.5 flex flex-col justify-between gap-2.5">
        <div>
          <Link
            href={`/wallpapers/${wallpaper.slug}`}
            className="block text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
          >
            {wallpaper.title}
          </Link>

          <div className="flex items-center justify-between gap-2 mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
            <Link
              href={`/category/${wallpaper.category?.slug || "all"}`}
              className="hover:underline hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              {wallpaper.category?.name}
            </Link>

            <span>
              {wallpaper.resolutionWidth} × {wallpaper.resolutionHeight}
            </span>
          </div>
        </div>

        {/* Stats & Direct Download (Particularly prominent for mobile & tablet) */}
        <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800/60">
          <div className="flex items-center gap-3 text-[11px] text-neutral-400 dark:text-neutral-500">
            <span className="flex items-center gap-1" title="Total Views">
              <Eye className="w-3 h-3" />
              {formatCount(wallpaper.views)}
            </span>
            <span className="flex items-center gap-1" title="Total Downloads">
              <Download className="w-3 h-3" />
              {formatCount(wallpaper.downloads)}
            </span>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
              downloadSuccess
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-neutral-100 dark:bg-neutral-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-neutral-200/60 dark:border-neutral-750"
            }`}
            title="Download 4K"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3 h-3" />
                <span>Downloaded</span>
              </>
            ) : (
              <>
                <Download className="w-3 h-3 text-indigo-500" />
                <span>4K</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
