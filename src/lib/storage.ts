import fs from "fs";
import path from "path";

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
    filename: string,
    contentType: string,
    folder?: string
  ): Promise<StorageUploadResult>;
  delete(pathnameOrUrl: string): Promise<boolean>;
}

// Global in-memory storage fallback for read-only serverless environments
const inMemoryCache = (globalThis as any).__wallpc_storage_cache__ || new Map<string, { buffer: Buffer; contentType: string }>();
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

  async upload(
    fileBuffer: Buffer,
    filename: string,
    contentType: string,
    folder = "wallpapers"
  ): Promise<StorageUploadResult> {
    const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
    const relativePath = `${folder}/${cleanFilename}`;
    const targetDir = path.join(this.baseDir, folder);
    const targetPath = path.join(targetDir, cleanFilename);

    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.writeFileSync(targetPath, fileBuffer);
    } catch (fsErr) {
      console.warn("Local filesystem write failed (read-only environment), using memory storage fallback:", fsErr);
      inMemoryCache.set(relativePath, { buffer: fileBuffer, contentType });
    }

    return {
      url: `/api/uploads/${relativePath}`,
      pathname: relativePath,
      size: fileBuffer.length,
      contentType,
    };
  }

  async delete(pathnameOrUrl: string): Promise<boolean> {
    const cleanPath = pathnameOrUrl.replace(/^\/api\/uploads\//, "");
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

  async upload(
    fileBuffer: Buffer,
    filename: string,
    contentType: string,
    folder = "wallpapers"
  ): Promise<StorageUploadResult> {
    const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
    const pathname = `${folder}/${cleanFilename}`;

    const res = await fetch(`https://blob.vercel-storage.com/${pathname}`, {
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
      pathname: data.pathname || pathname,
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

let cachedProvider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (cachedProvider) return cachedProvider;

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken && blobToken.trim()) {
    cachedProvider = new VercelBlobStorageProvider(blobToken.trim());
    return cachedProvider;
  }

  // Zero-config default: local file storage with serverless in-memory resilience
  cachedProvider = new LocalStorageProvider();
  return cachedProvider;
}

export async function uploadStorageFile(
  buffer: Buffer,
  filename: string,
  contentType: string,
  folder = "wallpapers"
): Promise<StorageUploadResult> {
  const provider = getStorageProvider();
  return provider.upload(buffer, filename, contentType, folder);
}

export async function deleteStorageFile(pathnameOrUrl: string): Promise<boolean> {
  const provider = getStorageProvider();
  return provider.delete(pathnameOrUrl);
}
