import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, isDatabaseConfigured } from "@/lib/db";
import { verifyAdminAuth } from "@/lib/adminAuth";
import { normalizeWallpaper } from "@/lib/types";
import { deleteStorageFile } from "@/lib/storage";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Production database is not configured. WallPC requires a PostgreSQL database." },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.wallpaper.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Wallpaper not found" }, { status: 404 });
    }

    const width = body.width
      ? parseInt(body.width, 10)
      : body.resolutionWidth
      ? parseInt(body.resolutionWidth, 10)
      : undefined;
    const height = body.height
      ? parseInt(body.height, 10)
      : body.resolutionHeight
      ? parseInt(body.resolutionHeight, 10)
      : undefined;
    const resolution = body.resolution || (width && height ? `${width}×${height}` : undefined);

    const updated = await db.wallpaper.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        categoryId: body.categoryId !== undefined ? body.categoryId : undefined,
        width,
        height,
        resolution,
        resolutionWidth: width,
        resolutionHeight: height,
        orientation: body.orientation !== undefined ? body.orientation : undefined,
        imageUrl: body.imageUrl || body.fileUrl || undefined,
        thumbnailUrl: body.thumbnailUrl !== undefined ? body.thumbnailUrl : undefined,
        image4kUrl: body.image4kUrl || body.fileUrl4k || undefined,
        image1440pUrl: body.image1440pUrl || body.fileUrl1440p || undefined,
        image1080pUrl: body.image1080pUrl || body.fileUrl1080p || undefined,
        fileUrl: body.fileUrl !== undefined ? body.fileUrl : undefined,
        fileUrl4k: body.fileUrl4k !== undefined ? body.fileUrl4k : undefined,
        fileUrl1440p: body.fileUrl1440p !== undefined ? body.fileUrl1440p : undefined,
        fileUrl1080p: body.fileUrl1080p !== undefined ? body.fileUrl1080p : undefined,
        previewUrl: body.previewUrl || body.imageUrl || body.fileUrl || undefined,
        fileType: body.fileType !== undefined ? body.fileType : undefined,
        fileSize: body.fileSize !== undefined ? body.fileSize : undefined,
        featured: body.featured !== undefined ? !!body.featured : undefined,
        trending: body.trending !== undefined ? !!body.trending : undefined,
        published: body.published !== undefined ? !!body.published : undefined,
        creatorName: body.creatorName !== undefined ? body.creatorName : undefined,
        creatorUrl: body.creatorUrl !== undefined ? body.creatorUrl : undefined,
        license: body.license !== undefined ? body.license : undefined,
      },
      include: {
        category: true,
        tags: {
          include: { tag: true },
        },
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/wallpapers");
      revalidatePath("/latest");
      revalidatePath("/trending");
      revalidatePath("/popular");
      revalidatePath("/search");
      if (existing.slug) {
        revalidatePath(`/wallpapers/${existing.slug}`);
      }
      if (updated.slug && updated.slug !== existing.slug) {
        revalidatePath(`/wallpapers/${updated.slug}`);
      }
    } catch {
      // Ignore during dev/static execution
    }

    return NextResponse.json({ success: true, wallpaper: normalizeWallpaper(updated) });
  } catch (err: any) {
    console.error("Admin PUT wallpaper error:", err);
    return NextResponse.json(
      { error: "Failed to update wallpaper in persistent database" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Production database is not configured. WallPC requires a PostgreSQL database." },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    const existing = await db.wallpaper.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Wallpaper not found" }, { status: 404 });
    }

    await db.$transaction([
      db.wallpaperTag.deleteMany({ where: { wallpaperId: id } }),
      db.collectionWallpaper.deleteMany({ where: { wallpaperId: id } }),
      db.wallpaper.delete({ where: { id } }),
    ]);

    // Clean up associated uploaded files from storage
    if (existing.fileUrl) {
      await deleteStorageFile(existing.fileUrl).catch(() => {});
    }
    if (existing.thumbnailUrl && existing.thumbnailUrl !== existing.fileUrl) {
      await deleteStorageFile(existing.thumbnailUrl).catch(() => {});
    }

    try {
      revalidatePath("/");
      revalidatePath("/wallpapers");
      revalidatePath("/latest");
      revalidatePath("/trending");
      if (existing.slug) {
        revalidatePath(`/wallpapers/${existing.slug}`);
      }
    } catch {
      // Ignore
    }

    return NextResponse.json({ success: true, message: "Wallpaper deleted" });
  } catch (err: any) {
    console.error("Admin DELETE wallpaper error:", err);
    return NextResponse.json(
      { error: "Failed to delete wallpaper from persistent database" },
      { status: 500 }
    );
  }
}
