import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import { getArticleBySlug, getRelatedArticles } from "@/lib/queries";
import { sanitizeHtml } from "@/lib/sanitize";
import { formatDate, readingTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Dynamic SEO + Open Graph per article (OG image = cover_image). */
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) {
    return { title: "Article not found" };
  }
  const description =
    article.excerpt ?? "Read this story on WireDots.";
  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      type: "article",
      publishedTime: article.published_at ?? undefined,
      authors: article.author ? [article.author] : undefined,
      images: article.cover_image ? [{ url: article.cover_image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: article.cover_image ? [article.cover_image] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article);
  // Sanitize again at render time (defense in depth).
  const safeHtml = sanitizeHtml(article.content_html);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          {/* Breadcrumb / back */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-brand-red"
          >
            <span aria-hidden="true">←</span> Back to all articles
          </Link>

          {/* Meta header */}
          <header className="mb-6">
            {article.category && (
              <Link
                href={`/?category=${encodeURIComponent(article.category)}`}
                className="chip chip-active mb-4"
              >
                {article.category}
              </Link>
            )}
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-brand-dark sm:text-4xl">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="mt-4 text-lg text-gray-600">{article.excerpt}</p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              {article.author && (
                <span className="font-semibold text-brand-dark">
                  {article.author}
                </span>
              )}
              {article.author && <span>•</span>}
              <span>{formatDate(article.published_at)}</span>
              <span>•</span>
              <span>{readingTime(article.content_html)}</span>
            </div>
          </header>

          {/* Cover image */}
          {article.cover_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.cover_image}
              alt={article.title}
              className="mb-8 aspect-[16/9] w-full rounded-xl border border-brand-border object-cover"
            />
          )}

          {/* Rich text body (sanitized) */}
          <div
            className="prose-wiredots"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        </article>

        {/* Related */}
        {related.length > 0 && (
          <section className="border-t border-brand-border bg-red-50/20">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
              <h2 className="mb-6 text-2xl font-extrabold text-brand-dark">
                Related articles
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <ArticleCard key={r.id} article={r} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
