"use client";

/** Global error boundary for the public site. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="text-center">
        <p className="text-5xl font-extrabold text-brand-red">Oops</p>
        <h1 className="mt-4 text-xl font-bold text-brand-dark">
          Something went wrong.
        </h1>
        <p className="mt-2 max-w-md text-sm text-gray-600">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button onClick={reset} className="btn-primary mt-6">
          Try again
        </button>
      </div>
    </div>
  );
}
