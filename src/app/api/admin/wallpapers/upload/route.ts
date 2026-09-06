import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/adminAuth";
import { uploadWallpaper } from "@/lib/storage";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

function detectImageFormat(buffer: Buffer): "jpeg" | "png" | "webp" | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpeg";
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  )
    return "png";
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  )
    return "webp";
  return null;
}

function parseDimensions(
  buffer: Buffer,
  format: string
): { width: number; height: number } | null {
  try {
    if (format === "png" && buffer.length >= 24) {
      return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20),
      };
    }
    if (format === "webp" && buffer.length >= 30) {
      const type = buffer.toString("ascii", 12, 16);
      if (type === "VP8X") {
        const width = 1 + buffer.readUIntLE(24, 3);
        const height = 1 + buffer.readUIntLE(27, 3);
        return { width, height };
      } else if (type === "VP8 " && buffer.length >= 30) {
        const width = buffer.readUInt16LE(26) & 0x3fff;
        const height = buffer.readUInt16LE(28) & 0x3fff;
        return { width, height };
      } else if (type === "VP8L" && buffer.length >= 25) {
        const b1 = buffer[21];
        const b2 = buffer[22];
        const b3 = buffer[23];
        const b4 = buffer[24];
        const width = 1 + (((b2 & 0x3f) << 8) | b1);
        const height = 1 + (((b4 & 0xf) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
        return { width, height };
      }
    }
    if (format === "jpeg") {
      let offset = 2;
      while (offset < buffer.length - 8) {
        if (buffer[offset] !== 0xff) {
          offset++;
          continue;
        }
        const marker = buffer[offset + 1];
        if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
      }
    }
  } catch {
    // Graceful fallback
  }
  return null;
}

function calculateAspectRatio(width: number, height: number): string {
  const ratio = width / height;
  if (Math.abs(ratio - 16 / 9) < 0.05) return "16:9";
  if (Math.abs(ratio - 16 / 10) < 0.05) return "16:10";
  if (Math.abs(ratio - 21 / 9) < 0.1) return "21:9";
  if (Math.abs(ratio - 32 / 9) < 0.15) return "32:9";
  if (Math.abs(ratio - 4 / 3) < 0.05) return "4:3";
  if (Math.abs(ratio - 9 / 16) < 0.05) return "9:16 (Portrait)";
  return `${width}:${height}`;
}

export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const thumbnailFile = formData.get("thumbnail") as File | null;
    const reportedWidth = formData.get("width") ? parseInt(formData.get("width") as string, 10) : 0;
    const reportedHeight = formData.get("height") ? parseInt(formData.get("height") as string, 10) : 0;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 25 MB limit.` },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const detectedFormat = detectImageFormat(fileBuffer);

    if (!detectedFormat) {
      return NextResponse.json(
        { error: "Invalid image format. Supported formats: JPG, PNG, WEBP." },
        { status: 400 }
      );
    }

    const parsedDim = parseDimensions(fileBuffer, detectedFormat);
    const width = parsedDim?.width || reportedWidth || 3840;
    const height = parsedDim?.height || reportedHeight || 2160;

    if (width < 1280 || height < 720) {
      return NextResponse.json(
        { error: `Image resolution (${width}×${height}) is too small. Minimum required resolution is 1920×1080.` },
        { status: 400 }
      );
    }

    const ratio = width / height;
    const orientation = ratio >= 2.1 ? "ultrawide" : ratio < 1 ? "portrait" : "landscape";
    const aspectRatio = calculateAspectRatio(width, height);

    const extMap: Record<string, string> = {
      jpeg: ".jpg",
      png: ".png",
      webp: ".webp",
    };
    const mimeMap: Record<string, string> = {
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    };

    const ext = extMap[detectedFormat];
    const mimeType = mimeMap[detectedFormat];

    const cleanBase = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 40);
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const filename = `${cleanBase}-${uniqueSuffix}${ext}`;

    // Upload original file using storage abstraction (generates wallpapers/{year}/{month}/{uuid}.ext)
    const uploadResult = await uploadWallpaper(fileBuffer, {
      filename: file.name,
      contentType: mimeType,
    });

    let thumbnailUrl = uploadResult.url;

    // Upload thumbnail if client generated one
    if (thumbnailFile) {
      try {
        const thumbBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
        const thumbResult = await uploadWallpaper(thumbBuffer, {
          filename: "thumb.webp",
          contentType: "image/webp",
          subfolder: "thumbnails",
        });
        thumbnailUrl = thumbResult.url;
      } catch (thumbErr) {
        console.warn("Thumbnail upload warning, falling back to original:", thumbErr);
      }
    }

    const fileSizeFormatted = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    return NextResponse.json({
      success: true,
      imageUrl: uploadResult.url,
      fileUrl: uploadResult.url,
      thumbnailUrl,
      width,
      height,
      orientation,
      aspectRatio,
      fileType: detectedFormat.toUpperCase(),
      fileSize: fileSizeFormatted,
      pathname: uploadResult.pathname,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process image upload" },
      { status: 500 }
    );
  }
}
