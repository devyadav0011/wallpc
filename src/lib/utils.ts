import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCount(count: number): string {
  if (count >= 1_000_000) {
    return (count / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (count >= 1_000) {
    return (count / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return count.toLocaleString();
}

export function formatResolution(width: number, height: number): string {
  return `${width} × ${height}`;
}

export function getResolutionBadge(width: number, height: number): string {
  if (width >= 7680 || height >= 4320) return "8K";
  if (width >= 5120 && height === 1440) return "32:9 Ultrawide";
  if (width === 3440 && height === 1440) return "21:9 Ultrawide";
  if (width >= 3840 && height >= 2160) return "4K UHD";
  if (width >= 2560 && height >= 1440) return "1440p QHD";
  if (width >= 1920 && height >= 1080) return "1080p FHD";
  return `${width}p`;
}

export function getAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  const rWidth = width / divisor;
  const rHeight = height / divisor;

  if (Math.abs(width / height - 16 / 9) < 0.05) return "16:9";
  if (Math.abs(width / height - 21 / 9) < 0.05) return "21:9";
  if (Math.abs(width / height - 32 / 9) < 0.05) return "32:9";
  if (Math.abs(width / height - 16 / 10) < 0.05) return "16:10";
  if (Math.abs(width / height - 4 / 3) < 0.05) return "4:3";

  return `${rWidth}:${rHeight}`;
}

export function generateSlug(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const slugify = generateSlug;
