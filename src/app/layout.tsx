import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { generateWebSiteJsonLd } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WallPC — 4K Wallpapers. No Login. Just Download.",
    template: "%s | WallPC",
  },
  description:
    "Discover and download free high-quality 4K, 1440p, and ultrawide PC wallpapers. No login, no signup, and no accounts required.",
  keywords: [
    "4K wallpapers",
    "PC wallpapers",
    "free desktop wallpapers",
    "no login wallpapers",
    "ultrawide wallpapers",
    "gaming wallpapers 4K",
    "anime wallpapers 4K",
    "cyberpunk wallpapers",
  ],
  authors: [{ name: "WallPC" }],
  creator: "WallPC",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://wallpc.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wallpc.app",
    title: "WallPC — 4K Wallpapers. No Login. Just Download.",
    description:
      "Beautiful 4K wallpapers for your PC, instantly. Free instant downloads without login or accounts.",
    siteName: "WallPC",
    images: [
      {
        url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&h=630&q=85",
        width: 1200,
        height: 630,
        alt: "WallPC 4K Wallpapers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WallPC — 4K Wallpapers. No Login. Just Download.",
    description: "Free high-quality 4K PC wallpapers. No account needed.",
    images: ["https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&h=630&q=85"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateWebSiteJsonLd();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white dark:bg-[#07070a] text-neutral-900 dark:text-neutral-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
