"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { Article, ArticleInput, ArticleStatus } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { sanitizeHtml } from "@/lib/sanitize";
import { slugify } from "@/lib/utils";

// Load the TipTap editor only on the client (no SSR) to avoid hydration issues.
const Editor = dynamic(() => import("@/components/Editor"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[380px] items-center justify-center rounded-xl border border-brand-border bg-white text-sm text-gray-400">
      Loading editor…
    </div>
  ),
});

const CATEGORY_OPTIONS = [
  "Technology",
  "World",
  "Science",
  "Culture",
  "Business",
  "Opinion",
];

export default function ArticleForm({ article }: { article?: Article }) {
  const router = useRouter();
  const isEdit = Boolean(article);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [category, setCategory] = useState(article?.category ?? "");
  const [author, setAuthor] = useState(article?.author ?? "");
  const [coverImage, setCoverImage] = useState<string | null>(
    article?.cover_image ?? null
  );
  const [contentHtml, setContentHtml] = useState(article?.content_html ?? "");

  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from title until the user edits the slug manually.
  const onTitleChange = (v: string) => {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const uploadCover = async (file: File) => {
    setUploadingCover(true);
    setError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "png";
      const path = `covers/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("article-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from("article-images").getPublicUrl(path);
      setCoverImage(publicUrl);
    } catch (err) {
      setError(
        "Cover upload failed: " +
          (err instanceof Error ? err.message : "unknown error")
      );
    } finally {
      setUploadingCover(false);
    }
  };

  const validate = (): string | null => {
    if (!title.trim()) return "Title is required.";
    if (!slug.trim()) return "Slug is required.";
    if (!contentHtml.trim() || contentHtml === "<p></p>")
      return "Article content is required.";
    return null;
  };

  const save = async (status: ArticleStatus) => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();

      const payload: ArticleInput & {
        published_at?: string | null;
        updated_at: string;
      } = {
        title: title.trim(),
        slug: slugify(slug),
        excerpt: excerpt.trim(),
        category: category.trim(),
        author: author.trim(),
        cover_image: coverImage,
        // Sanitize BEFORE storing (defense in depth).
        content_html: sanitizeHtml(contentHtml),
        status,
        updated_at: new Date().toISOString(),
      };

      // Set published_at the first time it goes live; keep it once set.
      if (status === "published") {
        payload.published_at =
          article?.published_at ?? new Date().toISOString();
      } else {
        payload.published_at = article?.published_at ?? null;
      }

      if (isEdit && article) {
        const { error } = await supabase
          .from("articles")
          .update(payload)
          .eq("id", article.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("articles").insert(payload);
        if (error) throw error;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save.";
      // Friendlier message for the unique-slug constraint.
      setError(
        msg.includes("duplicate") || msg.includes("unique")
          ? "That slug is already in use. Please choose a different slug."
          : msg
      );
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main column */}
      <div className="space-y-6 lg:col-span-2">
        <Field label="Title" required>
          <input
            className="input text-lg font-semibold"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="An attention-grabbing headline"
          />
        </Field>

        <Field label="Content" required>
          <Editor value={contentHtml} onChange={setContentHtml} />
          <p className="mt-1.5 text-xs text-gray-400">
            Use the toolbar for headings, bold, lists, quotes, links and inline
            images. Content is sanitized on save.
          </p>
        </Field>
      </div>

      {/* Sidebar */}
      <aside className="space-y-6">
        {error && (
          <p className="rounded-xl border border-brand-red/30 bg-red-50 px-4 py-3 text-sm text-brand-redHover">
            {error}
          </p>
        )}

        <div className="space-y-4 rounded-xl border border-brand-border bg-white p-5 shadow-card">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => save("published")}
              disabled={saving || uploadingCover}
              className="btn-primary w-full"
            >
              {saving ? "Saving…" : "Publish"}
            </button>
            <button
              onClick={() => save("draft")}
              disabled={saving || uploadingCover}
              className="btn-ghost w-full"
            >
              Save as draft
            </button>
            <Link
              href="/admin"
              className="mt-1 text-center text-sm text-gray-500 hover:text-brand-red"
            >
              Cancel
            </Link>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-brand-border bg-white p-5 shadow-card">
          {/* Cover image */}
          <Field label="Cover image">
            <div className="space-y-3">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-brand-border bg-gray-50">
                {coverImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImage(null)}
                      className="absolute right-2 top-2 rounded-lg bg-black/60 px-2 py-1 text-xs font-semibold text-white hover:bg-black/80"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                    {uploadingCover ? "Uploading…" : "No cover selected"}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="btn-ghost w-full py-2 text-sm"
              >
                {uploadingCover
                  ? "Uploading…"
                  : coverImage
                    ? "Replace image"
                    : "Upload image"}
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadCover(file);
                  e.target.value = "";
                }}
              />
            </div>
          </Field>

          <Field label="Slug" required>
            <input
              className="input font-mono text-sm"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="my-article-slug"
            />
          </Field>

          <Field label="Category">
            <input
              className="input"
              list="category-options"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Technology"
            />
            <datalist id="category-options">
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <Field label="Author">
            <input
              className="input"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name"
            />
          </Field>

          <Field label="Excerpt">
            <textarea
              className="input min-h-[90px] resize-y"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A short summary shown on cards and in search results."
            />
          </Field>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-brand-dark">
        {label}
        {required && <span className="ml-0.5 text-brand-red">*</span>}
      </label>
      {children}
    </div>
  );
}
