import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWallpaperBySlug, getRelatedWallpapers } from "@/lib/wallpaper-service";
import { DownloadDropdown } from "@/components/DownloadDropdown";
import { SetWallpaperModal } from "@/components/SetWallpaperModal";
import { ShareDropdown } from "@/components/ShareDropdown";
import { DetailFavoriteButton } from "@/components/DetailFavoriteButton";
import { WallpaperViewTracker } from "@/components/WallpaperViewTracker";
import { WallpaperGrid } from "@/components/WallpaperGrid";
import { AdSlot } from "@/components/AdSlot";
import {
  formatCount,
  formatResolution,
  getAspectRatio,
  getResolutionBadge,
} from "@/lib/utils";
import {
  generateImageObjectJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/seo";
import { WallpaperItem } from "@/lib/types";
import {
  ChevronRight,
  Eye,
  Download,
  Calendar,
  Layers,
  FileCode,
  HardDrive,
  User,
  Shield,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const wallpaper = await getWallpaperBySlug(slug);

  if (!wallpaper) {
    return {
      title: "Wallpaper Not Found",
    };
  }

  const title = `${wallpaper.title} 4K PC Wallpaper — Download Free`;
  const description =
    wallpaper.description ||
    `Download ${wallpaper.title} in 4K (${wallpaper.resolutionWidth}x${wallpaper.resolutionHeight}) for free with no login required.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: wallpaper.previewUrl || wallpaper.fileUrl,
          width: wallpaper.resolutionWidth,
          height: wallpaper.resolutionHeight,
          alt: wallpaper.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [wallpaper.previewUrl || wallpaper.fileUrl],
    },
    alternates: {
      canonical: `/wallpapers/${wallpaper.slug}`,
    },
  };
}

export default async function WallpaperDetailPage({ params }: Props) {
  const { slug } = await params;

  const wallpaper = await getWallpaperBySlug(slug);

  if (!wallpaper) {
    notFound();
  }

  // Related Wallpapers (same category, excluding current)
  const relatedWallpapers = await getRelatedWallpapers(wallpaper.id, wallpaper.categorySlug, 8);

  const aspectRatio = getAspectRatio(wallpaper.resolutionWidth, wallpaper.resolutionHeight);
  const resolutionLabel = getResolutionBadge(wallpaper.resolutionWidth, wallpaper.resolutionHeight);

  const categoryName = wallpaper.category?.name || "Wallpapers";
  const categorySlug = wallpaper.category?.slug || "all";

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: categoryName, url: `/category/${categorySlug}` },
    {
      name: resolutionLabel,
      url: `/category/${categorySlug}/${wallpaper.resolutionWidth >= 3840 ? "4k" : "1440p"}`,
    },
    { name: wallpaper.title, url: `/wallpapers/${wallpaper.slug}` },
  ];

  const imageJsonLd = generateImageObjectJsonLd(wallpaper as unknown as WallpaperItem);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(wallpaper.createdAt));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <WallpaperViewTracker wallpaperId={wallpaper.id} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumbs"
          className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 overflow-x-auto whitespace-nowrap pb-1"
        >
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.name} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />}
              {i === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[200px] sm:max-w-md">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.url}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {crumb.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Main Content Grid: Preview on Left, Details & Downloads on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: High Definition Wallpaper Preview */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl group">
              <div
                className={`relative w-full ${
                  wallpaper.orientation === "ultrawide"
                    ? "aspect-[21/9]"
                    : "aspect-[16/9]"
                }`}
              >
                <Image
                  src={wallpaper.previewUrl || wallpaper.fileUrl4k || wallpaper.fileUrl}
                  alt={`${wallpaper.title} 4K PC Wallpaper`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              </div>

              {/* Floating badges on preview */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white font-bold text-xs tracking-wider uppercase">
                  {resolutionLabel}
                </span>
                <span className="px-3 py-1 rounded-xl bg-indigo-600/80 backdrop-blur-md text-white font-semibold text-xs">
                  {categoryName}
                </span>
              </div>
            </div>

            {/* Tags under preview */}
            {wallpaper.tags && wallpaper.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 mr-1">
                  Tags:
                </span>
                {wallpaper.tags.map((t: any) => {
                  const tagId = typeof t === "string" ? t : t?.tag?.id || t?.id;
                  const tagName = typeof t === "string" ? t : t?.tag?.name || t?.name;
                  return (
                    <Link
                      key={tagId}
                      href={`/search?q=${encodeURIComponent(tagName)}`}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-850 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-neutral-200/60 dark:border-neutral-800 transition-colors"
                    >
                      #{tagName}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Title, Metadata, Download Buttons */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight leading-snug">
                {wallpaper.title}
              </h1>

              {wallpaper.description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {wallpaper.description}
                </p>
              )}

              {/* Stats pill row */}
              <div className="flex items-center gap-4 text-xs font-medium text-neutral-500 dark:text-neutral-400 pt-1">
                <span className="flex items-center gap-1.5" title="Total Views">
                  <Eye className="w-4 h-4 text-neutral-400" />
                  <strong>{formatCount(wallpaper.views)}</strong> views
                </span>
                <span className="flex items-center gap-1.5" title="Total Downloads">
                  <Download className="w-4 h-4 text-indigo-500" />
                  <strong>{formatCount(wallpaper.downloads)}</strong> downloads
                </span>
              </div>
            </div>

            {/* Instant Download Action Panel */}
            <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] shadow-lg space-y-4">
              <DownloadDropdown
                wallpaperId={wallpaper.id}
                slug={wallpaper.slug}
                width={wallpaper.resolutionWidth}
                height={wallpaper.resolutionHeight}
                fileUrl4k={wallpaper.fileUrl4k}
                fileUrl1440p={wallpaper.fileUrl1440p}
                fileUrl1080p={wallpaper.fileUrl1080p}
                fileUrl={wallpaper.fileUrl}
              />

              {/* Supporting actions: Favorite & Share */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                <DetailFavoriteButton
                  wallpaper={wallpaper as unknown as WallpaperItem}
                />
                <ShareDropdown title={wallpaper.title} />
              </div>
            </div>

            {/* Technical Metadata Table */}
            <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] p-5 space-y-3 text-xs sm:text-sm">
              <h3 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-xs">
                Wallpaper Specifications
              </h3>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-neutral-500 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-neutral-400" />
                    Resolution
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatResolution(wallpaper.resolutionWidth, wallpaper.resolutionHeight)}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-neutral-500 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-neutral-400" />
                    Aspect Ratio
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {aspectRatio}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-neutral-500 flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-neutral-400" />
                    File Format
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {wallpaper.fileType}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-neutral-500 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-neutral-400" />
                    File Size
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {wallpaper.fileSize}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-neutral-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    Added On
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {formattedDate}
                  </span>
                </div>

                {wallpaper.creatorName && (
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-neutral-500 flex items-center gap-2">
                      <User className="w-4 h-4 text-neutral-400" />
                      Creator
                    </span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {wallpaper.creatorUrl ? (
                        <a
                          href={wallpaper.creatorUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-indigo-500 flex items-center gap-1"
                        >
                          {wallpaper.creatorName}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        wallpaper.creatorName
                      )}
                    </span>
                  </div>
                )}

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-neutral-500 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    License
                  </span>
                  <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
                    {wallpaper.license || "Free personal desktop use"}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Set Guide */}
            <SetWallpaperModal />
          </div>
        </div>

        {/* Optional Non-intrusive Ad Slot */}
        <AdSlot format="banner" />

        {/* You May Also Like / Related Wallpapers */}
        {relatedWallpapers.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                  More in {categoryName}
                </span>
                <h2 className="text-2xl font-black text-neutral-950 dark:text-white tracking-tight">
                  You May Also Like
                </h2>
              </div>
              <Link
                href={`/category/${categorySlug}`}
                className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
              >
                View all in {categoryName} →
              </Link>
            </div>

            <WallpaperGrid
              wallpapers={relatedWallpapers as unknown as WallpaperItem[]}
              priorityCount={0}
            />
          </section>
        )}
      </div>
    </>
  );
}
