import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { getToolsByCategory, toolCategories } from "@/features/tools/tool-catalog";
import { breadcrumbSchema, createMetadata, faqSchema } from "@/lib/seo";
import type { ToolCategory } from "@/types/content";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

const allowedCategories = toolCategories.map((item) => item.slug) as ToolCategory[];

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const found = toolCategories.find((item) => item.slug === category);
  if (!found) return createMetadata({ title: "Tools", description: "Tool categories", path: "/tools" });
  return createMetadata({ title: found.name, description: found.description, path: `/tools/${found.slug}` });
}

export function generateStaticParams() {
  return allowedCategories.map((category) => ({ category }));
}

export const revalidate = 3600;

export default async function ToolCategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  if (!allowedCategories.includes(category as ToolCategory)) notFound();

  const tools = getToolsByCategory(category as ToolCategory);
  const categoryName = toolCategories.find((item) => item.slug === category)?.name ?? "Tools";

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{categoryName}</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">All tools in this category are free and publicly accessible.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.slug} href={`/tools/tool/${tool.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="font-medium text-slate-900 dark:text-white">{tool.name}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{tool.description}</p>
          </Link>
        ))}
      </div>

      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Tools", path: "/tools" }, { name: categoryName, path: `/tools/${category}` }])} />
      <JsonLd data={faqSchema([{ question: `How to use ${categoryName}?`, answer: `Open any ${categoryName.toLowerCase()} page and use it instantly without signup.` }])} />
    </section>
  );
}
