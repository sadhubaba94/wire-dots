// Small, dependency-free helpers.

/** Convert a title into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9\s-]/g, "") // drop non alphanumerics
    .replace(/\s+/g, "-") // spaces -> dashes
    .replace(/-+/g, "-") // collapse dashes
    .replace(/^-|-$/g, ""); // trim leading/trailing dashes
}

/** Human-friendly date, e.g. "Aug 15, 2026". Falls back gracefully. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Rough reading time from an HTML string. */
export function readingTime(html: string): string {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

/** Are the public Supabase env vars present? Used to render friendly setup hints. */
export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
