"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (uses the public anon key).
 * Created lazily inside components/handlers so it never runs during
 * server prerender/build.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
    );
  }

  return createBrowserClient(url, anon);
}
