import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getCategories } from "@/lib/wallpaper-service";
import { WallpaperExplorer } from "@/components/WallpaperExplorer";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "Category Not Found" };
  }

  const title = `Free 4K ${category.name} Wallpapers for PC — No Login Required`;
  const description = `Explore free 4K ${category.name.toLowerCase()} wallpapers for your desktop. Download high-resolution artwork, backgrounds and ultra HD scenes.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: category.coverImage, width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;

  const [category, allCategories] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
  ]);

  if (!category) {
    notFound();
  }

  const resolutionLinks = [
    { label: "4K (3840×2160)", href: `/category/${category.slug}/4k` },
    { label: "1440p (2560×1440)", href: `/category/${category.slug}/1440p` },
    { label: "1080p (1920×1080)", href: `/category/${category.slug}/1080p` },
    { label: "Ultrawide (21:9)", href: `/category/${category.slug}/ultrawide` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-500">
        <Link href="/" className="hover:text-indigo-500 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <Link href="/wallpapers" className="hover:text-indigo-500 transition-colors">
          Categories
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {category.name}
        </span>
      </nav>

      {/* Category Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-10 shadow-xl">
        <Image
          src={category.coverImage}
          alt={category.name}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Category • {category._count?.wallpapers ?? category.wallpaperCount ?? 0} Wallpapers</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Free 4K {category.name} Wallpapers
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
            {category.description} Browse high-resolution desktop backgrounds in crisp 3840×2160 quality without any login or accounts required.
          </p>

          {/* Quick Resolution Navigation for SEO */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-neutral-400 font-semibold mr-1">
              Filter by resolution:
            </span>
            {resolutionLinks.map((res) => (
              <Link
                key={res.label}
                href={res.href}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-black/50 hover:bg-indigo-600/80 text-white border border-white/20 transition-all backdrop-blur-md"
              >
                {res.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Wallpapers Explorer locked to this category */}
      <WallpaperExplorer
        initialCategory={category.slug}
        categories={allCategories}
        fixedCategory={category.slug}
      />
    </div>
  );
}
