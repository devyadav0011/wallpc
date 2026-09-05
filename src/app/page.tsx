import Link from "next/link";
import Image from "next/image";
import {
  getCategories,
  getTrendingWallpapers,
  getLatestWallpapers,
  getFeaturedCollections,
} from "@/lib/wallpaper-service";
import { WallpaperGrid } from "@/components/WallpaperGrid";
import {
  Search,
  Sparkles,
  Flame,
  Clock,
  Layers,
  ArrowRight,
  Monitor,
  ShieldCheck,
  Zap,
  Maximize,
  Compass,
} from "lucide-react";
import { WallpaperItem } from "@/lib/types";

export const revalidate = 60; // Revalidate page every 60 seconds

export default async function HomePage() {
  const [categories, trendingWallpapers, latestWallpapers, collections] =
    await Promise.all([
      getCategories(),
      getTrendingWallpapers(10),
      getLatestWallpapers(10),
      getFeaturedCollections(6),
    ]);

  const quickSearchPills = [
    "Cyberpunk",
    "Anime",
    "Cars",
    "Dark 4K",
    "Nature",
    "Gaming",
    "Space",
    "Ultrawide",
  ];

  const monitorResolutions = [
    {
      title: "4K UHD",
      res: "3840 × 2160",
      ratio: "16:9 Standard",
      href: "/resolution/4k",
      desc: "Pixel-dense clarity for standard 4K displays",
      bgGradient: "from-indigo-600/30 to-purple-600/30",
    },
    {
      title: "1440p QHD",
      res: "2560 × 1440",
      ratio: "16:9 High Refresh",
      href: "/resolution/1440p",
      desc: "Fast, competitive esport desktop backdrops",
      bgGradient: "from-blue-600/30 to-cyan-600/30",
    },
    {
      title: "Ultrawide 21:9",
      res: "3440 × 1440",
      ratio: "21:9 Curved",
      href: "/resolution/ultrawide",
      desc: "Expansive panoramic frames for curved panels",
      bgGradient: "from-emerald-600/30 to-teal-600/30",
    },
    {
      title: "Super Ultrawide 32:9",
      res: "5120 × 1440",
      ratio: "32:9 Dual 1440p",
      href: "/resolution/ultrawide",
      desc: "Seamless span across dual monitor setups",
      bgGradient: "from-fuchsia-600/30 to-rose-600/30",
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-neutral-200 dark:border-neutral-850">
        {/* Subtle background collage / lighting effect */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/15 dark:bg-indigo-600/15 blur-[120px] rounded-full" />
          <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-purple-500/10 dark:bg-purple-600/10 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-8">
          {/* Trust line badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-50/80 dark:bg-indigo-950/40 backdrop-blur-md text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Free • 4K Quality • No Account Required</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-neutral-950 dark:text-white leading-[1.1]">
            4K Wallpapers.
            <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              No Login. Just Download.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Discover stunning wallpapers for your PC — from gaming and anime to cars, nature, minimal and more.
          </p>

          {/* Large Hero Search Box */}
          <div className="max-w-2xl mx-auto pt-2">
            <form
              action="/search"
              method="GET"
              className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-750 bg-white/95 dark:bg-[#111116]/95 backdrop-blur-xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all"
            >
              <div className="pl-4 sm:pl-5 text-neutral-400">
                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <input
                type="text"
                name="q"
                placeholder="Search wallpapers, categories, styles..."
                className="w-full py-4 sm:py-5 px-3 sm:px-4 bg-transparent text-sm sm:text-base text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none"
              />
              <div className="pr-2 sm:pr-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 sm:py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/30 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick Search Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4">
              <span className="text-xs text-neutral-400 dark:text-neutral-500 mr-1 font-medium">
                Try:
              </span>
              {quickSearchPills.map((pill) => (
                <Link
                  key={pill}
                  href={`/search?q=${encodeURIComponent(pill)}`}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-neutral-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-neutral-200/60 dark:border-neutral-750 transition-colors"
                >
                  {pill}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-20">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
              Browse by Theme
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight mt-1">
              Explore Categories
            </h2>
          </div>
          <Link
            href="/wallpapers"
            className="group hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
          >
            <span>Browse All Wallpapers</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category Cards Carousel / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 hover:border-indigo-500/50 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <Image
                src={category.coverImage}
                alt={`${category.name} 4K Wallpapers`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out brightness-90 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-3 sm:p-4 flex flex-col justify-end text-white">
                <span className="font-bold text-sm sm:text-base group-hover:text-indigo-300 transition-colors line-clamp-1">
                  {category.name}
                </span>
                <span className="text-[11px] text-neutral-300">
                  {category._count?.wallpapers || 0} wallpapers
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. TRENDING NOW SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
                Most Popular Today
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
                Trending Now
              </h2>
            </div>
          </div>
          <Link
            href="/trending"
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
          >
            <span>View All Trending</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <WallpaperGrid
          wallpapers={trendingWallpapers as unknown as WallpaperItem[]}
          priorityCount={4}
        />
      </section>

      {/* 4. MADE FOR YOUR MONITOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
            Pixel Perfect Fit
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight mt-1">
            Made for Your Monitor
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {monitorResolutions.map((mon) => (
            <Link
              key={mon.title}
              href={mon.href}
              className="group p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] hover:border-indigo-500/50 dark:hover:border-indigo-500/40 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${mon.bgGradient} blur-2xl -z-10 group-hover:scale-150 transition-transform`}
              />
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-200">
                  <Monitor className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  {mon.ratio}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white group-hover:text-indigo-500 transition-colors">
                {mon.title}
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
                {mon.res}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {mon.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. FRESH FROM WALLPC (LATEST) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                New Additions
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
                Fresh From WallPC
              </h2>
            </div>
          </div>
          <Link
            href="/latest"
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
          >
            <span>View All Fresh</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <WallpaperGrid
          wallpapers={latestWallpapers as unknown as WallpaperItem[]}
        />
      </section>

      {/* 6. POPULAR COLLECTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-500">
                Handcrafted Packs
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
                Popular Collections
              </h2>
            </div>
          </div>
          <Link
            href="/collections"
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {collections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group relative rounded-3xl overflow-hidden aspect-[16/9] bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 shadow-md hover:shadow-2xl transition-all duration-300"
            >
              <Image
                src={col.coverImage}
                alt={col.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out brightness-75 group-hover:brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 sm:p-6 flex flex-col justify-end text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                  {col._count?.wallpapers || 0} Wallpapers
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-indigo-200 transition-colors">
                  {col.name}
                </h3>
                <p className="text-xs text-neutral-300 line-clamp-2 mt-1 font-normal leading-relaxed">
                  {col.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. FAST CTA BANNER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-neutral-900 border border-indigo-500/30 text-center space-y-6 shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Upgrade Your Desktop?
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              No registration forms. No email collections. No download limits. Instant high-resolution wallpapers at your fingertips.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/wallpapers"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-neutral-950 font-bold text-sm shadow-xl hover:bg-neutral-100 active:scale-95 transition-all"
            >
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Explore 4K Wallpapers</span>
            </Link>
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-md border border-white/20 transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>Browse Collections</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
