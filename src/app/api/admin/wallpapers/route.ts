import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, isDatabaseConfigured } from "@/lib/db";
import { verifyAdminAuth } from "@/lib/adminAuth";
import { generateSlug } from "@/lib/utils";
import { getWallpapers, addWallpaperToStore } from "@/lib/wallpaper-service";

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

    if (!title || !categoryId || !fileUrl) {
      return NextResponse.json(
        { error: "Title, category, and image are required" },
        { status: 400 }
      );
    }

    let slug = generateSlug(body.slug || title);
    const width = parseInt(resolutionWidth || "3840", 10);
    const height = parseInt(resolutionHeight || "2160", 10);
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

        const existing = await db.wallpaper.findUnique({ where: { slug } });
        if (existing) {
          slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
        }

        createdWallpaper = await db.wallpaper.create({
          data: {
            title,
            slug,
            description: description || null,
            categoryId: targetCategoryId,
            resolutionWidth: width,
            resolutionHeight: height,
            orientation: computedOrientation,
            fileUrl,
            fileUrl4k: fileUrl4k || fileUrl,
            fileUrl1440p: fileUrl1440p || null,
            fileUrl1080p: fileUrl1080p || null,
            thumbnailUrl: thumbnailUrl || fileUrl,
            previewUrl: previewUrl || fileUrl,
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
      }
    }

    // Always synchronize into runtime wallpaper catalog so it's instantly available everywhere
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
      revalidatePath(`/wallpapers/${slug}`);
    } catch {
      // Revalidation optional in static/dev contexts
    }

    return NextResponse.json({
      success: true,
      wallpaper: createdWallpaper || memoryWallpaper,
    });
  } catch (err) {
    console.error("Admin POST wallpaper error:", err);
    return NextResponse.json({ error: "Failed to create wallpaper" }, { status: 500 });
  }
}

