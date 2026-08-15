"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

/**
 * Client search + category filter. Updates the URL query string, which the
 * server home page reads to filter results. Keeps state shareable/bookmarkable.
 */
export default function SearchFilter({ categories }: { categories: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const activeCategory = params.get("category") ?? "All";
  const [term, setTerm] = useState(params.get("search") ?? "");

  // Keep local input in sync if the URL changes externally.
  useEffect(() => {
    setTerm(params.get("search") ?? "");
  }, [params]);

  const push = (next: { category?: string; search?: string }) => {
    const sp = new URLSearchParams(params.toString());
    const category = next.category ?? activeCategory;
    const search = next.search ?? term;

    if (category && category !== "All") sp.set("category", category);
    else sp.delete("category");

    if (search) sp.set("search", search);
    else sp.delete("search");

    const qs = sp.toString();
    router.push(qs ? `/?${qs}` : "/");
  };

  const allChips = ["All", ...categories];

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          push({ search: term });
        }}
        className="relative"
      >
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search articles…"
          aria-label="Search articles"
          className="input pl-11"
        />
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
      </form>

      {allChips.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {allChips.map((cat) => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => push({ category: cat })}
                className={`chip ${active ? "chip-active" : "chip-idle"}`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
