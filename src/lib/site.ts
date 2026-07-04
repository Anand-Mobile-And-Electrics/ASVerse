import { toolCategories } from "@/features/tools/tool-catalog";

export const siteConfig = {
  name: "ASVerse",
  description:
    "ASVerse provides free online tools for developers, students, productivity, images, finance, SEO, converters, and PDF workflows.",
  domain: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  tagline: "Fast, free, SEO-first online tools and technical resources.",
  nav: [
    { href: "/", label: "Home" },
    { href: "/tools", label: "Tools" },
    { href: "/blog", label: "Blog" },
  ],
  toolCategories,
  social: {
    twitter: "@asverse",
  },
};

export function absoluteUrl(path: string) {
  return new URL(path, siteConfig.domain).toString();
}
