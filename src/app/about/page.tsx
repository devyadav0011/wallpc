import { Metadata } from "next";
import Link from "next/link";
import { Monitor, Zap, ShieldCheck, Heart, Sparkles, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "About WallPC — 4K Wallpapers Without The Hassle",
  description:
    "Learn about WallPC's mission: delivering stunning 4K and ultrawide PC wallpapers with zero registration, zero accounts, and direct downloads.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Mission</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 dark:text-white tracking-tight">
          4K Wallpapers. No Login. Just Download.
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          WallPC was created to fix the modern web wallpaper browsing experience: no fake countdown timers, no forced email subscriptions, and zero paywalls.
        </p>
      </div>

      {/* Core Principles Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
            100% No Login
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            You will never be blocked by a login screen, forced signup modal, or email capture popup. Open, discover, and download.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Monitor className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
            True 4K &amp; Ultrawide
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Curated resolutions including 3840×2160, 2560×1440, and 21:9 &amp; 32:9 panoramas tailored for enthusiast PC setups.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
            Fast Direct Downloads
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Clicking download delivers the asset immediately to your browser with no intermediate redirect chains or countdown traps.
          </p>
        </div>
      </div>

      {/* Narrative */}
      <div className="space-y-6 text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed border-t border-neutral-200 dark:border-neutral-800 pt-8">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Why WallPC?
        </h2>
        <p>
          Most wallpaper websites today are cluttered with invasive banner ads, deceptive &ldquo;Download&rdquo; buttons that redirect to adware, and aggressive prompts to sign up for accounts just to save a desktop image.
        </p>
        <p>
          We believe finding desktop art should feel effortless, delightful, and fast. WallPC is designed like modern software: minimal, dark-mode first, responsive across every device, and respectful of your privacy.
        </p>
        <p>
          Favorites are stored right on your machine via your browser&apos;s local storage, keeping your collection persistent without needing an account database.
        </p>
      </div>

      <div className="pt-4 text-center">
        <Link
          href="/wallpapers"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Compass className="w-4 h-4" />
          <span>Explore 4K Wallpapers</span>
        </Link>
      </div>
    </div>
  );
}
