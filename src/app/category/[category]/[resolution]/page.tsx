import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getCategories } from "@/lib/wallpaper-service";
import { WallpaperExplorer } from "@/components/WallpaperExplorer";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Sparkles, Monitor } from "lucide-react";

interface Props {
  params: Promise<{
    category: string;
    resolution: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: catSlug, resolution: resSlug } = await params;

  const category = await getCategoryBySlug(catSlug);

  if (!category) {
    return { title: "Category Not Found" };
  }

  const resDisplay =
    resSlug.toLowerCase() === "4k"
      ? "4K (3840×2160)"
      : resSlug.toLowerCase() === "1440p"
      ? "1440p QHD (2560×1440)"
      : resSlug.toLowerCase() === "1080p"
      ? "1080p Full HD"
      : resSlug.toLowerCase() === "ultrawide"
      ? "Ultrawide (21:9 / 32:9)"
      : resSlug.toUpperCase();

  const title = `${resDisplay} ${category.name} Wallpapers for PC — Free Download`;
  const description = `Download free ${resDisplay} ${category.name.toLowerCase()} wallpapers for your desktop setup. No login, no signup, and instant downloads.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/category/${catSlug}/${resSlug}`,
    },
  };
}

export default async function CategoryResolutionPage({ params }: Props) {
  const { category: catSlug, resolution: resSlug } = await params;

  const [category, allCategories] = await Promise.all([
    getCategoryBySlug(catSlug),
    getCategories(),
  ]);

  if (!category) {
    notFound();
  }

  const resDisplay =
    resSlug.toLowerCase() === "4k"
      ? "4K Ultra HD (3840×2160)"
      : resSlug.toLowerCase() === "1440p"
      ? "1440p QHD (2560×1440)"
      : resSlug.toLowerCase() === "1080p"
      ? "1080p Full HD"
      : resSlug.toLowerCase() === "ultrawide"
      ? "Ultrawide 21:9 & 32:9"
      : resSlug.toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-500">
        <Link href="/" className="hover:text-indigo-500 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <Link href={`/category/${category.slug}`} className="hover:text-indigo-500 transition-colors">
          {category.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {resDisplay}
        </span>
      </nav>

      {/* Header Info */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Monitor className="w-3.5 h-3.5" />
          <span>{resDisplay} Resolution</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
          {category.name} Wallpapers in {resDisplay}
        </h1>

        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
          Curated collection of {category.name.toLowerCase()} wallpapers rendered in {resDisplay} quality. Designed specifically for desktop screens, gaming monitors, and high-DPI displays.
        </p>
      </div>

      {/* Wallpaper Explorer with both category and resolution initialized */}
      <WallpaperExplorer
        initialCategory={category.slug}
        initialResolution={resSlug.toLowerCase()}
        categories={allCategories}
        fixedCategory={category.slug}
        fixedResolution={resSlug.toLowerCase()}
      />
    </div>
  );
}
