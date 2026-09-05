# WallPC — 4K Wallpapers Platform

> **"4K Wallpapers. No Login. Just Download."**  
> *Beautiful 4K wallpapers for your PC, instantly.*

WallPC is a modern, high-performance platform designed for discovering and downloading free high-resolution (4K UHD, 1440p QHD, 1080p FHD, 21:9 Ultrawide, and 32:9 Super Ultrawide) desktop wallpapers with **NO login, NO signup, and NO account required**.

---

## Key Features

- ⚡ **Zero-Login Experience**: Visitors can browse, search, filter, preview, favorite, and download 4K wallpapers immediately without signing up or providing personal information.
- 🚀 **Zero-Config Vercel Deployment**: Deploys to Vercel instantly without requiring an external database. Uses typed repository architecture (`src/data/` + `src/lib/wallpaper-service.ts`) with lazy Prisma database connectivity.
- 🖥️ **Multi-Resolution Downloads**: Direct download support for **4K (3840×2160)**, **1440p (2560×1440)**, and **1080p (1920×1080)**, with auto fallback logic.
- 💾 **Local Favorites**: Bookmark wallpapers directly in your browser (`localStorage`) with real-time UI synchronization across components.
- 🔍 **Faceted Search & Filters**: Filter by 18 categories, exact resolutions (4K, 1440p, 1080p, Ultrawide, 8K), orientations (Landscape, Portrait, Ultrawide), and sort orders (Trending, Most Downloaded, Newest, Most Viewed).
- 🔥 **Dynamic Trending Algorithm**: Scores wallpapers using an activity-weighted formula: `trending_score = recent_downloads × 3 + recent_views × 1 + recency_bonus`.
- 🪟 **Desktop Setup Guides**: Step-by-step instructions for Windows 11/10 and macOS (Sonoma/Sequoia) directly on the wallpaper page.
- 🛡️ **Gated Admin Dashboard**: A protected `/admin` portal (with secret key authentication) for managing wallpapers, categories, and curating collections.
- 🚀 **Production-Grade SEO**: Dynamic `sitemap.xml`, `robots.txt`, and Google JSON-LD structured data (`ImageObject`, `WebSite`, `BreadcrumbList`).
- 🌓 **Dark-Mode First**: Premium obsidian dark palette with subtle glassmorphism, glowing accents, and smooth theme switching via `next-themes`.

---

## Tech Stack

- **Framework**: Next.js (App Router with Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, PostCSS, Lucide React icons
- **Theme**: `next-themes` (Obsidian dark default with light mode support)
- **Data Layer**: Typed in-memory repository (`src/data/`, `src/lib/wallpaper-service.ts`) + Prisma ORM (optional SQLite/PostgreSQL)
- **Image Optimization**: `next/image` with remote patterns enabled
- **Delight Effects**: `canvas-confetti`

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+ installed
- npm or pnpm

### 2. Installation & Setup

Clone the repository and install dependencies:
```bash
git clone <repo-url>
cd wallpc
npm install
```

### 3. Environment Variables

Create your local `.env` file (or copy from `.env.example`):
```bash
cp .env.example .env
```

Configuration in `.env`:
```env
# Optional: Database connection (leave empty or set for persistent DB writes)
DATABASE_URL="file:./dev.db"

# Admin portal access secret (set your own secret key)
ADMIN_SECRET_KEY="your-secure-admin-secret-key"

# Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup (Optional)

If running with a local SQLite database or PostgreSQL:
```bash
npx prisma db push
npm run db:seed
```

> **Note**: The public site operates out-of-the-box using the built-in typed data catalog (`src/data/wallpapers.ts`, `src/data/categories.ts`, `src/data/collections.ts`). A database is only needed if you want persistent database-backed admin mutations.

### 5. Start Development Server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Vercel Deployment

WallPC builds cleanly on Vercel with zero required configuration:
1. Connect your GitHub repository to Vercel.
2. Under Project Settings -> Environment Variables, add:
   - `ADMIN_SECRET_KEY`: A secure key of your choice.
   - `NEXT_PUBLIC_APP_URL`: Your production domain (e.g. `https://your-domain.vercel.app`).
   - `DATABASE_URL`: *(Optional)* Connection string for Supabase, Neon, or Railway PostgreSQL if database persistence is desired.
3. Deploy! The build will succeed without any database dependencies.

---

## Admin Dashboard

Navigate to `http://localhost:3000/admin` and log in with your configured `ADMIN_SECRET_KEY`.

From the control center you can:
- View live community metrics (Total Wallpapers, Downloads, Views, 7-Day New Uploads).
- Upload new wallpapers with automatic image dimension detection.
- Edit, delete, and toggle draft/published status.
- Create new categories and curated collections.

---

## Swapping to PostgreSQL / Supabase for Production

To switch from SQLite to PostgreSQL (e.g., Supabase or Neon):

1. In `prisma/schema.prisma`, update the datasource:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
2. Set your production `DATABASE_URL` in your environment:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```
3. Run migrations and seed:
```bash
npx prisma db push
npm run db:seed
```

---

## License

WallPC code is available under the MIT License. Wallpapers are provided under Creative Commons and Unsplash licenses for personal, non-commercial desktop use.

