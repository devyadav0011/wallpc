"use client";

import { useState } from "react";
import { Share2, Link as LinkIcon, Check } from "lucide-react";

interface ShareDropdownProps {
  title: string;
  url?: string;
}

export function ShareDropdown({ title, url }: ShareDropdownProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const getFullUrl = () => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  };

  const handleNativeShare = async () => {
    const fullUrl = getFullUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `WallPC • ${title} (Free 4K Wallpaper)`,
          text: `Download ${title} in 4K resolution on WallPC with no login required.`,
          url: fullUrl,
        });
        return;
      } catch {
        // User cancelled or fallback
      }
    }
    setIsOpen(!isOpen);
  };

  const handleCopy = () => {
    const fullUrl = getFullUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fullUrl = encodeURIComponent(getFullUrl());
  const shareText = encodeURIComponent(`Download "${title}" 4K PC Wallpaper for free on WallPC (No Login Required): `);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={handleNativeShare}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121216] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 transition-colors shadow-sm"
        aria-label="Share wallpaper"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 bottom-full mb-2 w-56 rounded-2xl bg-white dark:bg-[#14141a] border border-neutral-200 dark:border-neutral-800 p-2 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-1">
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>{copied ? "Link Copied!" : "Copy Link"}</span>
              </div>
              {copied && <Check className="w-3.5 h-3.5 text-emerald-500" />}
            </button>

            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${fullUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
            >
              <span className="font-bold text-neutral-900 dark:text-white">𝕏</span>
              <span>Post on X</span>
            </a>

            <a
              href={`https://api.whatsapp.com/send?text=${shareText}${fullUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
            >
              <span className="text-emerald-500 font-bold">💬</span>
              <span>Share via WhatsApp</span>
            </a>

            <a
              href={`https://reddit.com/submit?url=${fullUrl}&title=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
            >
              <span className="text-orange-500 font-bold">🌐</span>
              <span>Share on Reddit</span>
            </a>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${fullUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
            >
              <span className="text-blue-500 font-bold">f</span>
              <span>Share on Facebook</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
