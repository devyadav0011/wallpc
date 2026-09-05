"use client";

import { useState } from "react";
import { SlidersHorizontal, X, RotateCcw, Check, Sparkles, Monitor, Grid } from "lucide-react";
import { OrientationFilter, ResolutionFilter, SortFilter } from "@/lib/types";

interface FilterBarProps {
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedResolution: string;
  onResolutionChange: (res: string) => void;
  selectedOrientation: string;
  onOrientationChange: (ori: string) => void;
  selectedSort: SortFilter;
  onSortChange: (sort: SortFilter) => void;
  categories: Array<{ id: string; name: string; slug: string }>;
  onReset: () => void;
}

const RESOLUTIONS = [
  { label: "All Resolutions", value: "all" },
  { label: "4K (3840×2160)", value: "3840x2160" },
  { label: "1440p (2560×1440)", value: "2560x1440" },
  { label: "1080p (1920×1080)", value: "1920x1080" },
  { label: "Ultrawide (3440×1440)", value: "3440x1440" },
  { label: "Super Ultrawide (5120×1440)", value: "5120x1440" },
  { label: "8K UHD (7680×4320)", value: "7680x4320" },
];

const ORIENTATIONS = [
  { label: "All Orientations", value: "all" },
  { label: "Landscape (16:9)", value: "landscape" },
  { label: "Ultrawide (21:9 & 32:9)", value: "ultrawide" },
  { label: "Portrait", value: "portrait" },
];

const SORTS: Array<{ label: string; value: SortFilter }> = [
  { label: "Trending", value: "trending" },
  { label: "Most Downloaded", value: "popular" },
  { label: "Newest", value: "newest" },
  { label: "Most Viewed", value: "views" },
];

export function FilterBar({
  selectedCategory,
  onCategoryChange,
  selectedResolution,
  onResolutionChange,
  selectedOrientation,
  onOrientationChange,
  selectedSort,
  onSortChange,
  categories,
  onReset,
}: FilterBarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedResolution !== "all" ? 1 : 0) +
    (selectedOrientation !== "all" ? 1 : 0);

  return (
    <div className="space-y-4 mb-6 sm:mb-8">
      {/* Top Filter & Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#111116] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-2.5 sm:p-3 shadow-sm">
        {/* Category horizontal scrolling tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full lg:max-w-3xl">
          <button
            onClick={() => onCategoryChange("all")}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-colors ${
              selectedCategory === "all"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                : "bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            All
          </button>
          {categories.slice(0, 10).map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.slug)}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium shrink-0 transition-colors ${
                selectedCategory === cat.slug
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                  : "bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Right Controls: Filter Drawer Trigger & Sort Dropdown */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Filter Drawer Toggle */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium transition-colors ${
              activeFiltersCount > 0
                ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500/40 text-indigo-600 dark:text-indigo-400"
                : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Select */}
          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value as SortFilter)}
              className="appearance-none px-3 py-1.5 pr-8 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value} className="bg-white dark:bg-neutral-900">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter Bottom Drawer / Modal */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#121217] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                  Filter Wallpapers
                </h3>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resolution Filter */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Resolution
              </p>
              <div className="grid grid-cols-2 gap-2">
                {RESOLUTIONS.map((res) => {
                  const isSelected = selectedResolution === res.value;
                  return (
                    <button
                      key={res.value}
                      onClick={() => onResolutionChange(res.value)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border text-left transition-colors ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      <span>{res.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Orientation Filter */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Orientation
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ORIENTATIONS.map((ori) => {
                  const isSelected = selectedOrientation === ori.value;
                  return (
                    <button
                      key={ori.value}
                      onClick={() => onOrientationChange(ori.value)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border text-left transition-colors ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      <span>{ori.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Category
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1">
                <button
                  onClick={() => onCategoryChange("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-indigo-600 text-white"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onCategoryChange(cat.slug)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === cat.slug
                        ? "bg-indigo-600 text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800 gap-3">
              <button
                onClick={() => {
                  onReset();
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All</span>
              </button>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
