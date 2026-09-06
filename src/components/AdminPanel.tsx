"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Upload,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Download,
  Check,
  X,
  Layers,
  Sparkles,
  Flame,
  AlertCircle,
  ExternalLink,
  LogOut,
  FolderPlus,
  Image as ImageIcon,
  CheckCircle2,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { formatCount, slugify } from "@/lib/utils";

interface AdminPanelProps {
  initialStats: any;
  initialWallpapers: any[];
  categories: any[];
  collections: any[];
}

interface DetectedSpecs {
  width: number;
  height: number;
  aspectRatio: string;
  orientation: "landscape" | "portrait" | "ultrawide";
  sizeFormatted: string;
  format: string;
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

function formatTitleFromFilename(filename: string): string {
  const withoutExt = filename.replace(/\.[^/.]+$/, "");
  return withoutExt
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function createThumbnail(file: File, maxDim = 800): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
      img.onload = () => {
        try {
          let { naturalWidth: width, naturalHeight: height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            URL.revokeObjectURL(objectUrl);
            return resolve(null);
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(objectUrl);
              resolve(blob);
            },
            "image/webp",
            0.85
          );
        } catch {
          URL.revokeObjectURL(objectUrl);
          resolve(null);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

export function AdminPanel({
  initialStats,
  initialWallpapers,
  categories: initialCategories,
  collections: initialCollections,
}: AdminPanelProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"wallpapers" | "upload" | "categories" | "collections">("wallpapers");
  const [wallpapers, setWallpapers] = useState(initialWallpapers);
  const [categories, setCategories] = useState(initialCategories);
  const [collections, setCollections] = useState(initialCollections);
  const [stats, setStats] = useState(initialStats);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [detectedSpecs, setDetectedSpecs] = useState<DetectedSpecs | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadStage, setUploadStage] = useState<"" | "preparing" | "uploading" | "publishing" | "complete">("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<any | null>(null);

  // Metadata Form State
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    categoryId: categories[0]?.id || categories[0]?.slug || "nature",
    tags: "4k, pc, desktop, wallpaper",
    featured: false,
    trending: false,
    published: true,
    creatorName: "",
    creatorUrl: "",
    license: "Free for personal desktop use",
  });

  // Category state
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    coverImage: "",
  });

  // Collection state
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
    coverImage: "",
    featured: false,
  });

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  const handleFileSelect = (file: File) => {
    setValidationError(null);
    setUploadError(null);
    setUploadSuccess(null);

    const validMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setValidationError(
        `Unsupported file type (${file.type || "unknown"}). Please choose a JPG, PNG, or WebP image.`
      );
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setValidationError(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 25 MB limit.`
      );
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.src = objectUrl;

    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      if (width < 1280 || height < 720) {
        setValidationError(
          `Image resolution (${width}×${height}) is too low. Recommended minimum resolution is 1920×1080.`
        );
        URL.revokeObjectURL(objectUrl);
        return;
      }

      const ratio = width / height;
      const orientation: "landscape" | "portrait" | "ultrawide" =
        ratio >= 2.1 ? "ultrawide" : ratio < 1 ? "portrait" : "landscape";
      const aspectRatio = calculateAspectRatio(width, height);
      const sizeFormatted = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      setSelectedFile(file);
      setFilePreview(objectUrl);
      setDetectedSpecs({
        width,
        height,
        aspectRatio,
        orientation,
        sizeFormatted,
        format: file.type.split("/")[1]?.toUpperCase() || "WEBP",
      });

      // Auto-populate title if empty
      if (!uploadForm.title.trim()) {
        setUploadForm((prev) => ({
          ...prev,
          title: formatTitleFromFilename(file.name),
        }));
      }
    };

    img.onerror = () => {
      setValidationError("Failed to read image. The file may be corrupted or invalid.");
      URL.revokeObjectURL(objectUrl);
    };
  };

  const handleRemoveFile = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setSelectedFile(null);
    setFilePreview(null);
    setDetectedSpecs(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetUploadWorkflow = () => {
    handleRemoveFile();
    setUploadSuccess(null);
    setUploadError(null);
    setUploadStage("");
    setUploadProgress(0);
    setUploadForm({
      title: "",
      description: "",
      categoryId: categories[0]?.id || categories[0]?.slug || "nature",
      tags: "4k, pc, desktop, wallpaper",
      featured: false,
      trending: false,
      published: true,
      creatorName: "",
      creatorUrl: "",
      license: "Free for personal desktop use",
    });
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !detectedSpecs) {
      setValidationError("Please select or drop an image file first.");
      return;
    }

    if (!uploadForm.title.trim()) {
      setValidationError("Please provide a title for the wallpaper.");
      return;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      // Step 1: Preparing image & generating thumbnail
      setUploadStage("preparing");
      setUploadProgress(20);
      const thumbBlob = await createThumbnail(selectedFile, 800);

      // Step 2: Uploading original wallpaper to storage
      setUploadStage("uploading");
      setUploadProgress(45);

      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);
      if (thumbBlob) {
        uploadFormData.append("thumbnail", thumbBlob, "thumbnail.webp");
      }
      uploadFormData.append("width", detectedSpecs.width.toString());
      uploadFormData.append("height", detectedSpecs.height.toString());

      const uploadRes = await fetch("/api/admin/wallpapers/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json().catch(() => ({}));
        throw new Error(errData.error || `Upload failed with status ${uploadRes.status}`);
      }

      const uploadResult = await uploadRes.json();
      setUploadProgress(75);

      // Step 3: Registering wallpaper and publishing to public gallery
      setUploadStage("publishing");

      const tagsArray = uploadForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const createRes = await fetch("/api/admin/wallpapers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadForm.title,
          description: uploadForm.description,
          categoryId: uploadForm.categoryId,
          fileUrl: uploadResult.fileUrl,
          fileUrl4k: uploadResult.fileUrl,
          fileUrl1440p: uploadResult.fileUrl,
          fileUrl1080p: uploadResult.fileUrl,
          thumbnailUrl: uploadResult.thumbnailUrl,
          previewUrl: uploadResult.fileUrl,
          resolutionWidth: uploadResult.width,
          resolutionHeight: uploadResult.height,
          orientation: uploadResult.orientation,
          fileType: uploadResult.fileType,
          fileSize: uploadResult.fileSize,
          tags: tagsArray,
          featured: uploadForm.featured,
          trending: uploadForm.trending,
          published: uploadForm.published,
          license: uploadForm.license,
          creatorName: uploadForm.creatorName,
          creatorUrl: uploadForm.creatorUrl,
        }),
      });

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to publish wallpaper in catalog");
      }

      const createData = await createRes.json();
      setUploadProgress(100);
      setUploadStage("complete");

      // Update state
      setWallpapers([createData.wallpaper, ...wallpapers]);
      setStats((prev: any) => ({
        ...prev,
        totalWallpapers: (prev?.totalWallpapers || wallpapers.length) + 1,
        newUploads: (prev?.newUploads || 0) + 1,
      }));

      setUploadSuccess(createData.wallpaper);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Upload and publish failed.");
      setUploadStage("");
      setUploadProgress(0);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteWallpaper = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this wallpaper? This will also remove the image from storage.")) return;
    try {
      const res = await fetch(`/api/admin/wallpapers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setWallpapers(wallpapers.filter((w) => w.id !== id));
        setStats((prev: any) => ({
          ...prev,
          totalWallpapers: Math.max(0, (prev?.totalWallpapers || wallpapers.length) - 1),
        }));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleTogglePublish = async (wallpaper: any) => {
    try {
      const res = await fetch(`/api/admin/wallpapers/${wallpaper.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !wallpaper.published }),
      });
      if (res.ok) {
        setWallpapers(
          wallpapers.map((w) =>
            w.id === wallpaper.id ? { ...w, published: !w.published } : w
          )
        );
      }
    } catch (err) {
      console.error("Publish toggle failed:", err);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });
      if (res.ok) {
        const data = await res.json();
        setCategories([...categories, data.category]);
        setNewCategory({ name: "", description: "", coverImage: "" });
        alert("Category created!");
      }
    } catch (err) {
      console.error("Create category error:", err);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCollection),
      });
      if (res.ok) {
        const data = await res.json();
        setCollections([...collections, data.collection]);
        setNewCollection({
          name: "",
          description: "",
          coverImage: "",
          featured: false,
        });
        alert("Collection created!");
      }
    } catch (err) {
      console.error("Create collection error:", err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white flex items-center gap-2">
            <span>WallPC Admin Hub</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20">
              Direct Upload
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage wallpapers, categories, and direct file uploads. No external URLs needed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1.5 transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] space-y-1">
          <p className="text-xs font-semibold text-neutral-500">Wallpapers</p>
          <p className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white">
            {stats.totalWallpapers}
          </p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] space-y-1">
          <p className="text-xs font-semibold text-neutral-500">Total Downloads</p>
          <p className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {formatCount(stats.totalDownloads)}
          </p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] space-y-1">
          <p className="text-xs font-semibold text-neutral-500">Total Views</p>
          <p className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white">
            {formatCount(stats.totalViews)}
          </p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] space-y-1">
          <p className="text-xs font-semibold text-neutral-500">Categories</p>
          <p className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white">
            {stats.totalCategories}
          </p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] space-y-1">
          <p className="text-xs font-semibold text-neutral-500">New (7 Days)</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-500">
            +{stats.newUploads}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab("wallpapers")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === "wallpapers"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          Wallpapers ({wallpapers.length})
        </button>
        <button
          onClick={() => setActiveTab("upload")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "upload"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Wallpaper</span>
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === "categories"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab("collections")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === "collections"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          Collections ({collections.length})
        </button>
      </div>

      {/* Tab 1: Wallpapers Management Table */}
      {activeTab === "wallpapers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              All Wallpapers Catalog
            </h2>
            <button
              onClick={() => setActiveTab("upload")}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload New</span>
            </button>
          </div>

          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Wallpaper</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Resolution</th>
                    <th className="p-4">Downloads</th>
                    <th className="p-4">Views</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  {wallpapers.map((w) => (
                    <tr key={w.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-8 rounded-lg overflow-hidden bg-neutral-800 shrink-0 border border-neutral-200 dark:border-neutral-800">
                            <Image
                              src={w.thumbnailUrl || w.thumbnail || w.previewUrl || w.fileUrl || w.image}
                              alt={w.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900 dark:text-white line-clamp-1">
                              {w.title}
                            </p>
                            <p className="text-[11px] text-neutral-400 font-mono">
                              /{w.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-neutral-600 dark:text-neutral-400">
                        {w.category?.name || w.category || "General"}
                      </td>
                      <td className="p-4 font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
                        {w.resolutionWidth || w.width}×{w.resolutionHeight || w.height}
                      </td>
                      <td className="p-4 font-semibold text-indigo-600 dark:text-indigo-400">
                        {formatCount(w.downloads || 0)}
                      </td>
                      <td className="p-4 text-neutral-500">
                        {formatCount(w.views || 0)}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleTogglePublish(w)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                            w.published
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-300"
                          }`}
                        >
                          {w.published ? "Published" : "Draft"}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={`/wallpapers/${w.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            title="Preview page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDeleteWallpaper(w.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Upload Wallpaper (Direct Local File Upload) */}
      {activeTab === "upload" && (
        <div className="max-w-3xl bg-white dark:bg-[#111116] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-500" />
                <span>Upload Wallpaper File</span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Drag and drop an image file from your computer or browse. WallPC will automatically detect dimensions, orientation, and generate optimized thumbnails.
              </p>
            </div>
            {uploadSuccess && (
              <button
                onClick={resetUploadWorkflow}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 transition-colors"
              >
                New Upload
              </button>
            )}
          </div>

          {/* Validation & Error Alerts */}
          {validationError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {uploadError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Success Banner */}
          {uploadSuccess && (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                    Wallpaper Published Successfully!
                  </h3>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                    &ldquo;{uploadSuccess.title}&rdquo; is now live in the public gallery.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={`/wallpapers/${uploadSuccess.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                >
                  <span>View Wallpaper on WallPC</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={resetUploadWorkflow}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  Upload Another
                </button>
                <button
                  onClick={() => setActiveTab("wallpapers")}
                  className="px-4 py-2 rounded-xl text-neutral-500 text-xs font-semibold hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Manage All Wallpapers
                </button>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          {!uploadSuccess && (
            <form onSubmit={handleUploadSubmit} className="space-y-6 text-xs sm:text-sm">
              {/* SECTION 1: DRAG & DROP FILE UPLOADER */}
              {!filePreview ? (
                <div
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files?.[0]) {
                      handleFileSelect(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                    isDragging
                      ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
                      : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 hover:border-indigo-500/50 hover:bg-indigo-500/5"
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-1">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900 dark:text-white text-base">
                      Drag & Drop wallpaper here
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      or click to browse image from your computer
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2.5 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                      JPG
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                      PNG
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                      WEBP
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Max size: 25MB • Minimum: 1920×1080
                  </p>
                </div>
              ) : (
                /* SECTION 2: INTERACTIVE PREVIEW & DETECTED METADATA */
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-950 group">
                    <div className="relative w-full aspect-video">
                      <Image
                        src={filePreview}
                        alt="Selected wallpaper preview"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>

                    {/* Overlay Action Buttons */}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black text-white text-xs font-semibold backdrop-blur-md transition-colors flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Change Image</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white backdrop-blur-md transition-colors"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Detected Specs Badges Bar */}
                    {detectedSpecs && (
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-500/80 text-white font-mono text-[11px] font-bold backdrop-blur-md">
                          {detectedSpecs.width} × {detectedSpecs.height}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-neutral-800/80 text-neutral-200 text-[11px] font-semibold backdrop-blur-md">
                          Ratio: {detectedSpecs.aspectRatio}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-neutral-800/80 text-neutral-200 text-[11px] font-semibold capitalize backdrop-blur-md">
                          {detectedSpecs.orientation}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-neutral-800/80 text-neutral-200 text-[11px] font-semibold backdrop-blur-md">
                          {detectedSpecs.sizeFormatted}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-neutral-800/80 text-neutral-200 text-[11px] font-semibold uppercase backdrop-blur-md">
                          {detectedSpecs.format}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
                    <span className="truncate">File: {selectedFile?.name}</span>
                    <span>✓ Ready for publishing</span>
                  </p>
                </div>
              )}

              {/* SECTION 3: METADATA FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Wallpaper Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    placeholder="e.g. Cyberpunk Rainy Tokyo"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={uploadForm.categoryId}
                    onChange={(e) => setUploadForm({ ...uploadForm, categoryId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    {categories.map((c) => (
                      <option key={c.id || c.slug} value={c.id || c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Atmospheric caption for desktop wallpaper..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Comma-separated Tags
                </label>
                <input
                  type="text"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                  placeholder="cyberpunk, neon, rain, 4k, desktop"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Creator / Artist Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={uploadForm.creatorName}
                    onChange={(e) => setUploadForm({ ...uploadForm, creatorName: e.target.value })}
                    placeholder="e.g. WallPC Studio"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    License
                  </label>
                  <input
                    type="text"
                    value={uploadForm.license}
                    onChange={(e) => setUploadForm({ ...uploadForm, license: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Status Flags */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uploadForm.published}
                    onChange={(e) => setUploadForm({ ...uploadForm, published: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Publish Immediately</span>
                </label>

                <label className="flex items-center gap-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uploadForm.featured}
                    onChange={(e) => setUploadForm({ ...uploadForm, featured: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Feature on Homepage</span>
                </label>

                <label className="flex items-center gap-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uploadForm.trending}
                    onChange={(e) => setUploadForm({ ...uploadForm, trending: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Mark as Trending</span>
                </label>
              </div>

              {/* Upload Stepped Progress Bar */}
              {uploadLoading && (
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <span>
                      {uploadStage === "preparing" && "1/3 Analyzing image & generating thumbnail..."}
                      {uploadStage === "uploading" && "2/3 Uploading original wallpaper to storage..."}
                      {uploadStage === "publishing" && "3/3 Registering wallpaper and publishing to public gallery..."}
                      {uploadStage === "complete" && "Complete! Wallpaper published."}
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-indigo-200 dark:bg-indigo-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploadLoading || !selectedFile}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-lg text-sm sm:text-base ${
                  uploadLoading || !selectedFile
                    ? "bg-neutral-300 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-[0.99]"
                }`}
              >
                <Upload className={`w-5 h-5 ${uploadLoading ? "animate-bounce" : ""}`} />
                <span>
                  {uploadLoading
                    ? "Publishing Wallpaper to WallPC..."
                    : "Publish Wallpaper to WallPC"}
                </span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab 3: Categories */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] space-y-4 max-w-xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-indigo-500" />
              <span>Add New Category</span>
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs sm:text-sm">
              <input
                type="text"
                required
                placeholder="Category Name (e.g. Vintage)"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white"
              />
              <input
                type="url"
                required
                placeholder="Cover Image URL"
                value={newCategory.coverImage}
                onChange={(e) => setNewCategory({ ...newCategory, coverImage: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white"
              />
              <textarea
                rows={2}
                required
                placeholder="SEO description..."
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white resize-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              >
                Create Category
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((c) => (
              <div
                key={c.id || c.slug}
                className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] space-y-1"
              >
                <p className="font-bold text-neutral-900 dark:text-white">{c.name}</p>
                <p className="text-xs text-neutral-400">/{c.slug}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Collections */}
      {activeTab === "collections" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] space-y-4 max-w-xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-500" />
              <span>Create New Collection</span>
            </h3>
            <form onSubmit={handleCreateCollection} className="space-y-3 text-xs sm:text-sm">
              <input
                type="text"
                required
                placeholder="Collection Name"
                value={newCollection.name}
                onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white"
              />
              <input
                type="url"
                required
                placeholder="Cover Image URL"
                value={newCollection.coverImage}
                onChange={(e) => setNewCollection({ ...newCollection, coverImage: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white"
              />
              <textarea
                rows={2}
                required
                placeholder="Collection description..."
                value={newCollection.description}
                onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white resize-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
              >
                Create Collection
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {collections.map((col) => (
              <div
                key={col.id || col.slug}
                className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] space-y-1"
              >
                <p className="font-bold text-neutral-900 dark:text-white">{col.name}</p>
                <p className="text-xs text-neutral-400">/{col.slug}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
