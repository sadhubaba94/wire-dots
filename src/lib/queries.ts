import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/lib/types";

/**
 * Server-side data access. All functions degrade gracefully:
 * if Supabase is unreachable / not configured, they return empty results
 * instead of throwing, so the site (and `npm run build`) never breaks.
 */

export async function getPublishedArticles(params?: {
  category?: string;
  search?: string;
}): Promise<Article[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (params?.category && params.category !== "All") {
      query = query.eq("category", params.category);
    }
    if (params?.search) {
      const term = `%${params.search}%`;
      query = query.or(`title.ilike.${term},excerpt.ilike.${term}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as Article[]) ?? [];
  } catch {
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    return (data as Article) ?? null;
  } catch {
    return null;
  }
}

export async function getRelatedArticles(
  article: Article,
  limit = 3
): Promise<Article[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .neq("id", article.id)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (article.category) {
      query = query.eq("category", article.category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as Article[]) ?? [];
  } catch {
    return [];
  }
}

export async function getCategories(): Promise<string[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("category")
      .eq("status", "published");
    if (error) throw error;
    const set = new Set<string>();
    (data ?? []).forEach((row: { category: string | null }) => {
      if (row.category) set.add(row.category);
    });
    return Array.from(set).sort();
  } catch {
    return [];
  }
}
