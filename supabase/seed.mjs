/**
 * Seed 3 sample PUBLISHED articles so the site isn't empty.
 *
 * Usage:
 *   1. Ensure `.env.local` has NEXT_PUBLIC_SUPABASE_URL and
 *      SUPABASE_SERVICE_ROLE_KEY (service role bypasses RLS for seeding).
 *   2. Run:  node --env-file=.env.local supabase/seed.mjs
 *
 * Node 20.6+ supports --env-file natively. No secrets are hardcoded.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then run:\n" +
      "  node --env-file=.env.local supabase/seed.mjs"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

const now = Date.now();
const iso = (offsetDays) =>
  new Date(now - offsetDays * 86400000).toISOString();

// Royalty-free Unsplash cover images.
const articles = [
  {
    title: "The Quiet Revolution in On-Device AI",
    slug: "quiet-revolution-on-device-ai",
    excerpt:
      "Models are shrinking and moving to the edge. Here's why the next wave of AI may never touch the cloud.",
    category: "Technology",
    author: "A. Rivera",
    cover_image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
    published_at: iso(1),
    content_html: `
      <p>For years the story of artificial intelligence was a story about scale — bigger models, bigger data centers, bigger bills. That story is quietly being rewritten.</p>
      <h2>Small is the new big</h2>
      <p>A new generation of compact models runs directly on phones and laptops, delivering useful results <strong>without a round trip to the cloud</strong>. The benefits are immediate: lower latency, better privacy, and offline capability.</p>
      <ul>
        <li>Faster responses with no network dependency</li>
        <li>Data never leaves the device</li>
        <li>Dramatically lower running costs</li>
      </ul>
      <blockquote>The most important AI may be the kind you never notice.</blockquote>
      <p>As hardware accelerators become standard, expect on-device intelligence to feel less like a feature and more like the default.</p>
    `,
  },
  {
    title: "How Small Nations Are Reshaping Global Trade",
    slug: "small-nations-reshaping-global-trade",
    excerpt:
      "Agile economies are punching far above their weight by specializing, digitizing, and moving fast.",
    category: "World",
    author: "M. Okonkwo",
    cover_image:
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80",
    published_at: iso(3),
    content_html: `
      <p>Global trade is no longer only a game of giants. A cluster of smaller economies has learned to compete by being <em>faster and more focused</em> than their larger rivals.</p>
      <h2>The specialization advantage</h2>
      <p>Rather than trying to do everything, these nations dominate narrow slices of the value chain — from precision components to digital services.</p>
      <h3>What comes next</h3>
      <p>Watch for deeper regional alliances and a continued push into services that travel across borders at the speed of light.</p>
    `,
  },
  {
    title: "The Science of Better Sleep, Explained",
    slug: "science-of-better-sleep-explained",
    excerpt:
      "Forget the hacks. The research points to a few durable habits that actually move the needle.",
    category: "Science",
    author: "Dr. L. Chen",
    cover_image:
      "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1200&q=80",
    published_at: iso(5),
    content_html: `
      <p>Sleep advice is everywhere, and most of it is noise. The durable findings are surprisingly simple.</p>
      <h2>Three habits that hold up</h2>
      <ol>
        <li><strong>Consistency</strong> — same wake time, every day.</li>
        <li><strong>Light</strong> — bright mornings, dim evenings.</li>
        <li><strong>Wind-down</strong> — a screen-free buffer before bed.</li>
      </ol>
      <p>None of these are glamorous, but together they outperform nearly every gadget on the market.</p>
      <blockquote>The best sleep tech is usually a consistent schedule.</blockquote>
    `,
  },
];

async function main() {
  console.log("Seeding articles…");
  for (const a of articles) {
    const { error } = await supabase
      .from("articles")
      .upsert({ ...a, status: "published" }, { onConflict: "slug" });
    if (error) {
      console.error(`  ✗ ${a.slug}: ${error.message}`);
    } else {
      console.log(`  ✓ ${a.slug}`);
    }
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
