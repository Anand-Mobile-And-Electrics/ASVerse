import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { ToolRenderer } from "@/features/tools/tool-renderer";
import { getToolBySlug, toolCatalog } from "@/features/tools/tool-catalog";
import { breadcrumbSchema, createMetadata, faqSchema } from "@/lib/seo";

type ToolPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) {
    return createMetadata({ title: "Tool not found", description: "Tool does not exist.", path: "/tools" });
  }
  return createMetadata({ title: tool.name, description: tool.description, path: `/tools/tool/${tool.slug}`, type: "article" });
}

export function generateStaticParams() {
  return toolCatalog.map((tool) => ({ slug: tool.slug }));
}

export const revalidate = 3600;

export default async function ToolDetailPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) notFound();

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: tool.name, path: `/tools/tool/${tool.slug}` },
  ]);

  const faq = faqSchema([
    { question: `Is ${tool.name} free to use?`, answer: `Yes, ${tool.name} is fully free and does not require login.` },
    { question: `Does ${tool.name} upload my data?`, answer: "No, this MVP processes most data in-browser for privacy and speed." },
  ]);

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{tool.category} tool</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{tool.name}</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">{tool.description}</p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
        <ToolRenderer slug={tool.slug} />
      </div>

      <Link href={`/tools/${tool.category}`} className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500">
        ← Back to {tool.category} tools
      </Link>

      <JsonLd data={breadcrumbs} />
      <JsonLd data={faq} />
    </section>
  );
}
