create extension if not exists pgcrypto with schema extensions;

create table public.agreements (
  id uuid primary key default gen_random_uuid(),
  okdeal_id text not null unique,
  creator_id uuid not null references auth.users(id) on delete restrict,
  intended_recipient_name text not null check (char_length(intended_recipient_name) between 1 and 120),
  intended_recipient_email text not null check (char_length(intended_recipient_email) between 3 and 254),
  intended_recipient_phone text check (intended_recipient_phone is null or char_length(intended_recipient_phone) <= 40),
  share_token_hash text not null unique,
  status text not null default 'awaiting_review' check (status in ('awaiting_review','changes_requested','awaiting_signature','completed')),
  current_version integer not null default 1 check (current_version > 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index agreements_creator_created_idx on public.agreements (creator_id, created_at desc);

create table public.agreement_versions (
  id uuid primary key default gen_random_uuid(), agreement_id uuid not null references public.agreements(id) on delete restrict,
  version_number integer not null check (version_number > 0), title text not null check (char_length(title) between 1 and 200),
  description text not null check (char_length(description) between 1 and 10000), amount_minor bigint not null check (amount_minor > 0),
  currency text not null check (currency = 'MYR'), start_date date not null, completion_date date not null check (completion_date >= start_date),
  payment_terms text not null check (char_length(payment_terms) between 1 and 5000), additional_terms text check (additional_terms is null or char_length(additional_terms) <= 10000),
  proposed_by text not null check (proposed_by in ('creator','recipient')), created_at timestamptz not null default now(),
  unique (agreement_id, version_number)
);
create index agreement_versions_agreement_idx on public.agreement_versions (agreement_id, version_number desc);

create table public.agreement_events (
 id bigint generated always as identity primary key, agreement_id uuid not null references public.agreements(id) on delete restrict,
 event_type text not null, actor_role text not null check (actor_role in ('creator','recipient','system')), metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index agreement_events_agreement_idx on public.agreement_events (agreement_id, created_at desc);

alter table public.agreements enable row level security;
alter table public.agreement_versions enable row level security;
alter table public.agreement_events enable row level security;

create policy agreements_creator_read on public.agreements for select to authenticated using ((select auth.uid()) = creator_id);
create policy versions_creator_read on public.agreement_versions for select to authenticated using (exists (select 1 from public.agreements a where a.id = agreement_id and a.creator_id = (select auth.uid())));
create policy events_creator_read on public.agreement_events for select to authenticated using (exists (select 1 from public.agreements a where a.id = agreement_id and a.creator_id = (select auth.uid())));

create or replace function public.create_agreement(p_recipient_name text,p_recipient_email text,p_recipient_phone text,p_title text,p_description text,p_amount_minor bigint,p_currency text,p_start_date date,p_completion_date date,p_payment_terms text,p_additional_terms text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public, extensions as $$
declare v_id uuid := gen_random_uuid(); v_token uuid := gen_random_uuid(); v_okdeal_id text; v_user uuid := auth.uid();
begin
 if v_user is null then raise exception 'Authentication required'; end if;
 if p_currency <> 'MYR' then raise exception 'Unsupported currency'; end if;
 v_okdeal_id := 'OKD-' || upper(substr(replace(v_id::text,'-',''),1,10));
 insert into public.agreements(id,okdeal_id,creator_id,intended_recipient_name,intended_recipient_email,intended_recipient_phone,share_token_hash)
 values(v_id,v_okdeal_id,v_user,trim(p_recipient_name),lower(trim(p_recipient_email)),nullif(trim(p_recipient_phone),''),encode(digest(v_token::text,'sha256'),'hex'));
 insert into public.agreement_versions(agreement_id,version_number,title,description,amount_minor,currency,start_date,completion_date,payment_terms,additional_terms,proposed_by)
 values(v_id,1,trim(p_title),trim(p_description),p_amount_minor,p_currency,p_start_date,p_completion_date,trim(p_payment_terms),nullif(trim(p_additional_terms),''),'creator');
 insert into public.agreement_events(agreement_id,event_type,actor_role) values(v_id,'agreement_created','creator');
 return jsonb_build_object('id',v_id,'okdeal_id',v_okdeal_id,'share_token',v_token);
end $$;

create or replace function public.get_shared_agreement(p_share_token text,p_recipient_email text)
returns jsonb language sql stable security definer set search_path = pg_catalog, public, extensions as $$
 select jsonb_build_object('okdeal_id',a.okdeal_id,'status',a.status,'intended_recipient_name',a.intended_recipient_name,'title',v.title,'description',v.description,'amount_minor',v.amount_minor,'currency',v.currency,'start_date',v.start_date,'completion_date',v.completion_date,'payment_terms',v.payment_terms,'additional_terms',v.additional_terms,'version_number',v.version_number)
 from public.agreements a join public.agreement_versions v on v.agreement_id=a.id and v.version_number=a.current_version
 where a.share_token_hash=encode(digest(p_share_token,'sha256'),'hex') and a.intended_recipient_email=lower(trim(p_recipient_email)) limit 1
$$;

revoke all on function public.create_agreement(text,text,text,text,text,bigint,text,date,date,text,text) from public, anon;
grant execute on function public.create_agreement(text,text,text,text,text,bigint,text,date,date,text,text) to authenticated;
revoke all on function public.get_shared_agreement(text,text) from public, authenticated;
grant execute on function public.get_shared_agreement(text,text) to anon;
revoke all on public.agreements, public.agreement_versions, public.agreement_events from anon;
grant select on public.agreements, public.agreement_versions, public.agreement_events to authenticated;
