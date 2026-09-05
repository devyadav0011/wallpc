import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCollectionBySlug } from "@/lib/wallpaper-service";
import { WallpaperGrid } from "@/components/WallpaperGrid";
import { WallpaperItem } from "@/lib/types";
import { Layers, ChevronRight, Sparkles } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCollectionBySlug(slug);

  if (!data) {
    return { title: "Collection Not Found" };
  }

  const { collection } = data;

  return {
    title: `${collection.name} — 4K Curated Collection`,
    description: collection.description,
    openGraph: {
      title: `${collection.name} | WallPC`,
      description: collection.description,
      images: [{ url: collection.coverImage, width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `/collections/${collection.slug}`,
    },
  };
}

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await getCollectionBySlug(slug);

  if (!data) {
    notFound();
  }

  const { collection, wallpapers } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-500">
        <Link href="/" className="hover:text-indigo-500 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <Link href="/collections" className="hover:text-indigo-500 transition-colors">
          Collections
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {collection.name}
        </span>
      </nav>

      {/* Collection Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-10 shadow-xl">
        <Image
          src={collection.coverImage}
          alt={collection.name}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Curated Collection • {wallpapers.length} Wallpapers</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {collection.name}
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
            {collection.description} Every wallpaper in this pack is ready for instant download in 4K resolution without registration.
          </p>
        </div>
      </div>

      {/* Wallpapers Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          <span>
            Showing <strong className="text-neutral-900 dark:text-neutral-100">{wallpapers.length}</strong> hand-curated wallpapers
          </span>
        </div>

        <WallpaperGrid
          wallpapers={wallpapers as unknown as WallpaperItem[]}
          priorityCount={4}
        />
      </div>
    </div>
  );
}
