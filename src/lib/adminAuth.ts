import { NextRequest } from "next/server";

export const DEFAULT_ADMIN_KEY = "nimblux@Dev@8937";

export function getAdminSecretKey(): string {
  return process.env.ADMIN_SECRET_KEY?.trim() || DEFAULT_ADMIN_KEY;
}

export function verifyAdminAuth(request: NextRequest): boolean {
  const secretKey = getAdminSecretKey();
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

