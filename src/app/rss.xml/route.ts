import { blogCatalog } from "@/features/blog/post-catalog";
import { absoluteUrl, siteConfig } from "@/lib/site";

export async function GET() {
  const items = blogCatalog
    .map(
      (post) => `
      <item>
        <title><![CDATA[${post.title}]]></title>
        <link>${absoluteUrl(`/blog/${post.slug}`)}</link>
        <guid>${absoluteUrl(`/blog/${post.slug}`)}</guid>
        <pubDate>${new Date(post.updatedAt).toUTCString()}</pubDate>
        <description><![CDATA[${post.excerpt}]]></description>
      </item>`,
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title><![CDATA[${siteConfig.name} Blog]]></title>
        <link>${absoluteUrl("/blog")}</link>
        <description><![CDATA[${siteConfig.description}]]></description>
        ${items}
      </channel>
    </rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
