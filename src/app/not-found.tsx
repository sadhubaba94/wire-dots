import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/** 404 page. */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="text-center">
          <p className="text-6xl font-extrabold text-brand-red">404</p>
          <h1 className="mt-4 text-2xl font-bold text-brand-dark">
            This story wandered off.
          </h1>
          <p className="mt-2 text-gray-600">
            The page you’re looking for doesn’t exist or was unpublished.
          </p>
          <Link href="/" className="btn-primary mt-6">
            Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
