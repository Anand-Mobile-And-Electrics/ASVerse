import type { Metadata } from "next";
import type { ReactNode } from "react";
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
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <TrackingScripts />
      </body>
    </html>
  );
}
