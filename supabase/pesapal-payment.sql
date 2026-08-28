-- BOSS Pesapal payment schema migration. Safe to run after schema.sql/build-requests.sql.
alter table public.orders add column if not exists pesapal_tracking_id text;
alter table public.orders add column if not exists pesapal_merchant_reference text;
alter table public.orders add column if not exists payment_currency text default 'UGX';
alter table public.build_requests add column if not exists price numeric default 0;
alter table public.build_requests add column if not exists payment_status text default 'Awaiting payment';
alter table public.build_requests add column if not exists payment_method text default 'pesapal';
alter table public.build_requests add column if not exists payment_reference text;
alter table public.build_requests add column if not exists billing_type text default 'one-time';
alter table public.build_requests add column if not exists subscription_status text default 'not_applicable';
alter table public.build_requests add column if not exists pesapal_tracking_id text;
alter table public.build_requests add column if not exists pesapal_merchant_reference text;
alter table public.build_requests add column if not exists payment_currency text default 'UGX';

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
  select case coalesce(new.plan,'business') when 'starter' then 79 when 'business' then 149 when 'pro' then 299 else 149 end into new.price;
  new.payment_method := coalesce(nullif(new.payment_method,''),'pesapal');
  new.payment_status := coalesce(nullif(new.payment_status,''),'Awaiting payment');
  new.billing_type := coalesce(nullif(new.billing_type,''),'one-time');
  new.status := case when new.payment_status = 'Paid' then 'Build requested' else 'Awaiting payment' end;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists prepare_build_request_before_insert on public.build_requests;
create trigger prepare_build_request_before_insert before insert on public.build_requests for each row execute procedure public.prepare_build_request();

create or replace function public.submit_build_request(
  p_id text,p_name text,p_email text,p_phone text,p_business_name text,p_business_type text,p_country text,
  p_goals jsonb,p_channels jsonb,p_style text,p_plan text,p_notes text,p_recommended_website_id text,
  p_recommended_website_name text,p_recommended_bot_id text,p_recommended_bot_name text
) returns public.build_requests language plpgsql security definer set search_path = public as $$
declare result public.build_requests;
begin
  if auth.uid() is null then raise exception 'You must be signed in to submit a build request.'; end if;
  insert into public.build_requests(id,user_id,name,email,phone,business_name,business_type,country,goals,channels,style,plan,notes,recommended_website_id,recommended_website_name,recommended_bot_id,recommended_bot_name,status,payment_status,payment_method,billing_type,payment_currency)
  values(p_id,auth.uid(),trim(p_name),trim(p_email),trim(p_phone),trim(p_business_name),nullif(trim(p_business_type),''),nullif(trim(p_country),''),coalesce(p_goals,'[]'::jsonb),coalesce(p_channels,'[]'::jsonb),nullif(trim(p_style),''),nullif(trim(p_plan),''),coalesce(p_notes,''),nullif(trim(p_recommended_website_id),''),nullif(trim(p_recommended_website_name),''),nullif(trim(p_recommended_bot_id),''),nullif(trim(p_recommended_bot_name),''),'Awaiting payment','Awaiting payment','pesapal','one-time',coalesce(current_setting('app.pesapal_currency',true),'UGX')) returning * into result;
  return result;
end; $$;
revoke all on function public.submit_build_request(text,text,text,text,text,text,text,jsonb,jsonb,text,text,text,text,text,text,text) from public;
grant execute on function public.submit_build_request(text,text,text,text,text,text,text,jsonb,jsonb,text,text,text,text,text,text,text) to authenticated;
