<<<<<<< HEAD
import { db } from "@/db";
import { contents, liveEvents } from "@/db/schema";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const [contentRows, liveRows] = await Promise.all([
    db.select({ slug: contents.slug, updatedAt: contents.updatedAt }).from(contents).limit(5000),
    db.select({ slug: liveEvents.slug, updatedAt: liveEvents.updatedAt }).from(liveEvents).limit(5000),
  ]);

  return [
    { url: `${base}/`, lastModified: new Date() },
    ...contentRows.map((row) => ({
      url: `${base}/content/${row.slug}`,
      lastModified: row.updatedAt,
    })),
    ...liveRows.map((row) => ({
      url: `${base}/live-events/${row.slug}`,
      lastModified: row.updatedAt,
    })),
  ];
=======
import type { MetadataRoute } from "next";
import { blogCatalog } from "@/features/blog/post-catalog";
import { toolCatalog, toolCategories } from "@/features/tools/tool-catalog";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["/", "/tools", "/blog"];

  const toolCategoryRoutes = toolCategories.map((category) => `/tools/${category.slug}`);
  const toolRoutes = toolCatalog.map((tool) => `/tools/tool/${tool.slug}`);
  const blogRoutes = blogCatalog.map((post) => `/blog/${post.slug}`);

  return [...staticRoutes, ...toolCategoryRoutes, ...toolRoutes, ...blogRoutes].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));
>>>>>>> 399ff1e16a62994408dc07945c77ad211ed6c355
}
