import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { blogCatalog, blogTags } from "@/features/blog/post-catalog";
import { breadcrumbSchema, createMetadata, faqSchema } from "@/lib/seo";

type TagPageProps = {
  params: Promise<{ tag: string }>;
};

function normalize(value: string) {
  return decodeURIComponent(value).toLowerCase();
}

export function generateStaticParams() {
  return blogTags.map((tag) => ({ tag: encodeURIComponent(tag.toLowerCase()) }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const matched = blogTags.find((item) => item.toLowerCase() === normalize(tag));
  if (!matched) return createMetadata({ title: "Blog Tag", description: "Browse blog tags", path: "/blog" });
  return createMetadata({ title: `Tag: ${matched}`, description: `Read ASVerse posts tagged ${matched}.`, path: `/blog/tag/${encodeURIComponent(matched.toLowerCase())}` });
}

export default async function BlogTagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const matched = blogTags.find((item) => item.toLowerCase() === normalize(tag));

  if (!matched) notFound();

  const posts = blogCatalog.filter((post) => post.tags.includes(matched));

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Tag: {matched}</h1>
      <div className="mt-6 grid gap-4">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="font-medium text-slate-900 dark:text-white">{post.title}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{post.excerpt}</p>
          </Link>
        ))}
      </div>

      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: matched, path: `/blog/tag/${encodeURIComponent(matched.toLowerCase())}` }])} />
      <JsonLd data={faqSchema([{ question: `What does the tag ${matched} mean?`, answer: `It groups blog posts related to ${matched}.` }])} />
    </section>
  );
}
