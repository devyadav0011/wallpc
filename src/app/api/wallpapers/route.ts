import { NextRequest, NextResponse } from "next/server";
import { getWallpapers } from "@/lib/wallpaper-service";
import { SortFilter } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "all";
    const resolution = searchParams.get("resolution")?.trim() || "all";
    const orientation = searchParams.get("orientation")?.trim() || "all";
    const sort = (searchParams.get("sort") || "trending") as SortFilter;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(60, Math.max(1, parseInt(searchParams.get("limit") || "24", 10)));

    const result = await getWallpapers({
      query,
      category,
      resolution,
      orientation,
      sort,
      page,
      limit,
    });

    return NextResponse.json({
      wallpapers: result.data,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
    });
  } catch (err) {
    console.error("GET /api/wallpapers error:", err);
    return NextResponse.json(
      { error: "Failed to fetch wallpapers" },
      { status: 500 }
    );
  }
}

