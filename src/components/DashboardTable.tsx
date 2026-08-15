"use client";

import { useState } from "react";
import Link from "next/link";
import type { Article } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

/** Editable list of all articles with status badges + delete confirm. */
export default function DashboardTable({
  initialArticles,
}: {
  initialArticles: Article[];
}) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (article: Article) => {
    setBusyId(article.id);
    setError(null);
    try {
      const supabase = createClient();

      // Best-effort: remove the cover image object from storage too.
      if (article.cover_image) {
        const marker = "/article-images/";
        const idx = article.cover_image.indexOf(marker);
        if (idx !== -1) {
          const path = article.cover_image.slice(idx + marker.length);
          await supabase.storage.from("article-images").remove([path]);
        }
      }

      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", article.id);
      if (error) throw error;

      setArticles((prev) => prev.filter((a) => a.id !== article.id));
      setConfirmId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-brand-border bg-white shadow-card">
      {error && (
        <p className="border-b border-brand-border bg-red-50 px-4 py-3 text-sm text-brand-redHover">
          {error}
        </p>
      )}

      {/* Desktop table */}
      <table className="hidden w-full text-left text-sm md:table">
        <thead className="border-b border-brand-border bg-gray-50/70 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-5 py-3 font-semibold">Title</th>
            <th className="px-5 py-3 font-semibold">Category</th>
            <th className="px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3 font-semibold">Updated</th>
            <th className="px-5 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => (
            <tr
              key={a.id}
              className="border-b border-brand-border last:border-0 hover:bg-gray-50/50"
            >
              <td className="max-w-xs px-5 py-3">
                <span className="line-clamp-1 font-semibold text-brand-dark">
                  {a.title}
                </span>
                <span className="text-xs text-gray-400">/{a.slug}</span>
              </td>
              <td className="px-5 py-3 text-gray-600">{a.category || "—"}</td>
              <td className="px-5 py-3">
                <StatusBadge status={a.status} />
              </td>
              <td className="px-5 py-3 text-gray-500">
                {formatDate(a.updated_at)}
              </td>
              <td className="px-5 py-3">
                <RowActions
                  article={a}
                  confirmId={confirmId}
                  busyId={busyId}
                  setConfirmId={setConfirmId}
                  onDelete={handleDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <ul className="divide-y divide-brand-border md:hidden">
        {articles.map((a) => (
          <li key={a.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="line-clamp-1 font-semibold text-brand-dark">
                  {a.title}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">/{a.slug}</p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={a.status} />
                  <span className="text-xs text-gray-500">
                    {a.category || "—"}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <RowActions
                article={a}
                confirmId={confirmId}
                busyId={busyId}
                setConfirmId={setConfirmId}
                onDelete={handleDelete}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusBadge({ status }: { status: Article["status"] }) {
  const published = status === "published";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        published
          ? "bg-green-50 text-green-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          published ? "bg-green-500" : "bg-amber-500"
        }`}
      />
      {published ? "Published" : "Draft"}
    </span>
  );
}

function RowActions({
  article,
  confirmId,
  busyId,
  setConfirmId,
  onDelete,
}: {
  article: Article;
  confirmId: string | null;
  busyId: string | null;
  setConfirmId: (id: string | null) => void;
  onDelete: (a: Article) => void;
}) {
  const isConfirming = confirmId === article.id;
  const isBusy = busyId === article.id;

  if (isConfirming) {
    return (
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-gray-500">Delete?</span>
        <button
          onClick={() => onDelete(article)}
          disabled={isBusy}
          className="rounded-lg bg-brand-red px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-redHover disabled:opacity-60"
        >
          {isBusy ? "Deleting…" : "Yes"}
        </button>
        <button
          onClick={() => setConfirmId(null)}
          disabled={isBusy}
          className="rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-gray-300"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {article.status === "published" && (
        <Link
          href={`/article/${article.slug}`}
          target="_blank"
          className="rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-brand-red hover:text-brand-red"
        >
          View
        </Link>
      )}
      <Link
        href={`/admin/edit/${article.id}`}
        className="rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-brand-red hover:text-brand-red"
      >
        Edit
      </Link>
      <button
        onClick={() => setConfirmId(article.id)}
        className="rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-red transition-colors hover:bg-brand-red hover:text-white"
      >
        Delete
      </button>
    </div>
  );
}
