"use client";

// Anonymous, privacy-respecting client analytics helper
function getAnonymousId(): string {
  if (typeof window === "undefined") return "server";
  try {
    const key = "wallpc_anon_id";
    let id = localStorage.getItem(key);
    if (!id) {
      id = "wpc_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return "anon_user";
  }
}

export async function trackWallpaperView(wallpaperId: string) {
  try {
    const anonId = getAnonymousId();
    await fetch(`/api/wallpapers/${wallpaperId}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anonymousId: anonId }),
    });
  } catch {
    // Fail silently without disrupting user experience
  }
}

export async function triggerWallpaperDownload(
  wallpaperId: string,
  resolution: "4k" | "1440p" | "1080p" | string = "4k",
  fallbackUrl?: string,
  filename?: string
) {
  try {
    const anonId = getAnonymousId();
    const endpoint = `/api/wallpapers/${wallpaperId}/download?resolution=${resolution}&anonId=${encodeURIComponent(anonId)}`;

    // Trigger direct browser download
    const link = document.createElement("a");
    link.href = endpoint;
    link.download = filename || `wallpc-${wallpaperId}-${resolution}.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Download trigger failed:", err);
    if (fallbackUrl) {
      window.open(fallbackUrl, "_blank");
    }
  }
}
