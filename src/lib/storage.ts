import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface StorageUploadResult {
  url: string;
  pathname: string;
  size: number;
  contentType: string;
}

export interface StorageProvider {
  name: string;
  upload(
    fileBuffer: Buffer,
    storagePath: string,
    contentType: string
  ): Promise<StorageUploadResult>;
  delete(pathnameOrUrl: string): Promise<boolean>;
  getUrl(pathname: string): string;
}

// Global in-memory storage fallback for serverless environments when disk is read-only
const inMemoryCache =
  (globalThis as any).__wallpc_storage_cache__ ||
  new Map<string, { buffer: Buffer; contentType: string }>();
(globalThis as any).__wallpc_storage_cache__ = inMemoryCache;

export function getInMemoryFile(key: string): { buffer: Buffer; contentType: string } | null {
  return inMemoryCache.get(key) || null;
}

export class LocalStorageProvider implements StorageProvider {
  name = "local";
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), ".storage", "uploads");
  }

  getUrl(pathname: string): string {
    const cleanPath = pathname.replace(/^\/+/, "");
    return `/api/uploads/${cleanPath}`;
  }

  async upload(
    fileBuffer: Buffer,
    storagePath: string,
    contentType: string
  ): Promise<StorageUploadResult> {
    const cleanPath = storagePath.replace(/^\/+/, "");
    const targetPath = path.join(this.baseDir, cleanPath);
    const targetDir = path.dirname(targetPath);

    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.writeFileSync(targetPath, fileBuffer);
    } catch (fsErr) {
      console.warn("Local filesystem write failed (read-only environment), using memory storage fallback:", fsErr);
      inMemoryCache.set(cleanPath, { buffer: fileBuffer, contentType });
    }

    return {
      url: this.getUrl(cleanPath),
      pathname: cleanPath,
      size: fileBuffer.length,
      contentType,
    };
  }

  async delete(pathnameOrUrl: string): Promise<boolean> {
    const cleanPath = pathnameOrUrl.replace(/^\/api\/uploads\//, "").replace(/^\/+/, "");
    inMemoryCache.delete(cleanPath);

    try {
      const targetPath = path.join(this.baseDir, cleanPath);
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
        return true;
      }
    } catch (err) {
      console.warn("Local storage delete warning:", err);
    }
    return false;
  }
}

export class VercelBlobStorageProvider implements StorageProvider {
  name = "vercel-blob";
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  getUrl(pathname: string): string {
    return `https://blob.vercel-storage.com/${pathname.replace(/^\/+/, "")}`;
  }

  async upload(
    fileBuffer: Buffer,
    storagePath: string,
    contentType: string
  ): Promise<StorageUploadResult> {
    const cleanPath = storagePath.replace(/^\/+/, "");

    const res = await fetch(`https://blob.vercel-storage.com/${cleanPath}`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${this.token}`,
        "x-add-random-suffix": "false",
        "x-content-type": contentType,
      },
      body: new Uint8Array(fileBuffer) as unknown as BodyInit,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Vercel Blob upload failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return {
      url: data.url,
      pathname: data.pathname || cleanPath,
      size: fileBuffer.length,
      contentType,
    };
  }

  async delete(pathnameOrUrl: string): Promise<boolean> {
    try {
      const res = await fetch("https://blob.vercel-storage.com/delete", {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ urls: [pathnameOrUrl] }),
      });
      return res.ok;
    } catch (err) {
      console.warn("Vercel Blob delete failed:", err);
      return false;
    }
  }
}

export class SupabaseStorageProvider implements StorageProvider {
  name = "supabase";
  private url: string;
  private serviceKey: string;
  private bucket: string;

  constructor(url: string, serviceKey: string, bucket = "wallpapers") {
    this.url = url.replace(/\/+$/, "");
    this.serviceKey = serviceKey;
    this.bucket = bucket;
  }

  getUrl(pathname: string): string {
    return `${this.url}/storage/v1/object/public/${this.bucket}/${pathname.replace(/^\/+/, "")}`;
  }

  async upload(
    fileBuffer: Buffer,
    storagePath: string,
    contentType: string
  ): Promise<StorageUploadResult> {
    const cleanPath = storagePath.replace(/^\/+/, "");
    const uploadUrl = `${this.url}/storage/v1/object/${this.bucket}/${cleanPath}`;

    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.serviceKey}`,
        apikey: this.serviceKey,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: new Uint8Array(fileBuffer) as unknown as BodyInit,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Supabase Storage upload failed (${res.status}): ${errText}`);
    }

    const publicUrl = this.getUrl(cleanPath);
    return {
      url: publicUrl,
      pathname: cleanPath,
      size: fileBuffer.length,
      contentType,
    };
  }

  async delete(pathnameOrUrl: string): Promise<boolean> {
    try {
      const cleanPath = pathnameOrUrl.includes(this.bucket)
        ? pathnameOrUrl.split(`${this.bucket}/`)[1]
        : pathnameOrUrl.replace(/^\/+/, "");

      const deleteUrl = `${this.url}/storage/v1/object/${this.bucket}`;
      const res = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.serviceKey}`,
          apikey: this.serviceKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prefixes: [cleanPath] }),
      });
      return res.ok;
    } catch (err) {
      console.warn("Supabase Storage delete failed:", err);
      return false;
    }
  }
}

let cachedProvider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (cachedProvider) return cachedProvider;

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken && blobToken.trim()) {
    cachedProvider = new VercelBlobStorageProvider(blobToken.trim());
    return cachedProvider;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey) {
    cachedProvider = new SupabaseStorageProvider(
      supabaseUrl,
      supabaseKey,
      process.env.SUPABASE_STORAGE_BUCKET || "wallpapers"
    );
    return cachedProvider;
  }

  // Zero-config default: local file storage with serverless in-memory resilience
  cachedProvider = new LocalStorageProvider();
  return cachedProvider;
}

/**
 * Generates a safe, collision-resistant storage key in the required format:
 * wallpapers/{year}/{month}/{uuid}.webp
 */
export function generateWallpaperStorageKey(ext = "webp", subfolder = ""): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const uuid = crypto.randomUUID().replace(/-/g, "").substring(0, 16);
  const cleanExt = ext.replace(/^\./, "").toLowerCase();
  
  if (subfolder) {
    return `wallpapers/${subfolder}/${year}/${month}/${uuid}.${cleanExt}`;
  }
  return `wallpapers/${year}/${month}/${uuid}.${cleanExt}`;
}

/**
 * Uploads a wallpaper asset using the active storage provider.
 */
export async function uploadWallpaper(
  fileBuffer: Buffer,
  options: {
    filename?: string;
    contentType: string;
    subfolder?: string;
  }
): Promise<StorageUploadResult> {
  const ext = options.filename
    ? path.extname(options.filename).replace(/^\./, "") || "webp"
    : options.contentType === "image/png"
    ? "png"
    : options.contentType === "image/jpeg"
    ? "jpg"
    : "webp";

  const storagePath = generateWallpaperStorageKey(ext, options.subfolder);
  const provider = getStorageProvider();
  return provider.upload(fileBuffer, storagePath, options.contentType);
}

/**
 * Deletes a wallpaper asset from storage.
 */
export async function deleteWallpaper(urlOrPathname: string): Promise<boolean> {
  const provider = getStorageProvider();
  return provider.delete(urlOrPathname);
}

/**
 * Gets a publicly accessible URL for a given storage pathname.
 */
export function getWallpaperUrl(pathname: string): string {
  const provider = getStorageProvider();
  return provider.getUrl(pathname);
}

// Backward-compatibility aliases
export const uploadStorageFile = async (
  buffer: Buffer,
  filename: string,
  contentType: string,
  _folder = "wallpapers"
) => {
  return uploadWallpaper(buffer, { filename, contentType });
};

export const deleteStorageFile = deleteWallpaper;
