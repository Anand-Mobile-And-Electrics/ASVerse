import type { Metadata } from "next";
import Link from "next/link";
import { ToolSearch } from "@/components/home/tool-search";
import { JsonLd } from "@/components/seo/json-ld";
import { blogCatalog } from "@/features/blog/post-catalog";
import { toolCatalog, toolCategories } from "@/features/tools/tool-catalog";
import { breadcrumbSchema, createMetadata, faqSchema, websiteSchema } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Free Online Tools for Developers, Students, and Professionals",
  description:
    "Use ASVerse to access free developer utilities, calculators, productivity helpers, image/PDF tools, converters, finance, and SEO tools.",
  path: "/",
});

export const revalidate = 3600;

export default function HomePage() {
  const featuredTools = toolCatalog.slice(0, 8);
  const latestArticles = blogCatalog.slice(0, 3);

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-10">
          <p className="text-sm font-medium text-indigo-600">SEO-first tools platform</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Fast, free online tools and practical technical content.
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
            Build faster with instant utilities for development, academics, productivity, image/PDF workflows, finance, conversions, and SEO.
          </p>
          <ToolSearch />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tools" className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900">
              Explore tools
            </Link>
            <Link href="/blog" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900">
              Read articles
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Tool categories</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {toolCategories.map((category) => (
            <Link key={category.slug} href={`/tools/${category.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950">
              <h3 className="font-medium text-slate-900 dark:text-white">{category.name}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Featured tools</h2>
          <Link href="/tools" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">View all tools</Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredTools.map((tool) => (
            <Link key={tool.slug} href={`/tools/tool/${tool.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950">
              <h3 className="font-medium text-slate-900 dark:text-white">{tool.name}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{tool.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Latest articles</h2>
          <Link href="/blog" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">View all posts</Link>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {latestArticles.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{post.category}</p>
              <h3 className="mt-2 font-medium text-slate-900 dark:text-white">{post.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      <JsonLd data={websiteSchema()} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }])} />
      <JsonLd
        data={faqSchema([
          { question: "Are ASVerse tools free?", answer: "Yes, all MVP tools are free and publicly accessible." },
          { question: "Do I need an account?", answer: "No authentication is required for MVP usage." },
        ])}
      />
    </>
  );
}
