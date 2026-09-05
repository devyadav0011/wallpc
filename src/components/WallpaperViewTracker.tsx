"use client";

import { useEffect } from "react";
import { trackWallpaperView } from "@/lib/analytics";

export function WallpaperViewTracker({ wallpaperId }: { wallpaperId: string }) {
  useEffect(() => {
    trackWallpaperView(wallpaperId);
  }, [wallpaperId]);

  return null;
}
