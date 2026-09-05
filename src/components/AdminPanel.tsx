"use client";

import { useState } from "react";
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
} from "lucide-react";
import { formatCount, slugify } from "@/lib/utils";

interface AdminPanelProps {
  initialStats: any;
  initialWallpapers: any[];
  categories: any[];
  collections: any[];
}

export function AdminPanel({
  initialStats,
  initialWallpapers,
  categories: initialCategories,
  collections: initialCollections,
}: AdminPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"wallpapers" | "upload" | "categories" | "collections">("wallpapers");
  const [wallpapers, setWallpapers] = useState(initialWallpapers);
  const [categories, setCategories] = useState(initialCategories);
  const [collections, setCollections] = useState(initialCollections);
  const [stats, setStats] = useState(initialStats);

  // Upload state
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    categoryId: categories[0]?.id || "",
    fileUrl: "",
    resolutionWidth: 3840,
    resolutionHeight: 2160,
    fileType: "WEBP",
    fileSize: "6.2 MB",
    tags: "4k, pc, desktop",
    featured: false,
    trending: false,
    published: true,
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

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

  // Auto-detect dimensions when image URL is entered
  const handleImageUrlBlur = () => {
    if (!uploadForm.fileUrl) return;
    const img = new window.Image();
    img.src = uploadForm.fileUrl;
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setUploadForm((prev) => ({
          ...prev,
          resolutionWidth: img.naturalWidth,
          resolutionHeight: img.naturalHeight,
        }));
      }
    };
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadLoading(true);
    setUploadMsg("");

    try {
      const tagsArray = uploadForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/admin/wallpapers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...uploadForm,
          tags: tagsArray,
        }),
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      setWallpapers([data.wallpaper, ...wallpapers]);
      setUploadMsg("Wallpaper successfully published!");
      setUploadForm({
        title: "",
        description: "",
        categoryId: categories[0]?.id || "",
        fileUrl: "",
        resolutionWidth: 3840,
        resolutionHeight: 2160,
        fileType: "WEBP",
        fileSize: "6.2 MB",
        tags: "4k, pc, desktop",
        featured: false,
        trending: false,
        published: true,
      });
      setActiveTab("wallpapers");
    } catch (err: any) {
      setUploadMsg(err.message || "Failed to create wallpaper");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteWallpaper = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this wallpaper?")) return;
    try {
      const res = await fetch(`/api/admin/wallpapers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setWallpapers(wallpapers.filter((w) => w.id !== id));
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
        setNewCollection({ name: "", description: "", coverImage: "", featured: false });
        alert("Collection created!");
      }
    } catch (err) {
      console.error("Create collection error:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
            Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight">
            WallPC Control Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] space-y-1">
          <p className="text-xs font-semibold text-neutral-500">Total Wallpapers</p>
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
                          <div className="relative w-12 h-7 rounded-lg overflow-hidden bg-neutral-800 shrink-0">
                            <Image
                              src={w.thumbnailUrl || w.previewUrl || w.fileUrl}
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
                        {w.category?.name || "General"}
                      </td>
                      <td className="p-4 font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
                        {w.resolutionWidth}×{w.resolutionHeight}
                      </td>
                      <td className="p-4 font-semibold text-indigo-600 dark:text-indigo-400">
                        {formatCount(w.downloads)}
                      </td>
                      <td className="p-4 text-neutral-500">
                        {formatCount(w.views)}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleTogglePublish(w)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            w.published
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
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
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            title="Preview page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDeleteWallpaper(w.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10"
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

      {/* Tab 2: Upload Wallpaper */}
      {activeTab === "upload" && (
        <div className="max-w-2xl bg-white dark:bg-[#111116] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Upload New 4K Wallpaper
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Provide an image URL or cloud asset. Dimensions will be detected automatically.
            </p>
          </div>

          {uploadMsg && (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-semibold">
              {uploadMsg}
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Image Asset URL *
              </label>
              <input
                type="url"
                required
                value={uploadForm.fileUrl}
                onChange={(e) => setUploadForm({ ...uploadForm, fileUrl: e.target.value })}
                onBlur={handleImageUrlBlur}
                placeholder="https://images.unsplash.com/... or R2/S3 URL"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                    <option key={c.id} value={c.id}>
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
                placeholder="High-resolution wallpaper caption..."
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Resolution Width (px)
                </label>
                <input
                  type="number"
                  value={uploadForm.resolutionWidth}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, resolutionWidth: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Resolution Height (px)
                </label>
                <input
                  type="number"
                  value={uploadForm.resolutionHeight}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, resolutionHeight: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Comma-separated Tags
              </label>
              <input
                type="text"
                value={uploadForm.tags}
                onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                placeholder="cyberpunk, neon, rain, 4k"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadForm.published}
                  onChange={(e) => setUploadForm({ ...uploadForm, published: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Published</span>
              </label>

              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadForm.featured}
                  onChange={(e) => setUploadForm({ ...uploadForm, featured: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Featured</span>
              </label>

              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadForm.trending}
                  onChange={(e) => setUploadForm({ ...uploadForm, trending: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Trending</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={uploadLoading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/25"
            >
              <Upload className="w-4 h-4" />
              <span>{uploadLoading ? "Publishing..." : "Publish Wallpaper"}</span>
            </button>
          </form>
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
                key={c.id}
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
                key={col.id}
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
