# WallPC — 4K & Ultrawide Wallpapers for Desktop

**WallPC** is a production-ready, ultra-fast wallpaper platform dedicated exclusively to desktop setups (16:9 4K UHD, 21:9 & 32:9 Ultrawide, and Dual-Monitor setups). Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, Prisma, and PostgreSQL.

---

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router, Server Components & Server Actions)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide Icons
- **Database & ORM**: PostgreSQL (hosted on Supabase or Neon), Prisma ORM
- **Object Storage**: Vercel Blob, Supabase Storage, or AWS S3 / Cloudflare R2
- **Deployment**: Vercel-optimized (zero serverless cold-start bottlenecks, transaction safety, automatic base-data seeding)

---

## 🛠️ Getting Started

### 1. Prerequisites

- **Node.js**: v20+ or v24+
- **Database**: PostgreSQL database (Supabase, Neon, or local SQLite for development)

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/your-username/wallpc.git
cd wallpc

# Install dependencies
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your environment variables:

```env
# Database (PostgreSQL for production, or SQLite for local dev)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Admin Key for /admin dashboard authentication
ADMIN_SECRET_KEY="your-secure-admin-passkey"

# Storage Provider (Choose one for production)
# Option A: Vercel Blob
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Option B: Supabase Storage
# NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
# SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
# SUPABASE_STORAGE_BUCKET="wallpapers"
```

---

## 🗄️ Database Setup & Migration

### PostgreSQL (Production: Supabase / Neon)

WallPC is designed for PostgreSQL in production environments.

1. **Push Schema Directly**:
   ```bash
   npm run db:push
   ```
2. **Or Apply the Included Migration SQL**:
   Run the SQL script located at `prisma/migrations/0_init/migration.sql` in your Supabase or Neon SQL Editor.

3. **Automatic Base-Data Seeding**:
   The application automatically checks and provisions all **18 standard wallpaper categories** and **10 curated collections** on startup or when an admin enters the dashboard. You can also manually seed at any time:
   ```bash
   npm run db:seed
   ```

### Local Development (SQLite)

For zero-friction local development without an external database:
```env
DATABASE_URL="file:./dev.db"
```
The build script automatically configures SQLite for local development while enforcing PostgreSQL on Vercel deployments.

---

## 📤 Admin Panel & Wallpaper Upload

1. Navigate to `/admin` and log in with your configured `ADMIN_SECRET_KEY`.
2. Access the **Upload Wallpaper** tab:
   - **Local File Upload**: Drag and drop any image file (JPG, PNG, WEBP) or click "Choose Image".
   - **Client-side Inspection**: WallPC automatically detects exact pixel dimensions, aspect ratio, orientation, and file size.
   - **Transactional Database Persistence**: Wallpaper metadata and tags are saved inside an ACID transaction (`db.$transaction`).
   - **Storage Rollback**: If a database error occurs after file upload, the uploaded file is automatically cleaned up from storage to avoid orphan files.
   - **Auto-Revalidation**: Once saved, all public gallery pages (`/`, `/wallpapers`, `/latest`, `/trending`, and `/wallpapers/[slug]`) are instantly updated via Next.js cache revalidation.

---

## 🩺 System Health Diagnostics

Administrators can verify real-time platform health at `/api/admin/health`:
- **Database connectivity**: Reports connection status, provider (`postgresql` / `sqlite`), and record counts.
- **Storage connectivity**: Reports active storage provider (`vercel-blob`, `supabase`, `local`) and runtime environment.
- **Asset resolution & integrity**: Scans all catalog wallpapers to flag low resolutions (<1080p) or broken URLs.

---

## 📦 Production Build & Testing

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```
