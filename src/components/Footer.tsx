import Link from "next/link";
import { Monitor, Download, ShieldCheck, Zap, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-850 bg-neutral-50/50 dark:bg-[#07070a]/90 text-neutral-600 dark:text-neutral-400 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <Monitor className="w-4 h-4 stroke-[2.4]" />
              </div>
              <span className="font-bold text-xl tracking-tight text-neutral-900 dark:text-white">
                WallPC
              </span>
            </Link>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm leading-relaxed">
              <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                4K Wallpapers. No Login. Just Download.
              </span>
              <br />
              Beautiful 4K wallpapers for your PC, instantly. Curated for desktop displays, ultrawide monitors, and creative battle-stations.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-200/60 dark:bg-neutral-800/60">
                <Zap className="w-3.5 h-3.5 text-indigo-500" />
                <span>Instant 4K Downloads</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-200/60 dark:bg-neutral-800/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero Accounts Required</span>
              </div>
            </div>
          </div>

          {/* Explore Col */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">
              Explore
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/wallpapers" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  All Wallpapers
                </Link>
              </li>
              <li>
                <Link href="/trending" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Trending Now
                </Link>
              </li>
              <li>
                <Link href="/latest" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Fresh Uploads
                </Link>
              </li>
              <li>
                <Link href="/popular" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Most Downloaded
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Curated Collections
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  My Favorites
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories Col */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">
              Popular Categories
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/category/cyberpunk" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Cyberpunk 4K
                </Link>
              </li>
              <li>
                <Link href="/category/gaming" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Gaming & Esports
                </Link>
              </li>
              <li>
                <Link href="/category/anime" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Anime Artwork
                </Link>
              </li>
              <li>
                <Link href="/category/cars" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Supercars & Speed
                </Link>
              </li>
              <li>
                <Link href="/category/nature" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Nature & Mountains
                </Link>
              </li>
              <li>
                <Link href="/resolution/ultrawide" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Ultrawide 21:9 & 32:9
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal Col */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">
              Company & Legal
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  About WallPC
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/copyright" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  DMCA & Copyright
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-200 dark:border-neutral-800/80 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 WallPC. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Built for fast desktop experiences. Free high-resolution downloads.
          </p>
        </div>
      </div>
    </footer>
  );
}
