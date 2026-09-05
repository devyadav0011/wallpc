import { Metadata } from "next";
import { getCategories } from "@/lib/wallpaper-service";
import { WallpaperExplorer } from "@/components/WallpaperExplorer";
import Link from "next/link";
import { ChevronRight, Monitor, Sparkles } from "lucide-react";

interface Props {
  params: Promise<{ resolution: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { resolution } = await params;
  const normalized = resolution.toLowerCase();

  const title =
    normalized === "4k" || normalized === "3840x2160"
      ? "4K Wallpapers for PC — 3840×2160 Free Download"
      : normalized === "1440p" || normalized === "2560x1440"
      ? "1440p QHD Wallpapers for PC — 2560×1440 Free Download"
      : normalized === "1080p" || normalized === "1920x1080"
      ? "1080p Full HD Wallpapers for PC — 1920×1080 Free Download"
      : normalized === "ultrawide"
      ? "Ultrawide Wallpapers for PC — 21:9 & 32:9 Free Download"
      : `${resolution.toUpperCase()} Wallpapers for PC — Free Download`;

  const description = `Download free ${resolution} desktop wallpapers for your PC. Crisp high-resolution backgrounds with zero login or signup required.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/resolution/${resolution}`,
    },
  };
}

export default async function ResolutionPage({ params }: Props) {
  const { resolution } = await params;
  const normalized = resolution.toLowerCase();

  const title =
    normalized === "4k" || normalized === "3840x2160"
      ? "4K Wallpapers for PC — 3840×2160"
      : normalized === "1440p" || normalized === "2560x1440"
      ? "1440p QHD Wallpapers for PC — 2560×1440"
      : normalized === "1080p" || normalized === "1920x1080"
      ? "1080p Full HD Wallpapers for PC — 1920×1080"
      : normalized === "ultrawide"
      ? "Ultrawide & Dual Monitor Wallpapers — 21:9 & 32:9"
      : `${resolution.toUpperCase()} PC Wallpapers`;

  const description =
    normalized === "ultrawide"
      ? "Panoramic 21:9 and super-wide 32:9 wallpapers framed specifically for curved ultrawide monitors and dual-screen battlestations."
      : `High-definition ${resolution} wallpapers optimized for high-refresh gaming and creative PC desktops. Instant download with no login.`;

  const allCategories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-500">
        <Link href="/" className="hover:text-indigo-500 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <Link href="/wallpapers" className="hover:text-indigo-500 transition-colors">
          Resolutions
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {resolution.toUpperCase()}
        </span>
      </nav>

      {/* Header */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Monitor className="w-3.5 h-3.5" />
          <span>Monitor Optimization</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
          {title}
        </h1>

        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Wallpaper Explorer with fixed resolution */}
      <WallpaperExplorer
        initialResolution={normalized}
        fixedResolution={normalized}
        categories={allCategories}
      />
    </div>
  );
}
