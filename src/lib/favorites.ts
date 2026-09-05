"use client";

import { useState, useEffect, useCallback } from "react";
import { WallpaperItem } from "./types";

const FAVORITES_KEY = "wallpc_local_favorites_v1";
const LEGACY_FAVORITES_KEY = "wallnet_local_favorites_v1";
const FAVORITES_EVENT = "wallpc_favorites_updated";

export function getLocalFavorites(): WallpaperItem[] {
  if (typeof window === "undefined") return [];
  try {
    let raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) {
      // Check and migrate legacy favorites if present
      const legacyRaw = window.localStorage.getItem(LEGACY_FAVORITES_KEY);
      if (legacyRaw) {
        window.localStorage.setItem(FAVORITES_KEY, legacyRaw);
        window.localStorage.removeItem(LEGACY_FAVORITES_KEY);
        raw = legacyRaw;
      }
    }
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Could not read local favorites from storage:", err);
    return [];
  }
}

export function isWallpaperFavorited(id: string): boolean {
  const favorites = getLocalFavorites();
  return favorites.some((item) => item.id === id);
}

export function toggleLocalFavorite(wallpaper: WallpaperItem): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getLocalFavorites();
    const index = current.findIndex((item) => item.id === wallpaper.id);
    let next: WallpaperItem[];
    let isNowFavorited = false;

    if (index >= 0) {
      next = current.filter((item) => item.id !== wallpaper.id);
      isNowFavorited = false;
    } else {
      next = [wallpaper, ...current];
      isNowFavorited = true;
    }

    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(FAVORITES_EVENT));
    return isNowFavorited;
  } catch (err) {
    console.warn("Could not save favorite to localStorage:", err);
    return false;
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<WallpaperItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(() => {
    setFavorites(getLocalFavorites());
  }, []);

  useEffect(() => {
    setMounted(true);
    refresh();

    const handleUpdate = () => refresh();
    window.addEventListener(FAVORITES_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [refresh]);

  const toggle = useCallback((wallpaper: WallpaperItem) => {
    return toggleLocalFavorite(wallpaper);
  }, []);

  const isFavorited = useCallback(
    (id: string) => {
      return favorites.some((w) => w.id === id);
    },
    [favorites]
  );

  return {
    favorites,
    isFavorited,
    toggle,
    mounted,
    count: favorites.length,
  };
}
