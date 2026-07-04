import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { toolCategories } from "@/features/tools/tool-catalog";
import { breadcrumbSchema, createMetadata, faqSchema } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "All Tools",
  description: "Browse all ASVerse online tool categories.",
  path: "/tools",
});

export const revalidate = 3600;

export default function ToolsPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">All tool categories</h1>
      <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">Choose a category and access free tools instantly—no sign-up required.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {toolCategories.map((category) => (
          <Link key={category.slug} href={`/tools/${category.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="font-medium text-slate-900 dark:text-white">{category.name}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{category.description}</p>
          </Link>
        ))}
      </div>

      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Tools", path: "/tools" }])} />
      <JsonLd
        data={faqSchema([
          { question: "Are tools mobile-friendly?", answer: "Yes, all tool pages are designed to work well on mobile and desktop." },
          { question: "Can I use tools without login?", answer: "Yes. Tools are publicly accessible in the MVP." },
        ])}
      />
    </section>
  );
}
