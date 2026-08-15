-- ============================================================
-- WireDots — Supabase schema, RLS policies & storage bucket
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query).
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS guards.
-- ============================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Table: articles
-- ------------------------------------------------------------
create table if not exists public.articles (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text unique not null,
  excerpt       text,
  cover_image   text,                       -- public URL from Storage
  content_html  text not null,              -- sanitized rich text (HTML)
  category      text,
  author        text,
  status        text not null default 'draft'
                check (status in ('draft', 'published')),
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Helpful indexes for the public feed & lookups
create index if not exists articles_status_published_at_idx
  on public.articles (status, published_at desc);
create index if not exists articles_category_idx
  on public.articles (category);

-- Keep updated_at fresh on every update
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_articles_updated_at on public.articles;
create trigger trg_articles_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
-- Public (anon) may SELECT only published rows.
-- Authenticated users (the admin) may do everything.
-- ------------------------------------------------------------
alter table public.articles enable row level security;

-- Anyone (anon or authenticated) can read PUBLISHED articles
drop policy if exists "Public can read published articles" on public.articles;
create policy "Public can read published articles"
  on public.articles
  for select
  using (status = 'published');

-- Authenticated users can read ALL articles (drafts included) for the dashboard
drop policy if exists "Authenticated can read all articles" on public.articles;
create policy "Authenticated can read all articles"
  on public.articles
  for select
  to authenticated
  using (true);

-- Authenticated users can insert
drop policy if exists "Authenticated can insert articles" on public.articles;
create policy "Authenticated can insert articles"
  on public.articles
  for insert
  to authenticated
  with check (true);

-- Authenticated users can update
drop policy if exists "Authenticated can update articles" on public.articles;
create policy "Authenticated can update articles"
  on public.articles
  for update
  to authenticated
  using (true)
  with check (true);

-- Authenticated users can delete
drop policy if exists "Authenticated can delete articles" on public.articles;
create policy "Authenticated can delete articles"
  on public.articles
  for delete
  to authenticated
  using (true);

-- ------------------------------------------------------------
-- Storage bucket: article-images (public read)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do update set public = true;

-- Public read for objects in the bucket
drop policy if exists "Public read article-images" on storage.objects;
create policy "Public read article-images"
  on storage.objects
  for select
  using (bucket_id = 'article-images');

-- Authenticated admin can upload
drop policy if exists "Authenticated upload article-images" on storage.objects;
create policy "Authenticated upload article-images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'article-images');

-- Authenticated admin can update objects
drop policy if exists "Authenticated update article-images" on storage.objects;
create policy "Authenticated update article-images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'article-images')
  with check (bucket_id = 'article-images');

-- Authenticated admin can delete objects
drop policy if exists "Authenticated delete article-images" on storage.objects;
create policy "Authenticated delete article-images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'article-images');

-- ============================================================
-- Done. Create your admin user in Dashboard → Authentication → Users.
-- ============================================================
