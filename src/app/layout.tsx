import type { Metadata } from "next";
import type { ReactNode } from "react";
<<<<<<< HEAD
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "ASVerse Play | Open OTT Streaming Platform",
    template: "%s | ASVerse Play",
  },
  description:
    "ASVerse Play is a scalable open-source OTT platform for movies, series, anime, live events, IPTV, and more with secure RBAC and modern streaming architecture.",
  openGraph: {
    title: "ASVerse Play",
    description: "Modular enterprise OTT streaming platform.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ASVerse Play",
    description: "Open OTT streaming platform with full admin control.",
  },
  alternates: { canonical: "/" },
=======
import { TrackingScripts } from "@/components/analytics/tracking-scripts";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.domain),
  title: {
    default: "ASVerse | Free Online Tools and Technical Guides",
    template: "%s | ASVerse",
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    title: "ASVerse | Free Online Tools and Technical Guides",
    description: siteConfig.description,
    url: siteConfig.domain,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "ASVerse | Free Online Tools and Technical Guides",
    description: siteConfig.description,
  },
>>>>>>> 399ff1e16a62994408dc07945c77ad211ed6c355
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
<<<<<<< HEAD
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
          <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
            <a href="/" className="text-xl font-bold tracking-tight text-white">
              ASVerse <span className="text-indigo-400">Play</span>
            </a>
            <div className="flex items-center gap-4 text-sm text-slate-300">
              <a href="/auth" className="hover:text-white">
                Auth
              </a>
              <a href="/admin" className="hover:text-white">
                Admin
              </a>
            </div>
          </nav>
        </header>
        {children}
=======
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <TrackingScripts />
>>>>>>> 399ff1e16a62994408dc07945c77ad211ed6c355
      </body>
    </html>
  );
}
