import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConfigured } from "@/lib/db";
import { verifyAdminAuth } from "@/lib/adminAuth";
import { slugify } from "@/lib/utils";

export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured. Set DATABASE_URL to create categories." },
      { status: 503 }
    );
  }

  try {
    const { name, description, coverImage, order } = await request.json();
    if (!name || !description || !coverImage) {
      return NextResponse.json({ error: "Name, description, and cover image are required" }, { status: 400 });
    }

    const slug = slugify(name);
    const category = await db.category.create({
      data: {
        name,
        slug,
        description,
        coverImage,
        order: order ? parseInt(order, 10) : 0,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (err) {
    console.error("Admin POST category error:", err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
