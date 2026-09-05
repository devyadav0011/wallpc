import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — WallPC",
  description: "Terms of service for using the WallPC wallpaper platform.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 text-neutral-700 dark:text-neutral-300">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-neutral-400">Last updated: September 2026</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using WallPC, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            2. License and Permitted Use
          </h2>
          <p>
            Wallpapers provided on WallPC are intended for personal, non-commercial desktop, laptop, mobile, and monitor background use. You may not re-distribute, resell, or claim ownership over downloaded images unless authorized by the respective artist or creator.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            3. Intellectual Property Rights
          </h2>
          <p>
            All original WallPC platform code, brand assets, logos, and UI designs are the intellectual property of WallPC. Wallpapers displayed on the platform are uploaded by community members, licensed under public domain/creative commons licenses, or attributed to their respective artists.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            4. Disclaimer of Warranties
          </h2>
          <p>
            WallPC provides services on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, whether express or implied. We do not guarantee uninterrupted or error-free service.
          </p>
        </section>
      </div>
    </div>
  );
}
