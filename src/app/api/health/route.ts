import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/db";
import { getStorageProvider } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbHealth = await checkDatabaseHealth();
  const storage = getStorageProvider();

  const isHealthy = dbHealth.healthy;
  const status = isHealthy ? "ok" : "degraded";

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      database: {
        status: dbHealth.healthy ? "connected" : "unavailable",
        provider: dbHealth.provider,
        latencyMs: dbHealth.latencyMs,
        wallpapersCount: dbHealth.wallpapersCount,
        categoriesCount: dbHealth.categoriesCount,
        error: dbHealth.error ? "Database connection error (see server logs)" : undefined,
      },
      storage: {
        provider: storage.name,
      },
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
