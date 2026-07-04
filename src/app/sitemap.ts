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
}
