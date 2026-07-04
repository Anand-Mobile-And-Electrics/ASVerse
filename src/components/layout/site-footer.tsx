import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 dark:text-slate-300 sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} ASVerse. Free tools for developers, students, and creators.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/tools" className="hover:text-slate-900 dark:hover:text-white">
            Explore Tools
          </Link>
          <Link href="/blog" className="hover:text-slate-900 dark:hover:text-white">
            Read Blog
          </Link>
          <Link href="/rss.xml" className="hover:text-slate-900 dark:hover:text-white">
            RSS Feed
          </Link>
        </div>
      </div>
    </footer>
  );
}
