import { Metadata } from "next";
import { getCategories } from "@/lib/wallpaper-service";
import { WallpaperExplorer } from "@/components/WallpaperExplorer";
import { Search } from "lucide-react";

interface Props {
  searchParams: Promise<{
    q?: string;
    category?: string;
    resolution?: string;
    orientation?: string;
    sort?: string;
  }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const title = q ? `Search results for "${q}" — Free 4K Wallpapers` : "Search 4K Wallpapers";

  return {
    title,
    description: `Browse 4K PC wallpapers matching "${q}". Free instant downloads without login.`,
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const category = params.category?.trim() || "all";
  const resolution = params.resolution?.trim() || "all";
  const orientation = params.orientation?.trim() || "all";
  const sort = params.sort || "trending";

  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
              Search Results
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
              {query ? `Results for “${query}”` : "Search WallPC 4K Wallpapers"}
            </h1>
          </div>
        </div>

        {/* In-page search bar */}
        <form
          action="/search"
          method="GET"
          className="max-w-xl flex items-center shadow-md rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all"
        >
          <div className="pl-4 text-neutral-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search wallpapers, anime, cars, styles..."
            className="w-full py-3 px-3 bg-transparent text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none"
          />
          <div className="pr-2">
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Explorer with initial query */}
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
