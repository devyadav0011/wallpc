-- CreateTable
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Wallpaper" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "width" INTEGER NOT NULL DEFAULT 3840,
    "height" INTEGER NOT NULL DEFAULT 2160,
    "resolution" TEXT DEFAULT '3840×2160',
    "resolutionWidth" INTEGER NOT NULL DEFAULT 3840,
    "resolutionHeight" INTEGER NOT NULL DEFAULT 2160,
    "orientation" TEXT NOT NULL DEFAULT 'landscape',
    "imageUrl" TEXT,
    "thumbnailUrl" TEXT NOT NULL,
    "image4kUrl" TEXT,
    "image1440pUrl" TEXT,
    "image1080pUrl" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileUrl4k" TEXT,
    "fileUrl1440p" TEXT,
    "fileUrl1080p" TEXT,
    "previewUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL DEFAULT 'WEBP',
    "fileSize" TEXT NOT NULL DEFAULT '4.2 MB',
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "trendingScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "trending" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "creatorName" TEXT,
    "creatorUrl" TEXT,
    "sourceUrl" TEXT,
    "license" TEXT DEFAULT 'Free for personal desktop use',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wallpaper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "WallpaperTag" (
    "id" TEXT NOT NULL,
    "wallpaperId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "WallpaperTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CollectionWallpaper" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "wallpaperId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CollectionWallpaper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DownloadEvent" (
    "id" TEXT NOT NULL,
    "wallpaperId" TEXT NOT NULL,
    "resolution" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "anonymousIdentifier" TEXT,

    CONSTRAINT "DownloadEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ViewEvent" (
    "id" TEXT NOT NULL,
    "wallpaperId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "anonymousIdentifier" TEXT,

    CONSTRAINT "ViewEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");
CREATE INDEX IF NOT EXISTS "Category_slug_idx" ON "Category"("slug");
CREATE INDEX IF NOT EXISTS "Category_order_idx" ON "Category"("order");

CREATE UNIQUE INDEX IF NOT EXISTS "Wallpaper_slug_key" ON "Wallpaper"("slug");
CREATE INDEX IF NOT EXISTS "Wallpaper_slug_idx" ON "Wallpaper"("slug");
CREATE INDEX IF NOT EXISTS "Wallpaper_categoryId_idx" ON "Wallpaper"("categoryId");
CREATE INDEX IF NOT EXISTS "Wallpaper_orientation_idx" ON "Wallpaper"("orientation");
CREATE INDEX IF NOT EXISTS "Wallpaper_published_idx" ON "Wallpaper"("published");
CREATE INDEX IF NOT EXISTS "Wallpaper_trending_idx" ON "Wallpaper"("trending");
CREATE INDEX IF NOT EXISTS "Wallpaper_featured_idx" ON "Wallpaper"("featured");
CREATE INDEX IF NOT EXISTS "Wallpaper_downloads_idx" ON "Wallpaper"("downloads");
CREATE INDEX IF NOT EXISTS "Wallpaper_views_idx" ON "Wallpaper"("views");
CREATE INDEX IF NOT EXISTS "Wallpaper_trendingScore_idx" ON "Wallpaper"("trendingScore");
CREATE INDEX IF NOT EXISTS "Wallpaper_createdAt_idx" ON "Wallpaper"("createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "Tag_slug_key" ON "Tag"("slug");
CREATE INDEX IF NOT EXISTS "Tag_slug_idx" ON "Tag"("slug");

CREATE UNIQUE INDEX IF NOT EXISTS "WallpaperTag_wallpaperId_tagId_key" ON "WallpaperTag"("wallpaperId", "tagId");

CREATE UNIQUE INDEX IF NOT EXISTS "Collection_slug_key" ON "Collection"("slug");
CREATE INDEX IF NOT EXISTS "Collection_slug_idx" ON "Collection"("slug");
CREATE INDEX IF NOT EXISTS "Collection_featured_idx" ON "Collection"("featured");

CREATE UNIQUE INDEX IF NOT EXISTS "CollectionWallpaper_collectionId_wallpaperId_key" ON "CollectionWallpaper"("collectionId", "wallpaperId");

CREATE INDEX IF NOT EXISTS "DownloadEvent_wallpaperId_idx" ON "DownloadEvent"("wallpaperId");
CREATE INDEX IF NOT EXISTS "DownloadEvent_timestamp_idx" ON "DownloadEvent"("timestamp");

CREATE INDEX IF NOT EXISTS "ViewEvent_wallpaperId_idx" ON "ViewEvent"("wallpaperId");
CREATE INDEX IF NOT EXISTS "ViewEvent_timestamp_idx" ON "ViewEvent"("timestamp");

-- AddForeignKey
ALTER TABLE "Wallpaper" DROP CONSTRAINT IF EXISTS "Wallpaper_categoryId_fkey";
ALTER TABLE "Wallpaper" ADD CONSTRAINT "Wallpaper_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WallpaperTag" DROP CONSTRAINT IF EXISTS "WallpaperTag_wallpaperId_fkey";
ALTER TABLE "WallpaperTag" ADD CONSTRAINT "WallpaperTag_wallpaperId_fkey" FOREIGN KEY ("wallpaperId") REFERENCES "Wallpaper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WallpaperTag" DROP CONSTRAINT IF EXISTS "WallpaperTag_tagId_fkey";
ALTER TABLE "WallpaperTag" ADD CONSTRAINT "WallpaperTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionWallpaper" DROP CONSTRAINT IF EXISTS "CollectionWallpaper_collectionId_fkey";
ALTER TABLE "CollectionWallpaper" ADD CONSTRAINT "CollectionWallpaper_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionWallpaper" DROP CONSTRAINT IF EXISTS "CollectionWallpaper_wallpaperId_fkey";
ALTER TABLE "CollectionWallpaper" ADD CONSTRAINT "CollectionWallpaper_wallpaperId_fkey" FOREIGN KEY ("wallpaperId") REFERENCES "Wallpaper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadEvent" DROP CONSTRAINT IF EXISTS "DownloadEvent_wallpaperId_fkey";
ALTER TABLE "DownloadEvent" ADD CONSTRAINT "DownloadEvent_wallpaperId_fkey" FOREIGN KEY ("wallpaperId") REFERENCES "Wallpaper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewEvent" DROP CONSTRAINT IF EXISTS "ViewEvent_wallpaperId_fkey";
ALTER TABLE "ViewEvent" ADD CONSTRAINT "ViewEvent_wallpaperId_fkey" FOREIGN KEY ("wallpaperId") REFERENCES "Wallpaper"("id") ON DELETE CASCADE ON UPDATE CASCADE;
