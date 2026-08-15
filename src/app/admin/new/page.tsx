import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import ArticleForm from "@/components/ArticleForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
            New article
          </h1>
        </div>
        <ArticleForm />
      </main>
    </>
  );
}
