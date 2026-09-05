import { Metadata } from "next";
import { getCategories } from "@/lib/wallpaper-service";
import { WallpaperExplorer } from "@/components/WallpaperExplorer";
import { Flame } from "lucide-react";

export const metadata: Metadata = {
  title: "Trending 4K Wallpapers — Most Popular Today",
  description:
    "Discover what the desktop community is downloading right now. Dynamic trending algorithm measuring real-time downloads and views.",
};

export const revalidate = 60;

export default async function TrendingPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
              Live Popularity
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
              Trending 4K Wallpapers
            </h1>
          </div>
        </div>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
          The most popular wallpapers across WallPC, calculated continuously using recent downloads and community views.
        </p>
      </div>

      <WallpaperExplorer
        initialSort="trending"
        categories={categories}
      />
    </div>
  );
}
