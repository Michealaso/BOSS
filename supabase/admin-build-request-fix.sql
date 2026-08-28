-- BOSS admin build request fix / migration
-- Run this once in Supabase SQL Editor on an existing BOSS database.

alter table public.orders
  add column if not exists build_details jsonb default '{}'::jsonb;

create or replace function public.admin_list_orders()
returns setof public.orders
language sql
stable
security definer
set search_path = public
as $$
  select o.*
  from public.orders o
  where exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  order by o.created_at desc;
$$;

revoke all on function public.admin_list_orders() from public;
grant execute on function public.admin_list_orders() to authenticated;


-- Strong admin queue RPC: returns every order only to an authenticated admin.
create or replace function public.admin_get_build_queue()
returns setof public.orders
language sql
stable
security definer
set search_path = public
as $$
  select o.*
  from public.orders o
  where exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
  order by o.created_at desc;
$$;
revoke all on function public.admin_get_build_queue() from public;
grant execute on function public.admin_get_build_queue() to authenticated;
