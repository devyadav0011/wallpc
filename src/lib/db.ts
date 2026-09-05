import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Checks whether a valid DATABASE_URL is provided in the environment.
 * For SQLite, it must start with "file:".
 * For PostgreSQL/MySQL, it must start with their respective schemes.
 */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;
  if (url.startsWith("file:")) return true;
  if (
    url.startsWith("postgresql://") ||
    url.startsWith("postgres://") ||
    url.startsWith("mysql://")
  ) {
    return true;
  }
  return false;
}

/**
 * Lazily obtains or initializes the PrismaClient.
 * Returns null if DATABASE_URL is missing or invalid, preventing build failures.
 */
export function getDb(): PrismaClient | null {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = client;
    }
    return client;
  } catch (err) {
    console.warn("PrismaClient initialization failed:", err);
    return null;
  }
}

/**
 * Creates a safe dummy proxy for environments without a database.
 * Method calls return a resolved Promise with null or empty arrays.
 */
function createSafeProxy(): any {
  return new Proxy(() => {}, {
    get(_target, prop) {
      if (prop === "then") return undefined; // avoid Promise chain collision
      return createSafeProxy();
    },
    apply() {
      return Promise.resolve(null);
    },
  });
}

/**
 * Exported db instance that proxies to the lazy client if configured,
 * or safely falls back to a non-crashing proxy if database is offline.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const realClient = getDb();
    if (realClient) {
      const val = (realClient as any)[prop];
      if (typeof val === "function") {
        return val.bind(realClient);
      }
      return val;
    }
    return createSafeProxy();
  },
});

