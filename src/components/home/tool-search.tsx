"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { searchTools } from "@/features/tools/tool-catalog";

export function ToolSearch() {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => searchTools(query).slice(0, 8), [query]);

  return (
    <div className="mt-7">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search tools (JSON, GPA, QR, image...)"
        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
      />
      {query ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {matches.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/tool/${tool.slug}`}
              className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <p className="font-medium text-slate-900 dark:text-white">{tool.name}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">{tool.description}</p>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
