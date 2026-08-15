# WireDots 🔴

A modern, production-ready **article / news publishing platform**. An admin publishes
articles (photos + rich text) through a private backend, and they reflect **instantly**
on the public site.

Built with **Next.js 14 (App Router, TypeScript)**, **Tailwind CSS**, **Supabase**
(Postgres + Storage + Auth) and **TipTap**. Rich text is **sanitized with DOMPurify**
on both save and render (defense in depth).

---

## ✨ Features

**Public site (no login)**
- Home page with hero, featured story, and a responsive grid of published articles.
- Category filter + search bar (URL-driven, shareable).
- Article detail page `/article/[slug]` with cover image, meta, safely-rendered rich text, and related articles.
- Responsive header (WireDots logo with the red "dot" motif) + footer.
- Per-article SEO: dynamic `<title>`, meta description, Open Graph image = cover image.

**Admin backend (`/admin`, protected by Supabase Auth)**
- Email/password login. Unauthenticated users hitting `/admin` are redirected to `/admin/login` (enforced in middleware).
- Dashboard listing **all** articles (drafts + published) with status badges, edit and delete.
- Create/Edit form: title, auto-generated (editable) slug, excerpt, category, author.
- Cover image **upload** to Supabase Storage with live preview.
- **TipTap** editor: headings, bold, italic, underline, strike, bullet/ordered lists, blockquote, code block, links, and **inline image upload**.
- Save as **Draft** or **Publish** (publishing sets `published_at` and goes live instantly).
- Delete with inline confirmation (also cleans up the cover image in Storage).

---

## 🎨 Theme

White background `#FFFFFF`, primary red `#E11D2A`, dark text `#1A1A1A`,
soft gray borders `#EDEDED`, red hover `#B91020`. Clean editorial style, rounded-xl
cards, subtle shadows, mobile-first responsive.

---

## 🧱 Tech stack

| Concern        | Choice                                    |
| -------------- | ----------------------------------------- |
| Framework      | Next.js 14 (App Router, TypeScript)       |
| Styling        | Tailwind CSS                              |
| DB / Storage / Auth | Supabase                             |
| Rich text      | TipTap                                     |
| Sanitization   | isomorphic-dompurify                       |
| Deployment     | Vercel                                     |

---

## 🚀 Getting started

### 1. Prerequisites
- Node.js **20.6+** (needed for `--env-file`)
- A free [Supabase](https://supabase.com) project

### 2. Install
```bash
npm install
```

### 3. Configure environment
Copy the example env file and fill in your Supabase values:
```bash
cp .env.example .env.local
```
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
# Only used by the seed script (server-side, bypasses RLS):
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
Find these in **Supabase → Project Settings → API**.
**No secrets are hardcoded anywhere** — everything comes from env vars.

### 4. Create the database schema
Open **Supabase → SQL Editor → New query**, paste the entire contents of
[`supabase/schema.sql`](supabase/schema.sql), and run it. This creates:
- the `articles` table (with `updated_at` trigger + indexes),
- Row Level Security policies (public reads only `published`; authenticated admin can do everything),
- the public `article-images` Storage bucket and its policies.

### 5. Create an admin user
**Supabase → Authentication → Users → Add user** (email + password, confirm it).
Use these credentials to sign in at `/admin/login`.

### 6. Seed sample articles (optional but recommended)
```bash
node --env-file=.env.local supabase/seed.mjs
```
This inserts 3 published sample articles so the site isn't empty.

### 7. Run the dev server
```bash
npm run dev
```
- Public site → http://localhost:3000
- Admin → http://localhost:3000/admin

### 8. Production build
```bash
npm run build && npm start
```

---

## ☁️ Deploy to Vercel
1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   and `SUPABASE_SERVICE_ROLE_KEY` if you seed from CI). Optionally set
   `NEXT_PUBLIC_SITE_URL` to your production URL for correct OG/canonical metadata.
4. Deploy. `npm run build` runs clean with zero TypeScript/ESLint errors.

> In Supabase → **Authentication → URL Configuration**, add your Vercel domain to the
> allowed redirect/site URLs.

---

## 🔒 Security notes
- **RLS**: the public anon key can only ever read `status = 'published'` rows. Drafts are invisible to the public.
- **Sanitization**: rich text is cleaned with DOMPurify **on save** (admin) and again **on render** (public). `<script>`, `on*` handlers, `javascript:` URLs, `<iframe>` etc. are stripped.
- **Auth**: `/admin/*` is protected in `src/middleware.ts`; unauthenticated users are redirected to login.
- **No hardcoded secrets**: all keys are read from environment variables.

---

## 📁 Project structure
```
wiredots/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx            # Root layout + global SEO metadata
│  │  ├─ page.tsx              # Public home (hero, featured, grid, search/filter)
│  │  ├─ loading.tsx           # Global loading state
│  │  ├─ error.tsx             # Global error boundary
│  │  ├─ not-found.tsx         # 404
│  │  ├─ globals.css           # Theme + prose + TipTap styles
│  │  ├─ article/[slug]/page.tsx  # Article detail + per-article SEO/OG
│  │  └─ admin/
│  │     ├─ layout.tsx         # Admin shell (noindex)
│  │     ├─ page.tsx           # Dashboard (all articles)
│  │     ├─ login/page.tsx     # Login
│  │     ├─ new/page.tsx       # Create
│  │     └─ edit/[id]/page.tsx # Edit
│  ├─ components/
│  │  ├─ Header.tsx  Footer.tsx  Logo.tsx
│  │  ├─ ArticleCard.tsx  SearchFilter.tsx  SetupNotice.tsx
│  │  ├─ AdminHeader.tsx  DashboardTable.tsx
│  │  ├─ ArticleForm.tsx       # Create/Edit form (cover upload + editor)
│  │  └─ Editor.tsx            # TipTap editor + toolbar + inline image upload
│  ├─ lib/
│  │  ├─ types.ts  utils.ts  sanitize.ts  queries.ts
│  │  └─ supabase/{client.ts, server.ts}
│  └─ middleware.ts            # Session refresh + /admin protection
├─ supabase/
│  ├─ schema.sql               # Tables, RLS, Storage bucket
│  └─ seed.mjs                 # 3 sample published articles
├─ .env.example
├─ tailwind.config.ts  next.config.js  tsconfig.json  postcss.config.js
└─ package.json
```

---

## 🧪 Definition of Done — status
- ✅ `npm run build` compiles with zero TypeScript/ESLint errors.
- ✅ Admin login; unauthenticated `/admin` access is redirected to login.
- ✅ Admin creates an article with a cover image upload (appears on site).
- ✅ TipTap supports headings, bold, italic, underline, lists, quote, link, code, inline image upload.
- ✅ Rich text renders correctly and is sanitized (no XSS).
- ✅ Publishing makes an article appear on the public home + detail page immediately.
- ✅ Draft articles are never visible on the public site (enforced by RLS + queries).
- ✅ Category filter / search works.
- ✅ Fully responsive with the red & white modern theme.
- ✅ SEO meta + OG tags render per article.
- ✅ No hardcoded secrets; all keys via env vars.
- ✅ This README with setup, SQL, env, run & deploy instructions.
