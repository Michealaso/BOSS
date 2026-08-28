-- BOSS dedicated Build with BOSS request table.
-- Run this once in Supabase SQL Editor after the main schema.
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

create or replace function public.profile_role(uid uuid)
returns text language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = uid; $$;
revoke all on function public.profile_role(uuid) from public;
grant execute on function public.profile_role(uuid) to authenticated;

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
language sql stable security definer set search_path = public
as $$
  select b.* from public.build_requests b
  where public.profile_role(auth.uid()) = 'admin'
  order by b.created_at desc;
$$;
revoke all on function public.admin_list_build_requests() from public;
grant execute on function public.admin_list_build_requests() to authenticated;

create or replace function public.prepare_build_request()
returns trigger language plpgsql security definer set search_path = public
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


-- BOSS v13: use a security-definer submission RPC so the customer-facing app
-- never depends on direct INSERT privileges on the build_requests table.
create or replace function public.submit_build_request(
  p_id text,
  p_name text,
  p_email text,
  p_phone text,
  p_business_name text,
  p_business_type text,
  p_country text,
  p_goals jsonb,
  p_channels jsonb,
  p_style text,
  p_plan text,
  p_notes text,
  p_recommended_website_id text,
  p_recommended_website_name text,
  p_recommended_bot_id text,
  p_recommended_bot_name text
)
returns public.build_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.build_requests;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to submit a build request.';
  end if;
  insert into public.build_requests (
    id, user_id, name, email, phone, business_name, business_type, country,
    goals, channels, style, plan, notes,
    recommended_website_id, recommended_website_name,
    recommended_bot_id, recommended_bot_name,
    status, admin_message, delivery_url, delivery_message
  ) values (
    p_id, auth.uid(), trim(p_name), trim(p_email), trim(p_phone), trim(p_business_name),
    nullif(trim(p_business_type),''), nullif(trim(p_country),''),
    coalesce(p_goals, '[]'::jsonb), coalesce(p_channels, '[]'::jsonb),
    nullif(trim(p_style),''), nullif(trim(p_plan),''), coalesce(p_notes,''),
    nullif(trim(p_recommended_website_id),''), nullif(trim(p_recommended_website_name),''),
    nullif(trim(p_recommended_bot_id),''), nullif(trim(p_recommended_bot_name),''),
    'Build requested', '', '', ''
  )
  returning * into result;
  return result;
end;
$$;
revoke all on function public.submit_build_request(text,text,text,text,text,text,text,jsonb,jsonb,text,text,text,text,text,text,text) from public;
grant execute on function public.submit_build_request(text,text,text,text,text,text,text,jsonb,jsonb,text,text,text,text,text,text,text) to authenticated;

-- Ensure authenticated users can read their own requests, while updates remain admin-only.
-- These grants do not replace RLS; they allow the policies/functions to be evaluated.
grant usage on schema public to authenticated;
grant select on public.build_requests to authenticated;

-- Admin-only update RPC avoids depending on client UPDATE grants/policies.
create or replace function public.admin_update_build_request(
  p_id text,
  p_status text default null,
  p_admin_message text default null,
  p_delivery_url text default null,
  p_delivery_message text default null
)
returns public.build_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.build_requests;
begin
  if public.profile_role(auth.uid()) <> 'admin' then
    raise exception 'Admin access required.';
  end if;
  update public.build_requests
  set status = coalesce(p_status, status),
      admin_message = coalesce(p_admin_message, admin_message),
      delivery_url = coalesce(p_delivery_url, delivery_url),
      delivery_message = coalesce(p_delivery_message, delivery_message),
      updated_at = now()
  where id = p_id
  returning * into result;
  if result.id is null then
    raise exception 'Build request not found: %', p_id;
  end if;
  return result;
end;
$$;
revoke all on function public.admin_update_build_request(text,text,text,text,text) from public;
grant execute on function public.admin_update_build_request(text,text,text,text,text) to authenticated;

-- Strong admin list RPC. It is deliberately the canonical admin read path.
create or replace function public.admin_list_build_requests()
returns setof public.build_requests
language sql
security definer
set search_path = public
as $$
  select b.*
  from public.build_requests b
  where public.profile_role(auth.uid()) = 'admin'
  order by b.created_at desc;
$$;
revoke all on function public.admin_list_build_requests() from public;
grant execute on function public.admin_list_build_requests() to authenticated;
