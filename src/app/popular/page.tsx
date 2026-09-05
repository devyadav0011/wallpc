import { Metadata } from "next";
import { getCategories } from "@/lib/wallpaper-service";
import { WallpaperExplorer } from "@/components/WallpaperExplorer";
import { Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Most Popular 4K Wallpapers — All-Time Favorites",
  description:
    "Browse the all-time most downloaded 4K PC wallpapers on WallPC. Battle-tested community favorites ready to download.",
};

export const revalidate = 60;

export default async function PopularPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
              Community Favorites
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
              Most Downloaded Wallpapers
            </h1>
          </div>
        </div>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
          The all-time greatest desktop wallpapers downloaded tens of thousands of times across the globe.
        </p>
      </div>

      <WallpaperExplorer
        initialSort="popular"
        categories={categories}
      />
    </div>
  );
}
