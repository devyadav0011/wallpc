import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCollections } from "@/lib/wallpaper-service";
import { Layers, ArrowRight, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Wallpaper Collections — Curated 4K Packs",
  description:
    "Handpicked 4K wallpaper collections for PC setups: gaming battlestations, dark OLED themes, anime scenery, and ultrawide panoramas.",
};

export const revalidate = 60;

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-500">
              Curated Packs
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
              Wallpaper Collections
            </h1>
          </div>
        </div>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
          Meticulously gathered wallpaper collections organized around specific aesthetics, monitor setups, and moods.
        </p>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((col) => (
          <Link
            key={col.id}
            href={`/collections/${col.slug}`}
            className="group relative rounded-3xl overflow-hidden aspect-[16/10] bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-md hover:shadow-2xl transition-all duration-300"
          >
            <Image
              src={col.coverImage}
              alt={col.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out brightness-75 group-hover:brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-6 flex flex-col justify-end text-white">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  {col._count?.wallpapers ?? col.wallpaperCount ?? 0} Wallpapers
                </span>
                {col.featured && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                    <Sparkles className="w-3 h-3" />
                    Featured
                  </span>
                )}
              </div>

              <h2 className="text-xl font-extrabold text-white group-hover:text-indigo-200 transition-colors">
                {col.name}
              </h2>

              <p className="text-xs text-neutral-300 line-clamp-2 mt-1.5 font-normal leading-relaxed">
                {col.description}
              </p>

              <div className="flex items-center gap-1 text-xs font-semibold text-indigo-300 mt-3 group-hover:translate-x-1 transition-transform">
                <span>View Pack</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
