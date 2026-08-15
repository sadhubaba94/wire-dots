import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import SearchFilter from "@/components/SearchFilter";
import SetupNotice from "@/components/SetupNotice";
import { getPublishedArticles, getCategories } from "@/lib/queries";
import { hasSupabaseEnv } from "@/lib/utils";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

// Always render fresh so newly published articles appear instantly.
export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  const configured = hasSupabaseEnv();

  const [articles, categories] = configured
    ? await Promise.all([
        getPublishedArticles({
          category: searchParams.category,
          search: searchParams.search,
        }),
        getCategories(),
      ])
    : [[], []];

  const isFiltering = Boolean(searchParams.category || searchParams.search);
  const [featured, ...rest] = articles;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-brand-border bg-gradient-to-b from-red-50/50 to-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="max-w-2xl">
              <span className="chip chip-idle mb-4 border-brand-red/30 text-brand-red">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-brand-red" />
                Fresh stories, every day
              </span>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-brand-dark sm:text-5xl">
                Connecting the dots on{" "}
                <span className="text-brand-red">what matters</span>.
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Technology, world affairs, science and culture — reported with
                clarity and a modern editorial voice.
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          {!configured ? (
            <SetupNotice />
          ) : (
            <>
              <div className="mb-8">
                <SearchFilter categories={categories} />
              </div>

              {articles.length === 0 ? (
                <div className="rounded-xl border border-brand-border bg-white p-12 text-center">
                  <p className="text-lg font-semibold text-brand-dark">
                    {isFiltering
                      ? "No articles match your search."
                      : "No published articles yet."}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    {isFiltering ? (
                      <Link href="/" className="text-brand-red underline">
                        Clear filters
                      </Link>
                    ) : (
                      "Publish your first article from the admin dashboard."
                    )}
                  </p>
                </div>
              ) : (
                <>
                  {/* Featured (only on the unfiltered home) */}
                  {!isFiltering && featured && (
                    <Link
                      href={`/article/${featured.slug}`}
                      className="group mb-10 grid overflow-hidden rounded-xl border border-brand-border bg-white shadow-card transition-all hover:border-brand-red/40 hover:shadow-lg md:grid-cols-2"
                    >
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 md:aspect-auto">
                        {featured.cover_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={featured.cover_image}
                            alt={featured.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full min-h-[240px] w-full items-center justify-center bg-gradient-to-br from-red-50 to-white">
                            <span className="text-3xl font-extrabold text-brand-red/40">
                              WireDots
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center p-6 sm:p-8">
                        {featured.category && (
                          <span className="chip chip-active mb-3 w-fit">
                            {featured.category}
                          </span>
                        )}
                        <h2 className="text-2xl font-extrabold leading-tight text-brand-dark transition-colors group-hover:text-brand-red sm:text-3xl">
                          {featured.title}
                        </h2>
                        {featured.excerpt && (
                          <p className="mt-3 text-gray-600">{featured.excerpt}</p>
                        )}
                        <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
                          {featured.author && (
                            <span className="font-medium">{featured.author}</span>
                          )}
                          {featured.author && featured.published_at && (
                            <span>•</span>
                          )}
                          <span>{formatDate(featured.published_at)}</span>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* Grid */}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {(isFiltering ? articles : rest).map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
