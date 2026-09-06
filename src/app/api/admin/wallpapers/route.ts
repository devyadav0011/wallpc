import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, isDatabaseConfigured } from "@/lib/db";
import { verifyAdminAuth } from "@/lib/adminAuth";
import { generateSlug } from "@/lib/utils";
import { getWallpapers, addWallpaperToStore } from "@/lib/wallpaper-service";
import { deleteStorageFile } from "@/lib/storage";
import { normalizeWallpaper } from "@/lib/types";

export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "30", 10)));
    const skip = (page - 1) * limit;

    if (isDatabaseConfigured()) {
      try {
        const [wallpapers, total] = await Promise.all([
          db.wallpaper.findMany({
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            include: {
              category: true,
              tags: {
                include: { tag: true },
              },
            },
          }),
          db.wallpaper.count(),
        ]);

        return NextResponse.json({
          wallpapers,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        });
      } catch (dbErr) {
        console.warn("Admin DB wallpapers query failed, falling back to static service:", dbErr);
      }
    }

    const result = await getWallpapers({ page, limit, sort: "newest" });
    return NextResponse.json({
      wallpapers: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (err) {
    console.error("Admin GET wallpapers error:", err);
    return NextResponse.json({ error: "Failed to fetch wallpapers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      categoryId,
      resolutionWidth,
      resolutionHeight,
      orientation,
      fileUrl,
      fileUrl4k,
      fileUrl1440p,
      fileUrl1080p,
      thumbnailUrl,
      previewUrl,
      fileType,
      fileSize,
      featured,
      trending,
      published,
      creatorName,
      creatorUrl,
      license,
      tags = [],
    } = body;

    const effectiveFileUrl = fileUrl || body.imageUrl || body.image;
    if (!title || !categoryId || !effectiveFileUrl) {
      return NextResponse.json(
        { error: "Title, category, and image are required" },
        { status: 400 }
      );
    }

    const baseSlug = generateSlug(body.slug || title) || `wallpaper-${Date.now()}`;
    let slug = baseSlug;
    const width = parseInt(body.width || resolutionWidth || "3840", 10);
    const height = parseInt(body.height || resolutionHeight || "2160", 10);
    const ratio = width / height;
    const computedOrientation =
      orientation || (ratio >= 2.1 ? "ultrawide" : ratio < 1 ? "portrait" : "landscape");

    let createdWallpaper: any = null;

    if (isDatabaseConfigured()) {
      try {
        // Resolve categoryId to ensure valid foreign key
        const categoryRecord =
          (await db.category.findFirst({
            where: {
              OR: [
                { id: categoryId },
                { slug: categoryId.toLowerCase() },
              ],
            },
          })) || (await db.category.findFirst());

        const targetCategoryId = categoryRecord ? categoryRecord.id : categoryId;

        // Collision check with incremental suffix
        let candidateSlug = slug;
        let counter = 1;
        while (await db.wallpaper.findUnique({ where: { slug: candidateSlug } })) {
          candidateSlug = `${slug}-${counter++}`;
        }
        slug = candidateSlug;

        createdWallpaper = await db.wallpaper.create({
          data: {
            title,
            slug,
            description: description || null,
            categoryId: targetCategoryId,
            width,
            height,
            resolution: `${width}×${height}`,
            resolutionWidth: width,
            resolutionHeight: height,
            orientation: computedOrientation,
            imageUrl: effectiveFileUrl,
            thumbnailUrl: thumbnailUrl || effectiveFileUrl,
            image4kUrl: fileUrl4k || effectiveFileUrl,
            image1440pUrl: fileUrl1440p || null,
            image1080pUrl: fileUrl1080p || null,
            fileUrl: effectiveFileUrl,
            fileUrl4k: fileUrl4k || effectiveFileUrl,
            fileUrl1440p: fileUrl1440p || null,
            fileUrl1080p: fileUrl1080p || null,
            previewUrl: previewUrl || effectiveFileUrl,
            fileType: fileType || "WEBP",
            fileSize: fileSize || "4.8 MB",
            featured: !!featured,
            trending: !!trending,
            published: published !== undefined ? !!published : true,
            creatorName: creatorName || null,
            creatorUrl: creatorUrl || null,
            license: license || "Free for personal desktop use",
          },
          include: {
            category: true,
            tags: {
              include: { tag: true },
            },
          },
        });

        // Attach tags if provided
        if (Array.isArray(tags) && tags.length > 0) {
          for (const t of tags) {
            const tagSlug = generateSlug(t);
            if (!tagSlug) continue;
            const tagRecord = await db.tag.upsert({
              where: { slug: tagSlug },
              update: {},
              create: { name: t, slug: tagSlug },
            });

            await db.wallpaperTag.create({
              data: {
                wallpaperId: createdWallpaper.id,
                tagId: tagRecord.id,
              },
            });
          }
        }
      } catch (dbErr) {
        console.error("Database create failed in POST /api/admin/wallpapers:", dbErr);
        if (fileUrl && fileUrl.startsWith("/api/uploads/")) {
          await deleteStorageFile(fileUrl).catch(() => {});
        }
        return NextResponse.json({ error: "Failed to save wallpaper to persistent database" }, { status: 500 });
      }
    }

    const memoryWallpaper = addWallpaperToStore({
      id: createdWallpaper?.id || `wp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      slug,
      description,
      categoryId,
      resolutionWidth: width,
      resolutionHeight: height,
      orientation: computedOrientation,
      fileUrl,
      fileUrl4k: fileUrl4k || fileUrl,
      fileUrl1440p,
      fileUrl1080p,
      thumbnailUrl: thumbnailUrl || fileUrl,
      previewUrl: previewUrl || fileUrl,
      fileType: fileType || "WEBP",
      fileSize: fileSize || "4.8 MB",
      featured: !!featured,
      trending: !!trending,
      published: published !== undefined ? !!published : true,
      creatorName,
      creatorUrl,
      license: license || "Free for personal desktop use",
      tags,
    });

    // Revalidate public routes
    try {
      revalidatePath("/");
      revalidatePath("/wallpapers");
      revalidatePath("/latest");
      revalidatePath("/trending");
      revalidatePath("/popular");
      revalidatePath("/search");
      revalidatePath(`/wallpapers/${slug}`);
    } catch {
      // Revalidation optional in static/dev contexts
    }

    const finalWallpaper = createdWallpaper ? normalizeWallpaper(createdWallpaper) : memoryWallpaper;

    return NextResponse.json({
      success: true,
      wallpaper: finalWallpaper,
    });
  } catch (err) {
    console.error("Admin POST wallpaper error:", err);
    return NextResponse.json({ error: "Failed to create wallpaper" }, { status: 500 });
  }
}

