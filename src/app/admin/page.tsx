import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import DashboardTable from "@/components/DashboardTable";
import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Authenticated → RLS lets us read ALL articles (drafts + published).
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("updated_at", { ascending: false });

  const articles = (data as Article[]) ?? [];
  const published = articles.filter((a) => a.status === "published").length;
  const drafts = articles.length - published;

  return (
    <>
      <AdminHeader email={user?.email} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-dark">
              Articles
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {articles.length} total · {published} published · {drafts} drafts
            </p>
          </div>
          <Link href="/admin/new" className="btn-primary">
            <span className="text-lg leading-none">+</span> New article
          </Link>
        </div>

        {error ? (
          <div className="rounded-xl border border-brand-red/30 bg-red-50/60 p-6 text-sm text-brand-redHover">
            Could not load articles: {error.message}
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-xl border border-brand-border bg-white p-12 text-center">
            <p className="text-lg font-semibold text-brand-dark">
              No articles yet.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Create your first article to get started.
            </p>
            <Link href="/admin/new" className="btn-primary mt-6">
              + New article
            </Link>
          </div>
        ) : (
          <DashboardTable initialArticles={articles} />
        )}
      </main>
    </>
  );
}
