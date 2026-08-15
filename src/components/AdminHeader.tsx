"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

/** Admin top bar with quick nav + sign out. */
export default function AdminHeader({ email }: { email?: string | null }) {
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-brand-border bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-brand-red sm:inline">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden text-sm font-medium text-gray-500 transition-colors hover:text-brand-red sm:inline"
          >
            View site ↗
          </Link>
          {email && (
            <span className="hidden text-sm text-gray-400 md:inline">{email}</span>
          )}
          <button onClick={signOut} className="btn-ghost px-4 py-2 text-sm">
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
