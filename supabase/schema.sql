-- BOSS production schema. Run in Supabase SQL editor.
create table if not exists profiles (id uuid primary key references auth.users(id) on delete cascade, name text, role text default 'customer' check (role in ('customer','admin')), phone text, created_at timestamptz default now());
create table if not exists products (id text primary key, type text not null check (type in ('website','chatbot')), name text not null, category text, description text, price numeric default 0, features jsonb default '[]'::jsonb, created_at timestamptz default now());
create table if not exists orders (id text primary key, user_id uuid references auth.users(id) on delete set null, product_id text references products(id), name text, email text, phone text, business text, notes text, price numeric, payment_method text, payment_status text default 'Pending', status text default 'New', payment_reference text, created_at timestamptz default now(), updated_at timestamptz default now(), delivery_url text, delivery_message text);
create table if not exists boss_packages (id text primary key, label text not null, one_time_price numeric not null check (one_time_price >= 0), monthly_price numeric not null check (monthly_price >= 0), created_at timestamptz default now());
alter table orders add column if not exists delivery_url text;
alter table orders add column if not exists delivery_message text;
alter table orders add column if not exists billing_type text default 'one-time';
alter table orders add column if not exists package_id text references boss_packages(id);
alter table orders add column if not exists subscription_plan_id text;
alter table orders add column if not exists subscription_status text default 'not_applicable';
alter table orders add column if not exists build_details jsonb default '{}'::jsonb;
create table if not exists projects (id text primary key, user_id uuid references auth.users(id) on delete cascade, product_id text references products(id), type text not null check (type in ('website','chatbot')), product_name text, data jsonb default '{}'::jsonb, live boolean default false, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists bot_messages (id bigint generated always as identity primary key, project_id text references projects(id) on delete cascade, sender text not null, message text not null, created_at timestamptz default now());
create table if not exists payment_events (id text primary key, order_id text references orders(id) on delete cascade, event_type text, payload jsonb, created_at timestamptz default now());

create or replace function public.admin_list_orders()
returns setof public.orders
language sql
stable
security definer
set search_path = public
as $$
  select o.*
  from public.orders o
  where exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  order by o.created_at desc;
$$;
revoke all on function public.admin_list_orders() from public;
grant execute on function public.admin_list_orders() to authenticated;

create or replace function public.prepare_order() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  if new.user_id is distinct from auth.uid() then
    raise exception 'Invalid order owner';
  end if;
  if new.product_id is null then
    raise exception 'product_id is required';
  end if;
  if new.package_id is not null then
    if new.billing_type = 'monthly' then
      select bp.monthly_price into new.price from public.boss_packages bp where bp.id = new.package_id;
    else
      select bp.one_time_price into new.price from public.boss_packages bp where bp.id = new.package_id;
    end if;
    if not found then
      raise exception 'Invalid BOSS package';
    end if;
  else
    select p.price into new.price from public.products p where p.id = new.product_id;
    if not found then
      raise exception 'Invalid product';
    end if;
  end if;
  if new.payment_status = 'Not required' or new.status = 'Build requested' then
    new.payment_status := 'Not required';
    new.status := 'Build requested';
    new.payment_reference := null;
    new.payment_method := 'not_required';
    new.billing_type := coalesce(new.billing_type, 'one-time');
    new.subscription_status := 'not_applicable';
  else
    new.payment_status := 'Pending';
    new.status := 'Awaiting payment';
    new.payment_reference := null;
    new.payment_method := coalesce(new.payment_method, 'flutterwave');
    new.subscription_status := case when new.billing_type = 'monthly' then coalesce(new.subscription_status, 'starter') else 'not_applicable' end;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists prepare_order_before_insert on public.orders;
create trigger prepare_order_before_insert
before insert on public.orders
for each row execute procedure public.prepare_order();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles(id,name) values(new.id, coalesce(new.raw_user_meta_data->>'name','Customer')) on conflict (id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table projects enable row level security;
alter table bot_messages enable row level security;
alter table payment_events enable row level security;
alter table boss_packages enable row level security;

drop policy if exists "packages public read" on boss_packages;
create policy "packages public read" on boss_packages for select using (true);

drop policy if exists "profiles own" on profiles;
create policy "profiles own" on profiles for select using (auth.uid()=id);
create or replace function public.profile_role(uid uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = uid;
$$;
revoke all on function public.profile_role(uuid) from public;
grant execute on function public.profile_role(uuid) to authenticated;

drop policy if exists "profiles self update" on profiles;
create policy "profiles self update" on profiles
for update
using (auth.uid()=id)
with check (auth.uid()=id and role = public.profile_role(auth.uid()));
drop policy if exists "products public read" on products;
create policy "products public read" on products for select using (true);

drop policy if exists "orders own read" on orders;
create policy "orders own read" on orders for select using (auth.uid()=user_id or exists(select 1 from profiles p where p.id=auth.uid() and p.role='admin'));
drop policy if exists "orders own insert" on orders;
create policy "orders own insert" on orders for insert with check (auth.uid()=user_id);
drop policy if exists "orders admin update" on orders;
create policy "orders admin update" on orders for update using (exists(select 1 from profiles p where p.id=auth.uid() and p.role='admin')) with check (exists(select 1 from profiles p where p.id=auth.uid() and p.role='admin'));

drop policy if exists "projects own" on projects;
create policy "projects own" on projects for all using (auth.uid()=user_id or exists(select 1 from profiles p where p.id=auth.uid() and p.role='admin')) with check (auth.uid()=user_id or exists(select 1 from profiles p where p.id=auth.uid() and p.role='admin'));
drop policy if exists "bot messages own" on bot_messages;
create policy "bot messages own" on bot_messages for all using (exists(select 1 from projects p where p.id=bot_messages.project_id and (p.user_id=auth.uid() or exists(select 1 from profiles x where x.id=auth.uid() and x.role='admin')))) with check (exists(select 1 from projects p where p.id=bot_messages.project_id and (p.user_id=auth.uid() or exists(select 1 from profiles x where x.id=auth.uid() and x.role='admin'))));

drop policy if exists "payment events admin" on payment_events;
create policy "payment events admin" on payment_events for select using (exists(select 1 from profiles p where p.id=auth.uid() and p.role='admin'));

-- Seed the current BOSS catalog.
insert into products(id,type,name,category,description,price,features) values
('restaurant-pro','website','Restaurant Pro','Restaurant','A conversion-focused restaurant site with menu, reservations and WhatsApp ordering.',79,'["Responsive design","Digital menu","WhatsApp CTA","Booking form","Google Maps section"]'),
('business-pro','website','Business Pro','Business','Clean company website for service businesses, agencies and growing brands.',99,'["5-page structure","Lead capture","Services section","Testimonials","Contact form"]'),
('store-pro','website','Store Pro','E-commerce','Modern storefront starter with product cards, cart preview and direct ordering.',149,'["Product catalog","Cart preview","Order CTA","Categories","Mobile-first"]'),
('portfolio-pro','website','Portfolio Pro','Portfolio','Minimal portfolio for creators, freelancers, photographers and developers.',59,'["Project gallery","About section","Testimonials","Contact CTA","Fast layout"]'),
('support-ai','chatbot','Support AI','Customer support','Answers FAQs, captures leads and directs customers to the right channel.',69,'["FAQ answers","Lead capture","Business hours","Escalation prompts","Website widget"]'),
('booking-ai','chatbot','Booking AI','Appointments','Guides visitors through bookings and collects the details your team needs.',89,'["Service selection","Customer details","Booking intent","FAQ support","Follow-up CTA"]'),
('sales-ai','chatbot','Sales AI','Sales','A sales assistant that helps visitors compare products and take the next step.',119,'["Product guidance","Objection handling","Lead capture","Offer prompts","CTA routing"]')
on conflict (id) do update set name=excluded.name,description=excluded.description,price=excluded.price,features=excluded.features,category=excluded.category;

insert into boss_packages(id,label,one_time_price,monthly_price) values
('starter','Starter',79,19),
('business','Business',149,29),
('pro','Pro',299,49)
on conflict (id) do update set label=excluded.label,one_time_price=excluded.one_time_price,monthly_price=excluded.monthly_price;

-- Dedicated table for the BOSS "Build with BOSS" done-for-you workflow.
create table if not exists public.build_requests (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null,
  business_name text not null,
  business_type text,
  country text,
  goals jsonb not null default '[]'::jsonb,
  channels jsonb not null default '[]'::jsonb,
  style text,
  plan text,
  notes text default '',
  recommended_website_id text,
  recommended_website_name text,
  recommended_bot_id text,
  recommended_bot_name text,
  status text not null default 'Build requested',
  admin_message text default '',
  delivery_url text default '',
  delivery_message text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.build_requests enable row level security;

drop policy if exists "build requests own read" on public.build_requests;
create policy "build requests own read" on public.build_requests for select
using (auth.uid() = user_id or public.profile_role(auth.uid()) = 'admin');

drop policy if exists "build requests own insert" on public.build_requests;
create policy "build requests own insert" on public.build_requests for insert
with check (auth.uid() = user_id);

drop policy if exists "build requests admin update" on public.build_requests;
create policy "build requests admin update" on public.build_requests for update
using (public.profile_role(auth.uid()) = 'admin')
with check (public.profile_role(auth.uid()) = 'admin');

create or replace function public.admin_list_build_requests()
returns setof public.build_requests
language sql
stable
security definer
set search_path = public
as $$
  select b.* from public.build_requests b
  where public.profile_role(auth.uid()) = 'admin'
  order by b.created_at desc;
$$;
revoke all on function public.admin_list_build_requests() from public;
grant execute on function public.admin_list_build_requests() to authenticated;

create or replace function public.prepare_build_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is null then new.user_id := auth.uid(); end if;
  if new.user_id is distinct from auth.uid() then raise exception 'Invalid build request owner'; end if;
  if coalesce(trim(new.name),'') = '' then raise exception 'Name is required'; end if;
  if coalesce(trim(new.email),'') = '' then raise exception 'Email is required'; end if;
  if coalesce(trim(new.phone),'') = '' then raise exception 'Phone is required'; end if;
  if coalesce(trim(new.business_name),'') = '' then raise exception 'Business name is required'; end if;
  new.status := 'Build requested';
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists prepare_build_request_before_insert on public.build_requests;
create trigger prepare_build_request_before_insert
before insert on public.build_requests
for each row execute procedure public.prepare_build_request();

