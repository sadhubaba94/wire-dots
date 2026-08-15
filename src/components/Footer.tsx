import Logo from "./Logo";

/** Public site footer. */
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-brand-border bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Logo />
          <p className="text-sm text-gray-500">
            Modern editorial. Connecting the dots.
          </p>
        </div>
        <p className="text-sm text-gray-400">
          © {year} WireDots. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
