-- Sacred Basil: initial schema
-- Prices are whole rupees (integer). Razorpay amounts = rupees * 100.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profiles and roles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Profiles: a user may change their name/phone, never their role.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------
create table public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  tagline text not null default '',
  short_description text not null default '',
  description text not null default '',
  images text[] not null default '{}',
  contents jsonb not null default '[]',      -- [{name, quantity, size?, note?}]
  packaging text not null default '',
  dimensions text,
  variants jsonb,                            -- [{id, name}]
  tiers jsonb not null,                      -- [{min, max|null, unitPrice}]
  bespoke_from integer,
  customisation text,
  stock integer check (stock is null or stock >= 0),  -- null = made to order
  status text not null default 'draft' check (status in ('active', 'draft')),
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('SB' || nextval('public.order_number_seq')),
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  phone text not null,
  customer_name text not null,
  shipping_address jsonb not null,           -- {line1, line2, city, state, pincode, country}
  gift_message text,
  notes text,
  subtotal integer not null check (subtotal >= 0),
  discount integer not null default 0 check (discount >= 0),
  coupon_code text,
  shipping_fee integer not null default 0 check (shipping_fee >= 0),
  total integer not null check (total >= 0),
  currency text not null default 'INR',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded', 'failed')),
  razorpay_order_id text unique,
  razorpay_payment_id text,
  paid_at timestamptz,
  tracking_carrier text,
  tracking_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status, created_at desc);
create index orders_email_idx on public.orders (lower(email));

create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text not null references public.products (id),
  product_name text not null,
  variant text,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  line_total integer not null check (line_total >= 0)
);

create index order_items_order_idx on public.order_items (order_id);

-- Order status history (audit trail shown in admin)
create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status text not null,
  note text,
  actor uuid references auth.users (id),
  created_at timestamptz not null default now()
);

-- Webhook idempotency
create table public.payment_events (
  id text primary key,                       -- Razorpay event id (x-razorpay-event-id)
  type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Customers
-- ---------------------------------------------------------------------------
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text,
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.wishlist_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ---------------------------------------------------------------------------
-- Commerce settings, coupons, enquiries
-- ---------------------------------------------------------------------------
create table public.coupons (
  code text primary key check (code = upper(code)),
  kind text not null check (kind in ('percent', 'flat')),
  value integer not null check (value > 0),
  min_subtotal integer not null default 0,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer,
  used_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('corporate', 'general')),
  name text not null,
  email text not null,
  phone text,
  company text,
  quantity text,
  occasion text,
  collection text,
  budget text,
  delivery_location text,
  message text,
  status text not null default 'new' check (status in ('new', 'in_progress', 'quoted', 'won', 'closed')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.payment_events enable row level security;
alter table public.addresses enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.coupons enable row level security;
alter table public.settings enable row level security;
alter table public.enquiries enable row level security;

-- profiles
create policy "profiles: read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles: update own or admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- products: everyone reads active products; admins read and write all
create policy "products: public read active" on public.products
  for select using (status = 'active' or public.is_admin());
create policy "products: admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- orders: customers read their own; admins read and update all.
-- Orders are created only by the server (service role), never by clients.
create policy "orders: read own or admin" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());
create policy "orders: admin update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

create policy "order_items: read via order" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );

create policy "order_events: read via order" on public.order_events
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );
create policy "order_events: admin insert" on public.order_events
  for insert with check (public.is_admin());

-- payment_events: server only (service role bypasses RLS); admins may read
create policy "payment_events: admin read" on public.payment_events
  for select using (public.is_admin());

-- addresses & wishlist: owner only
create policy "addresses: owner" on public.addresses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "wishlist: owner" on public.wishlist_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- coupons: admin only (validated server-side)
create policy "coupons: admin" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

-- settings: public read, admin write
create policy "settings: public read" on public.settings for select using (true);
create policy "settings: admin write" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());

-- enquiries: created by the server; admins manage
create policy "enquiries: admin" on public.enquiries
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: product images (public read, admin write)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product-images: public read" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "product-images: admin insert" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());
create policy "product-images: admin update" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());
create policy "product-images: admin delete" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());
