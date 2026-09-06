"use client";

import { useState } from "react";
import { Download, Check } from "lucide-react";
import { triggerWallpaperDownload } from "@/lib/analytics";
import confetti from "canvas-confetti";

interface DownloadDropdownProps {
  wallpaperId: string;
  slug: string;
  width: number;
  height: number;
  fileUrl4k?: string | null;
  fileUrl1440p?: string | null;
  fileUrl1080p?: string | null;
  fileUrl: string;
}

export function DownloadDropdown({
  wallpaperId,
  slug,
  width,
  height,
  fileUrl4k,
  fileUrl1440p,
  fileUrl1080p,
  fileUrl,
}: DownloadDropdownProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<string | null>(null);

  const isDualOrUltrawide = width >= 5120;
  const is4KOrHigher = width >= 3840;
  const is1440pOrHigher = width >= 2560;

  const triggerDownload = async (
    res: string,
    customUrl?: string | null
  ) => {
    setDownloading(res);
    try {
      await triggerWallpaperDownload(
        wallpaperId,
        res,
        customUrl || fileUrl,
        `${slug}-${res}-wallpaper.webp`
      );

      setDownloaded(res);

      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#6366f1", "#a855f7", "#06b6d4"],
        });
      } catch {
        // Confetti optional
      }

      setTimeout(() => setDownloaded(null), 3000);
    } finally {
      setDownloading(null);
    }
  };

  const getPrimaryLabel = () => {
    if (isDualOrUltrawide) return `Download Original (${width}×${height})`;
    if (is4KOrHigher) return `Download 4K Ultra HD (${width}×${height})`;
    if (is1440pOrHigher) return `Download 1440p QHD (${width}×${height})`;
    return `Download 1080p Full HD (${width}×${height})`;
  };

  const primaryKey = is4KOrHigher ? "4k" : is1440pOrHigher ? "1440p" : "1080p";

  return (
    <div className="space-y-3">
      {/* Primary Resolution Download Button */}
      <button
        onClick={() => triggerDownload(primaryKey, fileUrl4k || fileUrl)}
        disabled={downloading !== null}
        className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-xl ${
          downloaded === primaryKey
            ? "bg-emerald-500 text-white shadow-emerald-500/25 scale-[1.01]"
            : "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-[0.99]"
        }`}
      >
        {downloaded === primaryKey ? (
          <>
            <Check className="w-5 h-5" />
            <span>Wallpaper Downloaded!</span>
          </>
        ) : (
          <>
            <Download
              className={`w-5 h-5 ${downloading === primaryKey ? "animate-bounce" : ""}`}
            />
            <span>
              {downloading === primaryKey ? "Downloading Wallpaper..." : getPrimaryLabel()}
            </span>
          </>
        )}
      </button>

      {/* Supporting Downscaled Variants (Only genuinely smaller resolutions, no fake upscaling) */}
      <div className="grid grid-cols-2 gap-2.5">
        {is4KOrHigher && (
          <button
            onClick={() => triggerDownload("1440p", fileUrl1440p || fileUrl)}
            disabled={downloading !== null}
            className="py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/80 dark:bg-neutral-900/60 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-2 transition-colors"
          >
            {downloaded === "1440p" ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Download className="w-4 h-4 text-indigo-500" />
            )}
            <span>Download 1440p</span>
          </button>
        )}

        {is1440pOrHigher && (
          <button
            onClick={() => triggerDownload("1080p", fileUrl1080p || fileUrl)}
            disabled={downloading !== null}
            className={`py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/80 dark:bg-neutral-900/60 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-2 transition-colors ${
              !is4KOrHigher ? "col-span-2" : ""
            }`}
          >
            {downloaded === "1080p" ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Download className="w-4 h-4 text-indigo-500" />
            )}
            <span>Download 1080p</span>
          </button>
        )}
      </div>

      <p className="text-[11px] text-center text-neutral-500 dark:text-neutral-400">
        Free direct download • No email, signup, or countdown required
      </p>
    </div>
  );
}

