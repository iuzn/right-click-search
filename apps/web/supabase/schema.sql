-- ==================== TABLES ====================

-- Platforms table
create table if not exists public.platforms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category text not null,                 -- "search" | "code" | "ai" | "social" | "shopping"
  url_pattern text not null,              -- %s required (for extension)
  context text[] not null default '{selection}', -- ['selection'] | ['image'] | ['selection','image']
  icon_url text,                          -- Supabase Storage public URL
  tags text[] default '{}',
  featured boolean default false,
  supports_prefill boolean default true,  -- false for those not supporting %s (e.g. some AI tools)
  enabled boolean default true,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Admins table
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null
);

-- ==================== FUNCTIONS & TRIGGERS ====================

-- updated_at trigger function
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Trigger for platforms table
drop trigger if exists platforms_set_updated_at on public.platforms;
create trigger platforms_set_updated_at 
  before update on public.platforms
  for each row 
  execute function public.set_updated_at();

-- ==================== ROW LEVEL SECURITY (RLS) ====================

-- Enable RLS
alter table public.platforms enable row level security;
alter table public.admins enable row level security;

-- Public read policy for platforms (only enabled=true)
create policy "platforms_public_read"
  on public.platforms
  for select
  using (enabled = true);

-- Admin write policy for platforms
-- (Signed in with Supabase Auth and admins.email == auth.email())
create policy "platforms_admin_write"
  on public.platforms
  for all
  using (exists (select 1 from public.admins a where a.email = auth.email()))
  with check (exists (select 1 from public.admins a where a.email = auth.email()));

-- Admin self-read policy
create policy "admins_self_read"
  on public.admins
  for select
  using (email = auth.email());

-- ==================== STORAGE BUCKET & POLICIES ====================

-- Create icons bucket (run this in Supabase Storage UI or via SQL if supported)
-- insert into storage.buckets (id, name, public) 
-- values ('icons', 'icons', true);

-- Public read policy for icons bucket
create policy "icons_public_read" 
  on storage.objects
  for select 
  using (bucket_id = 'icons');

-- Admin write policy for icons bucket
create policy "icons_admin_write" 
  on storage.objects
  for insert 
  to authenticated
  with check (
    bucket_id = 'icons' and
    exists (select 1 from public.admins a where a.email = auth.email())
  );

-- Admin update/delete policy for icons bucket
create policy "icons_admin_update_delete" 
  on storage.objects
  for all 
  to authenticated
  using (
    bucket_id = 'icons' and
    exists (select 1 from public.admins a where a.email = auth.email())
  );

-- ==================== INDEXES ====================

-- Performance indexes
create index if not exists idx_platforms_category on public.platforms(category);
create index if not exists idx_platforms_enabled on public.platforms(enabled);
create index if not exists idx_platforms_featured on public.platforms(featured);
create index if not exists idx_platforms_slug on public.platforms(slug);

-- ==================== INITIAL ADMIN ====================

-- Note: Insert your admin email manually after running this schema
-- INSERT INTO public.admins (email) VALUES ('your-email@example.com');

