import { PrismaClient } from "@prisma/client";
import { CATEGORIES } from "@/data/categories";
import { COLLECTIONS } from "@/data/collections";

let isSeeding = false;

/**
 * Ensures standard 18 categories and 10 collections exist in the persistent database.
 * If the database is empty (e.g. fresh Supabase / Neon deployment), it automatically
 * populates the base records so foreign key relations never fail.
 */
export async function ensureBaseData(client: PrismaClient): Promise<void> {
  if (isSeeding) return;
  try {
    const categoryCount = await client.category.count();
    if (categoryCount >= CATEGORIES.length) {
      return; // Already populated
    }

    isSeeding = true;
    console.log(`[db-seed] Database has ${categoryCount} categories. Syncing base data (${CATEGORIES.length} categories)...`);

    // Upsert all categories
    for (const cat of CATEGORIES) {
      await client.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          description: cat.description,
          coverImage: cat.coverImage,
          order: cat.order,
        },
        create: {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          coverImage: cat.coverImage,
          order: cat.order,
        },
      });
    }

    // Upsert all collections
    for (const col of COLLECTIONS) {
      await client.collection.upsert({
        where: { slug: col.slug },
        update: {
          name: col.name,
          description: col.description,
          coverImage: col.coverImage,
          featured: !!col.featured,
        },
        create: {
          id: col.id,
          name: col.name,
          slug: col.slug,
          description: col.description,
          coverImage: col.coverImage,
          featured: !!col.featured,
        },
      });
    }

    console.log("[db-seed] Base categories and collections successfully synchronized in persistent database.");
  } catch (err: any) {
    console.error("[db-seed] Failed to ensure base database records:", err?.message || err);
  } finally {
    isSeeding = false;
  }
}
