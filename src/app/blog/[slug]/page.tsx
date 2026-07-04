import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { blogCatalog, getPostBySlug } from "@/features/blog/post-catalog";
import { getToolBySlug } from "@/features/tools/tool-catalog";
import { breadcrumbSchema, createMetadata, faqSchema } from "@/lib/seo";

type BlogDetailProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return createMetadata({ title: "Post not found", description: "This article does not exist.", path: "/blog" });
  }

  return createMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: "article",
  });
}

export function generateStaticParams() {
  return blogCatalog.map((post) => ({ slug: post.slug }));
}

export const revalidate = 3600;

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const relatedPosts = blogCatalog.filter((item) => item.slug !== post.slug && (item.category === post.category || item.tags.some((tag) => post.tags.includes(tag)))).slice(0, 3);
  const relatedTools = post.relatedToolSlugs.map((slug) => getToolBySlug(slug)).filter((tool) => Boolean(tool));

  return (
    <article className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_260px] lg:px-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{post.category}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{post.title}</h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">By {post.author} • Updated {post.updatedAt} • {post.readingMinutes} min read</p>

        <p className="mt-6 text-slate-700 dark:text-slate-200">{post.excerpt}</p>

        <div className="mt-8 space-y-7">
          {post.sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{section.heading}</h2>
              <p className="mt-2 text-slate-700 dark:text-slate-200">{section.content}</p>
            </section>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">FAQs</h2>
          <div className="mt-3 space-y-3">
            {post.faqs.map((item) => (
              <details key={item.question} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <summary className="cursor-pointer font-medium text-slate-900 dark:text-white">{item.question}</summary>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {relatedTools.length ? (
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Related tools</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {relatedTools.map((tool) => (
                <Link key={tool!.slug} href={`/tools/tool/${tool!.slug}`} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="font-medium text-slate-900 dark:text-white">{tool!.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{tool!.description}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {relatedPosts.length ? (
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Related posts</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {relatedPosts.map((item) => (
                <Link key={item.slug} href={`/blog/${item.slug}`} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{item.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Table of contents</p>
        <ul className="mt-3 space-y-2 text-sm">
          {post.sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">{section.heading}</a>
            </li>
          ))}
        </ul>
      </aside>

      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }])} />
      <JsonLd data={faqSchema(post.faqs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          dateModified: post.updatedAt,
          author: { "@type": "Person", name: post.author },
        }}
      />
    </article>
  );
}
