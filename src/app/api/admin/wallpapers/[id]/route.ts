import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, isDatabaseConfigured } from "@/lib/db";
import { verifyAdminAuth } from "@/lib/adminAuth";
import {
  getWallpaperById,
  removeWallpaperFromStore,
  updateWallpaperInStore,
} from "@/lib/wallpaper-service";
import { deleteStorageFile } from "@/lib/storage";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    let updated: any = null;

    if (isDatabaseConfigured()) {
      try {
        updated = await db.wallpaper.update({
          where: { id },
          data: {
            title: body.title !== undefined ? body.title : undefined,
            description: body.description !== undefined ? body.description : undefined,
            categoryId: body.categoryId !== undefined ? body.categoryId : undefined,
            resolutionWidth: body.resolutionWidth ? parseInt(body.resolutionWidth, 10) : undefined,
            resolutionHeight: body.resolutionHeight ? parseInt(body.resolutionHeight, 10) : undefined,
            orientation: body.orientation !== undefined ? body.orientation : undefined,
            fileUrl: body.fileUrl !== undefined ? body.fileUrl : undefined,
            fileUrl4k: body.fileUrl4k !== undefined ? body.fileUrl4k : undefined,
            fileUrl1440p: body.fileUrl1440p !== undefined ? body.fileUrl1440p : undefined,
            fileUrl1080p: body.fileUrl1080p !== undefined ? body.fileUrl1080p : undefined,
            thumbnailUrl: body.thumbnailUrl !== undefined ? body.thumbnailUrl : undefined,
            previewUrl: body.previewUrl !== undefined ? body.previewUrl : undefined,
            featured: body.featured !== undefined ? !!body.featured : undefined,
            trending: body.trending !== undefined ? !!body.trending : undefined,
            published: body.published !== undefined ? !!body.published : undefined,
          },
        });
      } catch (dbErr) {
        console.warn("DB update failed, updating memory store:", dbErr);
      }
    }

    const memoryUpdated = updateWallpaperInStore(id, body);

    try {
      revalidatePath("/");
      revalidatePath("/wallpapers");
      revalidatePath("/latest");
      revalidatePath("/trending");
    } catch {
      // Ignore in dev
    }

    return NextResponse.json({ success: true, wallpaper: updated || memoryUpdated });
  } catch (err) {
    console.error("Admin PUT wallpaper error:", err);
    return NextResponse.json({ error: "Failed to update wallpaper" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await getWallpaperById(id);

    if (isDatabaseConfigured()) {
      try {
        await db.wallpaperTag.deleteMany({ where: { wallpaperId: id } });
        await db.wallpaper.delete({ where: { id } });
      } catch (dbErr) {
        console.warn("DB delete failed, continuing with memory cleanup:", dbErr);
      }
    }

    // Remove from memory store
    removeWallpaperFromStore(id);

    // Clean up associated uploaded files from storage
    if (existing) {
      if (existing.fileUrl && existing.fileUrl.startsWith("/api/uploads/")) {
        await deleteStorageFile(existing.fileUrl);
      }
      if (existing.thumbnailUrl && existing.thumbnailUrl.startsWith("/api/uploads/")) {
        await deleteStorageFile(existing.thumbnailUrl);
      }
    }

    try {
      revalidatePath("/");
      revalidatePath("/wallpapers");
      revalidatePath("/latest");
      revalidatePath("/trending");
    } catch {
      // Ignore
    }

    return NextResponse.json({ success: true, message: "Wallpaper deleted" });
  } catch (err) {
    console.error("Admin DELETE wallpaper error:", err);
    return NextResponse.json({ error: "Failed to delete wallpaper" }, { status: 500 });
  }
}

