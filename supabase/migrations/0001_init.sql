-- Arten schema: artworks (one-of-a-kind originals), orders, and admin users.
-- Run this in the Supabase SQL editor (or `supabase db push`).

create extension if not exists pgcrypto;

-- ─── Admins ────────────────────────────────────────────────────────────────
-- A signed-in Supabase user is an admin only if their id is listed here.
-- Add one with:
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'artist@example.com';
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ─── Artworks ──────────────────────────────────────────────────────────────
create type public.artwork_status as enum ('available', 'reserved', 'sold');

create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  medium text not null default '',
  dimensions text not null default '',
  year integer,
  -- Whole Kenyan shillings.
  price_kes integer not null check (price_kes > 0),
  status public.artwork_status not null default 'available',
  is_published boolean not null default false,
  is_featured boolean not null default false,
  -- Storage paths inside the `artworks` bucket; the first is the cover.
  images text[] not null default '{}',
  -- Set while a buyer is in Stripe Checkout, so nobody else can buy it.
  reserved_until timestamptz,
  reserved_order_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index artworks_published_idx on public.artworks (is_published, created_at desc);

-- ─── Orders ────────────────────────────────────────────────────────────────
create type public.order_status as enum (
  'pending',    -- buyer is in Stripe Checkout
  'paid',       -- payment confirmed by webhook; needs fulfilling
  'shipped',    -- out for delivery / ready for pickup
  'delivered',  -- in the buyer's hands
  'cancelled',  -- cancelled by the admin (refund in Stripe if paid)
  'expired'     -- checkout abandoned
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  -- Short human-friendly reference shown to buyers and in the admin.
  reference text not null unique
    default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  -- Lets the buyer's browser cancel its own checkout without a login.
  cancel_token uuid not null default gen_random_uuid(),
  status public.order_status not null default 'pending',
  artwork_id uuid references public.artworks (id) on delete set null,
  -- Snapshot at purchase time so later edits don't rewrite history.
  artwork_title text not null,
  artwork_price_kes integer not null,
  delivery_method text,
  delivery_fee_kes integer,
  total_kes integer,
  customer_name text,
  customer_email text,
  customer_phone text,
  shipping_address jsonb,
  notes text not null default '',
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_status_idx on public.orders (status, created_at desc);

alter table public.artworks
  add constraint artworks_reserved_order_fk
  foreign key (reserved_order_id) references public.orders (id) on delete set null;

-- ─── updated_at ────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger artworks_touch before update on public.artworks
  for each row execute function public.touch_updated_at();
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

-- ─── Checkout reservation ──────────────────────────────────────────────────
-- Atomically claims an artwork for one checkout. Returns the artwork row, or
-- nothing if it is sold, unpublished, or held by another live checkout.
create or replace function public.reserve_artwork(
  p_artwork_id uuid,
  p_order_id uuid,
  p_minutes integer
)
returns setof public.artworks
language sql
security definer
set search_path = public
as $$
  update public.artworks
     set status = 'reserved',
         reserved_until = now() + make_interval(mins => p_minutes),
         reserved_order_id = p_order_id
   where id = p_artwork_id
     and is_published
     and (
       status = 'available'
       or (status = 'reserved' and reserved_until < now())
     )
  returning *;
$$;

-- Releases a reservation, but only if this order still holds it.
create or replace function public.release_artwork(p_order_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.artworks
     set status = 'available', reserved_until = null, reserved_order_id = null
   where reserved_order_id = p_order_id and status = 'reserved';
$$;

-- Only the server (service role) may call the checkout functions.
revoke all on function public.reserve_artwork(uuid, uuid, integer) from public, anon, authenticated;
revoke all on function public.release_artwork(uuid) from public, anon, authenticated;
grant execute on function public.reserve_artwork(uuid, uuid, integer) to service_role;
grant execute on function public.release_artwork(uuid) to service_role;

-- ─── Row level security ────────────────────────────────────────────────────
alter table public.admins enable row level security;
alter table public.artworks enable row level security;
alter table public.orders enable row level security;

create policy "admins read admins" on public.admins
  for select using (public.is_admin());

create policy "public reads published artworks" on public.artworks
  for select using (is_published or public.is_admin());
create policy "admins insert artworks" on public.artworks
  for insert with check (public.is_admin());
create policy "admins update artworks" on public.artworks
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admins delete artworks" on public.artworks
  for delete using (public.is_admin());

-- Orders are created and paid by the server with the service role key;
-- admins manage fulfilment.
create policy "admins read orders" on public.orders
  for select using (public.is_admin());
create policy "admins update orders" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

-- ─── Image storage ─────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('artworks', 'artworks', true)
on conflict (id) do nothing;

create policy "admins upload artwork images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'artworks' and public.is_admin());
create policy "admins update artwork images" on storage.objects
  for update to authenticated
  using (bucket_id = 'artworks' and public.is_admin());
create policy "admins delete artwork images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'artworks' and public.is_admin());
