-- ELVORA v5 Supabase schema
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role text not null default 'customer',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.profiles add column if not exists phone text;
alter table if exists public.profiles add column if not exists role text not null default 'customer';
alter table if exists public.profiles add column if not exists active boolean not null default true;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), name text not null unique,
  category text not null check (category in ('Chair','Beds','Sofa','Lamp')),
  price numeric(12,2) not null check (price >= 0), image text not null,
  description text not null default '', stock integer not null default 0 check (stock >= 0),
  active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null,
  customer_name text not null, email text not null, phone text not null, address text not null,
  payment_method text not null check (payment_method in ('cod','online')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed')),
  order_status text not null default 'placed' check (order_status in ('placed','confirmed','packed','shipped','delivered','cancelled')),
  subtotal numeric(12,2) not null default 0, discount numeric(12,2) not null default 0,
  total numeric(12,2) not null check (total >= 0), coupon_code text,
  razorpay_order_id text, razorpay_payment_id text, created_at timestamptz not null default now()
);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null, product_name text not null,
  price numeric(12,2) not null, quantity integer not null check (quantity > 0)
);
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null,
  product_id uuid references public.products(id) on delete cascade, rating integer not null check (rating between 1 and 5),
  body text not null, created_at timestamptz not null default now()
);
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(), code text unique not null,
  type text not null check (type in ('percent','fixed')), value numeric(12,2) not null check (value > 0),
  min_order numeric(12,2) not null default 0, max_discount numeric(12,2),
  usage_limit integer, used_count integer not null default 0, active boolean not null default true,
  starts_at timestamptz not null default now(), expires_at timestamptz, created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name','')) on conflict(id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin' and active=true); $$;

alter table public.profiles enable row level security; alter table public.products enable row level security; alter table public.orders enable row level security; alter table public.order_items enable row level security; alter table public.reviews enable row level security; alter table public.coupons enable row level security;

drop policy if exists "profile own read" on public.profiles; create policy "profile own read" on public.profiles for select using(id=auth.uid() or public.is_admin());
drop policy if exists "profile own update" on public.profiles; create policy "profile own update" on public.profiles for update using(id=auth.uid() or public.is_admin()) with check(id=auth.uid() or public.is_admin());
drop policy if exists "product public read" on public.products; create policy "product public read" on public.products for select using(active=true or public.is_admin());
drop policy if exists "product admin all" on public.products; create policy "product admin all" on public.products for all using(public.is_admin()) with check(public.is_admin());
drop policy if exists "order insert own" on public.orders; create policy "order insert own" on public.orders for insert with check(user_id=auth.uid());
drop policy if exists "order read own" on public.orders; create policy "order read own" on public.orders for select using(user_id=auth.uid() or public.is_admin());
drop policy if exists "order admin update" on public.orders; create policy "order admin update" on public.orders for update using(public.is_admin()) with check(public.is_admin());
drop policy if exists "item insert own" on public.order_items; create policy "item insert own" on public.order_items for insert with check(exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid()));
drop policy if exists "item read own" on public.order_items; create policy "item read own" on public.order_items for select using(exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_admin())));
drop policy if exists "review public read" on public.reviews; create policy "review public read" on public.reviews for select using(true);
drop policy if exists "review own insert" on public.reviews; create policy "review own insert" on public.reviews for insert with check(user_id=auth.uid());
drop policy if exists "coupon public read active" on public.coupons; create policy "coupon public read active" on public.coupons for select using(active=true and (expires_at is null or expires_at>now()) or public.is_admin());
drop policy if exists "coupon admin all" on public.coupons; create policy "coupon admin all" on public.coupons for all using(public.is_admin()) with check(public.is_admin());

insert into public.products(name,category,price,image,description,stock,active) values
('Arden Lounge Chair','Chair',399,'Chair 1.png','A refined lounge chair with a sculpted silhouette and premium comfort.',10,true),('Milo Accent Chair','Chair',299,'Chair 2.png','A compact accent chair designed for modern corners.',10,true),('Evelyn Armchair','Chair',519,'Chair 3.png','Soft curves and supportive seating for relaxed living.',10,true),('Nyantuy Chair','Chair',479,'Chair 4.png','Contemporary proportions with a calm, elegant finish.',10,true),
('Novi Sofa Beds','Beds',869,'Bed 1.png','A versatile sofa bed for flexible modern spaces.',10,true),('Liora Sofa Beds','Beds',699,'Bed 2.png','Comfort-first sofa bed with a clean contemporary profile.',10,true),('Velora Sofa Beds','Beds',949,'Bed 3.png','Premium sleep and seating in one refined design.',10,true),('Arden Sofa Beds','Beds',769,'Bed 4.png','A practical sofa bed with timeless ELVORA styling.',10,true),
('Velum Sofa','Sofa',592,'Sofa 1.png','A deep, welcoming sofa made for everyday living.',10,true),('Aurelia Sofa','Sofa',499,'Sofa 2.png','Minimal form with generous comfort and soft texture.',10,true),('Monroe Sofa','Sofa',519,'Sofa 3.png','Balanced proportions and a sophisticated lounge feel.',10,true),('Elara Sofa','Sofa',821,'Sofa 4.png','Statement seating with an elegant modern silhouette.',10,true),
('Astrid Floor Lamp','Lamp',392,'Lamp 1.png','A sculptural floor lamp for warm ambient light.',10,true),('Lunara Table Lamp','Lamp',299,'Lamp 2.png','A refined table lamp for desks and bedside spaces.',10,true),('Elio Pendant Lamp','Lamp',148,'Lamp 3.png','A clean pendant light with an architectural profile.',10,true),('Vera Arc Lamp','Lamp',229,'Lamp 4.png','An expressive arc lamp that elevates a reading corner.',10,true)
on conflict(name) do update set category=excluded.category,price=excluded.price,image=excluded.image,description=excluded.description,stock=excluded.stock,active=true,updated_at=now();

insert into public.coupons(code,type,value,min_order,max_discount,usage_limit,active) values ('WELCOME10','percent',10,100,1000,1000,true) on conflict(code) do nothing;

-- Optional Storage setup for product uploads. Create a public bucket named product-images in Storage UI if your project disallows DDL here.
-- Then add Storage policies allowing authenticated admins to insert/update/delete and public read access.
