/**
 * Friendly banner shown when Supabase env vars are missing.
 * Prevents a confusing empty site during first-time setup.
 */
export default function SetupNotice() {
  return (
    <div className="rounded-xl border border-brand-red/30 bg-red-50/60 p-6 text-center">
      <h2 className="text-lg font-bold text-brand-redHover">
        Almost there — connect Supabase
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">
        Add <code className="rounded bg-white px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
        and{" "}
        <code className="rounded bg-white px-1">
          NEXT_PUBLIC_SUPABASE_ANON_KEY
        </code>{" "}
        to your <code className="rounded bg-white px-1">.env.local</code>, run the
        SQL in <code className="rounded bg-white px-1">supabase/schema.sql</code>,
        then seed sample articles. See the README for full steps.
      </p>
    </div>
  );
}
