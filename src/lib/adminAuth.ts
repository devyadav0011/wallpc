import { NextRequest } from "next/server";
import crypto from "node:crypto";

export function getAdminSecretKey(): string | null {
  const key = process.env.ADMIN_SECRET || process.env.ADMIN_SECRET_KEY;
  if (!key || !key.trim()) return null;
  return key.trim();
}

export function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyAdminAuth(request: NextRequest): boolean {
  const secretKey = getAdminSecretKey();
  if (!secretKey) return false;
  
  // Check Authorization Header
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (safeCompare(token, secretKey)) return true;
  }

  // Check Cookie
  const cookie = request.cookies.get("wallpc_admin_token") || request.cookies.get("wallnet_admin_token");
  if (cookie && safeCompare(cookie.value, secretKey)) {
    return true;
  }

  return false;
}

