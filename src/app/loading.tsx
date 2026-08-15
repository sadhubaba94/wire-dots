/** Global route loading state with a subtle branded spinner. */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-border border-t-brand-red" />
        <p className="text-sm font-medium text-gray-500">Loading…</p>
      </div>
    </div>
  );
}
