"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle2, MessageSquare, HelpCircle } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Wallpaper Submission",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Get in Touch</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 dark:text-white tracking-tight">
          Contact WallPC
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto">
          Have feedback, an inquiry, or want to suggest new wallpaper collections? Send us a message.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <div className="md:col-span-7 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] p-6 sm:p-8 shadow-xl">
          {submitted ? (
            <div className="py-12 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                Message Sent!
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto">
                Thank you for reaching out to the WallPC team. We review community submissions and feedback regularly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Mercer"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Topic
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  <option value="Wallpaper Submission">Wallpaper Submission</option>
                  <option value="Feature Suggestion">Feature Suggestion</option>
                  <option value="DMCA & Copyright Notice">DMCA &amp; Copyright Notice</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Partnership / Sponsorship">Partnership / Sponsorship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us what's on your mind..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>

        {/* FAQ sidebar */}
        <div className="md:col-span-5 space-y-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            <span>Frequently Asked Questions</span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] space-y-1">
              <p className="font-semibold text-neutral-900 dark:text-white">
                Do I really not need an account?
              </p>
              <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-xs">
                Yes! Every single wallpaper can be downloaded in 4K resolution directly with zero signup.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] space-y-1">
              <p className="font-semibold text-neutral-900 dark:text-white">
                How do I save my favorites?
              </p>
              <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-xs">
                Click the heart icon on any card or detail page. Favorites are saved in your browser&apos;s localStorage on your device.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111116] space-y-1">
              <p className="font-semibold text-neutral-900 dark:text-white">
                Can I submit my artwork?
              </p>
              <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-xs">
                Yes! Select &ldquo;Wallpaper Submission&rdquo; above and include a link to your high-resolution 4K portfolio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
