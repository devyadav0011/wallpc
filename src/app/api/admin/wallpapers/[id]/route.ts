import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConfigured } from "@/lib/db";
import { verifyAdminAuth } from "@/lib/adminAuth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured. Set DATABASE_URL to enable modifications." },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await db.wallpaper.update({
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

    return NextResponse.json({ success: true, wallpaper: updated });
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

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured. Set DATABASE_URL to enable deletion." },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    await db.wallpaper.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Wallpaper deleted" });
  } catch (err) {
    console.error("Admin DELETE wallpaper error:", err);
    return NextResponse.json({ error: "Failed to delete wallpaper" }, { status: 500 });
  }
}
