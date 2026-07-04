import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { blogCatalog, blogCategories, blogTags } from "@/features/blog/post-catalog";
import { breadcrumbSchema, createMetadata, faqSchema } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Blog",
  description: "Practical technical articles for developers, students, and creators.",
  path: "/blog",
});

export const revalidate = 3600;

export default function BlogIndexPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">ASVerse Blog</h1>
      <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">Educational content designed to support tools and build topical authority.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {blogCategories.map((category) => (
          <Link key={category} href={`/blog/category/${encodeURIComponent(category.toLowerCase())}`} className="rounded-full border border-slate-300 px-3 py-1 text-xs dark:border-slate-700">
            {category}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {blogCatalog.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{post.category}</p>
            <h2 className="mt-2 font-medium text-slate-900 dark:text-white">{post.title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{post.excerpt}</p>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{post.readingMinutes} min read</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] dark:bg-slate-800">#{tag}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])} />
      <JsonLd data={faqSchema([{ question: "How often is the blog updated?", answer: "ASVerse publishes practical posts consistently to improve topical authority and user value." }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "ASVerse Blog",
          about: blogTags,
        }}
      />
    </section>
  );
}
