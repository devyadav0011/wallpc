import { Metadata } from "next";
import { getCategories } from "@/lib/wallpaper-service";
import { WallpaperExplorer } from "@/components/WallpaperExplorer";

export const metadata: Metadata = {
  title: "All 4K Wallpapers — Discover & Download",
  description:
    "Browse our complete catalog of free 4K, 1440p, and ultrawide PC desktop wallpapers. Filter by category, resolution, and orientation with no login required.",
};

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{
    query?: string;
    category?: string;
    resolution?: string;
    orientation?: string;
    sort?: string;
  }>;
}

export default async function WallpapersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.query?.trim() || "";
  const category = params.category?.trim() || "all";
  const resolution = params.resolution?.trim() || "all";
  const orientation = params.orientation?.trim() || "all";
  const sort = params.sort || "trending";

  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
          All Wallpapers
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
          High-resolution 4K and ultrawide wallpapers. Filter by your monitor specifications or favorite styles.
        </p>
      </div>

      {/* Interactive Explorer Client Component */}
      <WallpaperExplorer
        initialQuery={query}
        initialCategory={category}
        initialResolution={resolution}
        initialOrientation={orientation}
        initialSort={sort as any}
        categories={categories}
      />
    </div>
  );
}
