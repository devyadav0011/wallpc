"use client";

import { useState } from "react";
import { ShieldAlert, CheckCircle2, Send, FileText } from "lucide-react";

export default function CopyrightPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    wallpaperUrl: "",
    proofUrl: "",
    statement: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 text-neutral-700 dark:text-neutral-300">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>DMCA &amp; Content Rights</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white tracking-tight">
          Copyright &amp; Takedown Policy
        </h1>
        <p className="text-xs text-neutral-400">WallPC respects intellectual property rights</p>
      </div>

      <div className="space-y-4 text-sm leading-relaxed">
        <p>
          WallPC is a platform dedicated to desktop customization and photography appreciation. We respect the intellectual property rights of artists, photographers, and studios worldwide.
        </p>
        <p>
          If you are a copyright owner or authorized representative and believe that any content hosted on WallPC infringes upon your copyright, you may submit a takedown request below. We process valid requests promptly.
        </p>
      </div>

      {/* Takedown Form */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2.5 mb-6">
          <FileText className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Submit a DMCA Notice
          </h2>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Takedown Notice Received
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Our administration team has logged your submission and will review the designated URL within 24–48 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Your Full Name / Entity Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Copyright holder or agent name"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contact@copyright-holder.com"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                WallPC Wallpaper URL to Remove
              </label>
              <input
                type="url"
                required
                value={form.wallpaperUrl}
                onChange={(e) => setForm({ ...form, wallpaperUrl: e.target.value })}
                placeholder="https://wallpc.app/wallpapers/..."
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Proof of Original Work (Portfolio or Registration Link)
              </label>
              <input
                type="url"
                required
                value={form.proofUrl}
                onChange={(e) => setForm({ ...form, proofUrl: e.target.value })}
                placeholder="Link showing prior ownership or publication"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Statement of Good Faith
              </label>
              <textarea
                required
                rows={3}
                value={form.statement}
                onChange={(e) => setForm({ ...form, statement: e.target.value })}
                placeholder="I declare under penalty of perjury that I am authorized to act on behalf of the copyright owner..."
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>Submit Takedown Notice</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
