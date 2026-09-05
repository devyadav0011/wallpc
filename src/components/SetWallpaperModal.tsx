"use client";

import { useState } from "react";
import { Monitor, Apple, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";

export function SetWallpaperModal() {
  const [activeTab, setActiveTab] = useState<"windows" | "mac">("windows");

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#121217]/50 p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-500" />
          <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            How to Set as Desktop Wallpaper
          </h4>
        </div>

        {/* OS Switcher */}
        <div className="inline-flex rounded-xl bg-neutral-200/80 dark:bg-neutral-800 p-0.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("windows")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors ${
              activeTab === "windows"
                ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Windows</span>
          </button>
          <button
            onClick={() => setActiveTab("mac")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors ${
              activeTab === "mac"
                ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>macOS</span>
          </button>
        </div>
      </div>

      {/* Windows Guide */}
      {activeTab === "windows" && (
        <ol className="space-y-2.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
          <li className="flex items-start gap-2.5">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0 mt-0.5">
              1
            </span>
            <span>Click <strong>Download 4K</strong> above to save the image to your Downloads folder.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0 mt-0.5">
              2
            </span>
            <span>Open your Downloads folder, <strong>right-click</strong> the image, and select <strong>Set as desktop background</strong>.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0 mt-0.5">
              3
            </span>
            <span>For dual monitor or ultrawide screens: go to <em>Settings &gt; Personalization &gt; Background</em> and choose <strong>Fit: Span</strong> or <strong>Fill</strong>.</span>
          </li>
        </ol>
      )}

      {/* macOS Guide */}
      {activeTab === "mac" && (
        <ol className="space-y-2.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
          <li className="flex items-start gap-2.5">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0 mt-0.5">
              1
            </span>
            <span>Click <strong>Download 4K</strong> to save the wallpaper to your Mac.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0 mt-0.5">
              2
            </span>
            <span>Locate the downloaded file in <strong>Finder</strong>, right-click (or Control-click) it, and choose <strong>Services &gt; Set Desktop Picture</strong>.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0 mt-0.5">
              3
            </span>
            <span>Alternatively, open <em>System Settings &gt; Wallpaper</em>, click <strong>Add Photo</strong>, and select the wallpaper.</span>
          </li>
        </ol>
      )}
    </div>
  );
}
