"use client";

import Link from "next/navigation";
import { useState, useEffect } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Menu,
  X,
  Heart,
  Flame,
  Clock,
  Grid,
  Layers,
  Sparkles,
  Monitor,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchModal } from "./SearchModal";
import { useFavorites } from "@/lib/favorites";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Wallpapers", href: "/wallpapers" },
  { name: "Categories", href: "/#categories" },
  { name: "Trending", href: "/trending", icon: Flame },
  { name: "Latest", href: "/latest", icon: Clock },
  { name: "Collections", href: "/collections", icon: Layers },
];

export function Navbar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count: favoritesCount, mounted } = useFavorites();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut Ctrl+K or / to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === "/" && !(e.target as HTMLElement)?.matches("input, textarea")) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-[#09090d]/80 backdrop-blur-xl border-b border-neutral-200/80 dark:border-neutral-800/80 shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <NextLink
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Monitor className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-neutral-950 via-neutral-800 to-neutral-600 dark:from-white dark:via-neutral-100 dark:to-neutral-300 bg-clip-text text-transparent">
                  WallPC
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wide">
                  4K
                </span>
              </div>
            </div>
          </NextLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <NextLink
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40"
                      : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50"
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 opacity-75" />}
                  <span>{link.name}</span>
                </NextLink>
              );
            })}
          </nav>

          {/* Right Action Icons (Search, Favorites, Theme Toggle - NO LOGIN!) */}
          <div className="flex items-center gap-2">
            {/* Search Trigger Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/60 text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700 hover:text-neutral-800 dark:hover:text-neutral-200 text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              aria-label="Search wallpapers"
            >
              <Search className="w-4 h-4 text-neutral-400" />
              <span className="hidden sm:inline">Search 4K...</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 bg-neutral-200/80 dark:bg-neutral-800 rounded">
                ⌘K
              </kbd>
            </button>

            {/* Local Favorites Link (Zero Account) */}
            <NextLink
              href="/favorites"
              className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md text-neutral-700 dark:text-neutral-300 hover:text-rose-500 hover:border-rose-500/40 transition-colors"
              title="My Favorites (Saved on this device)"
              aria-label="My Favorites"
            >
              <Heart className="w-4 h-4" />
              {mounted && favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#08080a] animate-in zoom-in">
                  {favoritesCount}
                </span>
              )}
            </NextLink>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-[#0c0c10]/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <NextLink
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
                      : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-indigo-500" />}
                  <span>{link.name}</span>
                </NextLink>
              );
            })}

            <NextLink
              href="/favorites"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>My Favorites</span>
              </div>
              {mounted && favoritesCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold text-white bg-rose-500 rounded-full">
                  {favoritesCount}
                </span>
              )}
            </NextLink>

            <div className="pt-2 px-3">
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                WallPC • No Login Required • Free 4K
              </p>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
