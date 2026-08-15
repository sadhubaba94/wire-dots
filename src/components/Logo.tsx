import Link from "next/link";

/**
 * WireDots brand mark. The "dot" motif is the red circle after the wordmark.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-baseline gap-0.5 ${className}`}
      aria-label="WireDots home"
    >
      <span className="text-xl font-extrabold tracking-tight text-brand-dark sm:text-2xl">
        Wire<span className="text-brand-red">Dots</span>
      </span>
      <span
        className="ml-0.5 inline-block h-2 w-2 translate-y-[-2px] rounded-full bg-brand-red transition-transform duration-200 group-hover:scale-125"
        aria-hidden="true"
      />
    </Link>
  );
}
