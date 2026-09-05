import { Metadata } from "next";
import { getCategories } from "@/lib/wallpaper-service";
import { WallpaperExplorer } from "@/components/WallpaperExplorer";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Latest 4K Wallpapers — Fresh Desktop Backgrounds",
  description:
    "Explore the newest 4K and ultrawide wallpaper additions on WallPC. Fresh desktop art uploaded daily with instant free downloads.",
};

export const revalidate = 60;

export default async function LatestPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
              Fresh Additions
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
              Fresh From WallPC
            </h1>
          </div>
        </div>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
          The newest high-resolution desktop wallpapers added to our curated catalog.
        </p>
      </div>

      <WallpaperExplorer
        initialSort="newest"
        categories={categories}
      />
    </div>
  );
}
