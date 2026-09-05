import { NextRequest } from "next/server";

export function verifyAdminAuth(request: NextRequest): boolean {
  const secretKey = process.env.ADMIN_SECRET_KEY;
  if (!secretKey) return false;
  
  // Check Authorization Header
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (token === secretKey) return true;
  }

  // Check Cookie
  const cookie = request.cookies.get("wallpc_admin_token") || request.cookies.get("wallnet_admin_token");
  if (cookie && cookie.value === secretKey) {
    return true;
  }

  return false;
}
