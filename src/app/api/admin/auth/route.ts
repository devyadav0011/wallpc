import { NextRequest, NextResponse } from "next/server";
import { getAdminSecretKey, safeCompare } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json().catch(() => ({}));
    const adminKey = getAdminSecretKey();

    if (!adminKey) {
      return NextResponse.json(
        { error: "Admin authentication is not configured for this deployment." },
        { status: 503 }
      );
    }

    if (!key || !safeCompare(key, adminKey)) {
      return NextResponse.json({ error: "Invalid administrator key." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, message: "Authenticated successfully" });
    response.cookies.set("wallpc_admin_token", adminKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Admin auth error:", err);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.delete("wallpc_admin_token");
  response.cookies.delete("wallnet_admin_token");
  return response;
}
