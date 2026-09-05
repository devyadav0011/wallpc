import { WallpaperItem } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://wallpc.app";

export function generateWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "WallPC",
    alternateName: "WallPC 4K Wallpapers",
    url: BASE_URL,
    description: "4K Wallpapers. No Login. Just Download. Free high-resolution desktop wallpapers for PC.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateImageObjectJsonLd(wallpaper: WallpaperItem) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: wallpaper.fileUrl4k || wallpaper.fileUrl,
    thumbnailUrl: wallpaper.thumbnailUrl,
    name: wallpaper.title,
    description: wallpaper.description || `${wallpaper.title} 4K PC Wallpaper`,
    width: wallpaper.resolutionWidth,
    height: wallpaper.resolutionHeight,
    encodingFormat: "image/webp",
    creator: {
      "@type": "Person",
      name: wallpaper.creatorName || "WallPC Community",
    },
    license: "https://creativecommons.org/licenses/by/4.0/",
    acquireLicensePage: `${BASE_URL}/wallpapers/${wallpaper.slug}`,
  };
}

export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}
