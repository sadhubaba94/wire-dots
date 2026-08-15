import Link from "next/link";
import Logo from "./Logo";

/** Public site header: brand + nav. Sticky, responsive. */
export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-border bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-brand-dark transition-colors hover:text-brand-red"
          >
            Home
          </Link>
          <Link
            href="/?category=Technology"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-brand-dark transition-colors hover:text-brand-red sm:inline-block"
          >
            Technology
          </Link>
          <Link
            href="/?category=World"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-brand-dark transition-colors hover:text-brand-red sm:inline-block"
          >
            World
          </Link>
          <Link href="/admin" className="btn-primary ml-1 px-4 py-2 text-sm">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
