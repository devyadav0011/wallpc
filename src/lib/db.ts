import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Checks whether a valid PostgreSQL DATABASE_URL is configured in the environment.
 * WallPC strictly requires PostgreSQL for persistent database storage.
 */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;
  return url.startsWith("postgresql://") || url.startsWith("postgres://");
}

/**
 * Backward compatibility alias for PostgreSQL configuration check.
 */
export function isPostgresConfigured(): boolean {
  return isDatabaseConfigured();
}

/**
 * Creates a standard PrismaClient instance with appropriate server-side logging.
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

export interface DatabaseHealthResult {
  healthy: boolean;
  provider: string;
  latencyMs: number;
  wallpapersCount?: number;
  categoriesCount?: number;
  error?: string;
}

/**
 * Performs an active server-side database health check via SELECT 1.
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealthResult> {
  if (!isDatabaseConfigured()) {
    return {
      healthy: false,
      provider: "none",
      latencyMs: 0,
      error: "PostgreSQL DATABASE_URL is not configured",
    };
  }

  const startTime = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - startTime;
    const [wallpapersCount, categoriesCount] = await Promise.all([
      db.wallpaper.count(),
      db.category.count(),
    ]);
    return {
      healthy: true,
      provider: "postgresql",
      latencyMs,
      wallpapersCount,
      categoriesCount,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      healthy: false,
      provider: "postgresql",
      latencyMs,
      error: err?.message?.split("\n")[0] || "Database connection query failed",
    };
  }
}
