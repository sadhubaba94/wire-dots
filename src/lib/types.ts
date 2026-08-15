// Shared domain types for WireDots.

export type ArticleStatus = "draft" | "published";

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  content_html: string;
  category: string | null;
  author: string | null;
  status: ArticleStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// Shape used when creating/updating from the admin form.
export interface ArticleInput {
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  content_html: string;
  category: string;
  author: string;
  status: ArticleStatus;
}
