import { Metadata } from "next";
import { Shield, Lock, EyeOff } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — WallPC",
  description: "WallPC's transparent privacy policy: no user accounts, no tracking cookies, and local device storage.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 text-neutral-700 dark:text-neutral-300">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5" />
          <span>Zero User Tracking</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-neutral-400">Last updated: September 2026</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            1. No User Accounts Required
          </h2>
          <p>
            WallPC operates on a strict <strong>Zero-Login Principle</strong>. We do not require, collect, or store your name, email address, password, or profile information to browse, search, preview, or download desktop wallpapers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            2. Local Device Storage
          </h2>
          <p>
            When you favorite wallpapers using the heart button, your list of favorites is saved directly to your web browser&apos;s <code>localStorage</code> on your local device. This data never leaves your computer or browser and is not transmitted to our servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            3. Anonymous Aggregate Analytics
          </h2>
          <p>
            To understand which wallpapers are popular and maintain our trending algorithms, we collect anonymous aggregate metrics such as total wallpaper downloads, page views, and search terms. These events do not track individual users across the web or collect personally identifiable information (PII).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            4. Cookies
          </h2>
          <p>
            Standard visitors do not receive tracking or advertising cookies. The only functional cookie utilized is a local theme preference cookie (dark or light mode) and secure session tokens for verified site administrators.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            5. Contact Us
          </h2>
          <p>
            If you have questions regarding this Privacy Policy, you may contact us via our contact page.
          </p>
        </section>
      </div>
    </div>
  );
}
