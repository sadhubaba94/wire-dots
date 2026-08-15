import Link from "next/link";
import type { Article } from "@/lib/types";
import { formatDate } from "@/lib/utils";

/** A single article card used in grids/feeds. */
export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/article/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-brand-border bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-red/40 hover:shadow-lg"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
        {article.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.cover_image}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-50 to-white">
            <span className="text-2xl font-extrabold text-brand-red/40">
              WireDots
            </span>
          </div>
        )}
        {article.category && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-red px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {article.category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="clamp-2 text-lg font-bold leading-snug text-brand-dark transition-colors group-hover:text-brand-red">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="clamp-3 mt-2 text-sm text-gray-600">{article.excerpt}</p>
        )}
        <div className="mt-4 flex items-center gap-2 border-t border-brand-border pt-3 text-xs text-gray-500">
          {article.author && <span className="font-medium">{article.author}</span>}
          {article.author && article.published_at && <span>•</span>}
          <span>{formatDate(article.published_at)}</span>
        </div>
      </div>
    </Link>
  );
}
