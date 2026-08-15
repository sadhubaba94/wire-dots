import Link from "next/link";
import { notFound } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import ArticleForm from "@/components/ArticleForm";
import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  const article = data as Article | null;
  if (!article) notFound();

  return (
    <>
      <AdminHeader email={user?.email} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Link
            href="/admin"
            className="text-sm font-medium text-gray-500 hover:text-brand-red"
          >
            ← Back to dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-brand-dark">
            Edit article
          </h1>
        </div>
        <ArticleForm article={article} />
      </main>
    </>
  );
}
