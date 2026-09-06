import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, isDatabaseConfigured } from "@/lib/db";
import { verifyAdminAuth } from "@/lib/adminAuth";
import { generateSlug } from "@/lib/utils";
import { getWallpapers } from "@/lib/wallpaper-service";
import { deleteStorageFile } from "@/lib/storage";
import { normalizeWallpaper } from "@/lib/types";
import { ensureBaseData } from "@/lib/db-seed";

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

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Production database is not configured. WallPC requires a hosted PostgreSQL database on Vercel.",
      },
      { status: 503 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

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

  // Ensure standard base categories exist in persistent database
  try {
    await ensureBaseData(db);
  } catch (seedErr: any) {
    console.warn("[Admin Upload] Base data check warning:", seedErr?.message || seedErr);
  }

  // Strictly validate category foreign key
  const cleanCategoryId = String(categoryId).trim();
  let categoryRecord: any = null;
  try {
    categoryRecord = await db.category.findFirst({
      where: {
        OR: [
          { id: cleanCategoryId },
          { slug: cleanCategoryId.toLowerCase() },
        ],
      },
    });
  } catch (findErr: any) {
    console.error("[Admin Upload] Category lookup failed:", findErr?.message || findErr);
    return NextResponse.json(
      { error: "Database connection failed. Verify DATABASE_URL connectivity." },
      { status: 503 }
    );
  }

  if (!categoryRecord) {
    // Prevent orphan files on invalid input
    await deleteStorageFile(effectiveFileUrl).catch(() => {});
    return NextResponse.json(
      { error: "Selected category does not exist." },
      { status: 400 }
    );
  }

  const width = parseInt(body.width || resolutionWidth || "3840", 10);
  const height = parseInt(body.height || resolutionHeight || "2160", 10);
  const ratio = width / height;
  const computedOrientation =
    orientation || (ratio >= 2.1 ? "ultrawide" : ratio < 1 ? "portrait" : "landscape");

  const baseSlug = generateSlug(body.slug || title) || `wallpaper-${Date.now()}`;
  let slug = baseSlug;

  try {
    let counter = 1;
    while (await db.wallpaper.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }
  } catch (slugErr: any) {
    console.error("[Admin Upload] Slug lookup error:", slugErr?.message || slugErr);
  }

  let createdWallpaper: any = null;

  try {
    createdWallpaper = await db.$transaction(async (tx) => {
      const wp = await tx.wallpaper.create({
        data: {
          title: title.trim(),
          slug,
          description: description?.trim() || null,
          categoryId: categoryRecord.id,
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
          creatorName: creatorName?.trim() || null,
          creatorUrl: creatorUrl?.trim() || null,
          license: license?.trim() || "Free for personal desktop use",
        },
        include: {
          category: true,
        },
      });

      if (Array.isArray(tags) && tags.length > 0) {
        for (const t of tags) {
          const cleanTag = String(t).trim();
          if (!cleanTag) continue;
          const tagSlug = generateSlug(cleanTag);
          if (!tagSlug) continue;

          const tagRecord = await tx.tag.upsert({
            where: { slug: tagSlug },
            update: {},
            create: { name: cleanTag, slug: tagSlug },
          });

          await tx.wallpaperTag.create({
            data: {
              wallpaperId: wp.id,
              tagId: tagRecord.id,
            },
          });
        }
      }

      return tx.wallpaper.findUnique({
        where: { id: wp.id },
        include: {
          category: true,
          tags: {
            include: { tag: true },
          },
        },
      });
    });
  } catch (dbErr: any) {
    const prismaCode = dbErr?.code || "UNKNOWN";
    const meta = dbErr?.meta ? JSON.stringify(dbErr.meta) : "none";
    console.error(
      `[Admin Wallpaper DB Error] Prisma Code: ${prismaCode}, Meta: ${meta}, Message: ${
        dbErr?.message?.split("\n")[0] || "Unknown error"
      }`
    );

    // Roll back uploaded storage file to prevent orphan files
    await deleteStorageFile(effectiveFileUrl).catch((cleanupErr) => {
      console.warn("[Admin Upload] Storage cleanup error:", cleanupErr?.message || cleanupErr);
    });

    if (prismaCode === "P2002") {
      return NextResponse.json(
        { error: "A wallpaper with this slug already exists. Storage cleanup attempted." },
        { status: 409 }
      );
    }

    if (prismaCode === "P2003") {
      return NextResponse.json(
        { error: "Foreign key relation failed (category or tag not found). Storage cleanup attempted." },
        { status: 400 }
      );
    }

    if (typeof prismaCode === "string" && prismaCode.startsWith("P10")) {
      return NextResponse.json(
        { error: "Database connection failed. Verify DATABASE_URL connectivity. Storage cleanup attempted." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: `Failed to save wallpaper to persistent database. Storage cleanup attempted. (Code: ${prismaCode})`,
      },
      { status: 500 }
    );
  }

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

  return NextResponse.json({
    success: true,
    wallpaper: normalizeWallpaper(createdWallpaper),
  });
}
