import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { blogCatalog, blogCategories } from "@/features/blog/post-catalog";
import { breadcrumbSchema, createMetadata, faqSchema } from "@/lib/seo";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

function normalize(value: string) {
  return decodeURIComponent(value).toLowerCase();
}

export function generateStaticParams() {
  return blogCategories.map((category) => ({ category: encodeURIComponent(category.toLowerCase()) }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const matched = blogCategories.find((item) => item.toLowerCase() === normalize(category));
  if (!matched) return createMetadata({ title: "Blog Category", description: "Browse blog categories", path: "/blog" });
  return createMetadata({ title: `Category: ${matched}`, description: `Read ${matched} articles on ASVerse.`, path: `/blog/category/${encodeURIComponent(matched.toLowerCase())}` });
}

export default async function BlogCategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const matched = blogCategories.find((item) => item.toLowerCase() === normalize(category));

  if (!matched) notFound();

  const posts = blogCatalog.filter((post) => post.category === matched);

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Category: {matched}</h1>
      <div className="mt-6 grid gap-4">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="font-medium text-slate-900 dark:text-white">{post.title}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{post.excerpt}</p>
          </Link>
        ))}
      </div>

      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: matched, path: `/blog/category/${encodeURIComponent(matched.toLowerCase())}` }])} />
      <JsonLd data={faqSchema([{ question: `What does ${matched} cover?`, answer: `${matched} posts focus on practical guides and beginner-friendly implementation steps.` }])} />
    </section>
  );
}
