import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Checks whether a valid DATABASE_URL is provided in the environment.
 * For production (Vercel), it must be a PostgreSQL URL (Supabase/Neon).
 * For local development, SQLite (file:./dev.db) is supported.
 */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;
  // Vercel serverless environments have a read-only filesystem; SQLite cannot be used in production
  if (process.env.VERCEL && url.startsWith("file:")) return false;
  return (
    url.startsWith("file:") ||
    url.startsWith("postgresql://") ||
    url.startsWith("postgres://")
  );
}

/**
 * Checks whether a production-grade PostgreSQL database is configured.
 */
export function isPostgresConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;
  return url.startsWith("postgresql://") || url.startsWith("postgres://");
}

/**
 * Creates a standard PrismaClient instance with appropriate logging.
 */
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
}

/**
 * Standard server-only Prisma client singleton.
 * Does NOT use fake proxies, ensuring real database errors are surfaced and logged in Vercel.
 */
export const db: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export function getDb(): PrismaClient {
  return db;
}


