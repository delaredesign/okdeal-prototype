alter table public.agreements add column accepted_version integer;
alter table public.agreements add column accepted_at timestamptz;
alter table public.agreements add column locked_at timestamptz;
alter table public.agreements drop constraint agreements_status_check;
alter table public.agreements add constraint agreements_status_check check (status in ('awaiting_review','changes_requested','awaiting_signatures','completed'));

create table public.change_requests (
  id uuid primary key default gen_random_uuid(), agreement_id uuid not null references public.agreements(id) on delete restrict,
  version_number integer not null, message text not null check (char_length(message) between 1 and 3000),
  requested_by uuid not null references auth.users(id) on delete restrict, requested_at timestamptz not null default now()
);
create index change_requests_agreement_idx on public.change_requests(agreement_id, requested_at desc);

create table public.agreement_signatures (
  id uuid primary key default gen_random_uuid(), agreement_id uuid not null references public.agreements(id) on delete restrict,
  version_number integer not null, signer_role text not null check (signer_role in ('creator','recipient')),
  signer_user_id uuid not null references auth.users(id) on delete restrict, signer_name text not null check (char_length(signer_name) between 2 and 150),
  signer_email text not null, signed_at timestamptz not null default now(),
  unique(agreement_id, version_number, signer_role)
);
create index agreement_signatures_agreement_idx on public.agreement_signatures(agreement_id, version_number);

alter table public.change_requests enable row level security;
alter table public.agreement_signatures enable row level security;
create policy change_requests_creator_read on public.change_requests for select to authenticated using (exists(select 1 from public.agreements a where a.id=agreement_id and a.creator_id=(select auth.uid())));
create policy signatures_creator_read on public.agreement_signatures for select to authenticated using (exists(select 1 from public.agreements a where a.id=agreement_id and a.creator_id=(select auth.uid())));
grant select on public.change_requests, public.agreement_signatures to authenticated;
revoke all on public.change_requests, public.agreement_signatures from anon;

create or replace function public.request_agreement_changes(p_share_token text,p_message text) returns void language plpgsql security definer set search_path=pg_catalog,public,extensions as $$
declare a public.agreements; v_email text:=lower(coalesce(auth.jwt()->>'email',''));
begin select * into a from public.agreements where share_token_hash=encode(digest(p_share_token,'sha256'),'hex') for update;
 if a.id is null or auth.uid() is null or v_email<>a.intended_recipient_email then raise exception 'Recipient verification required'; end if;
 if a.locked_at is not null then raise exception 'Agreement is locked'; end if;
 if char_length(trim(p_message)) not between 1 and 3000 then raise exception 'Invalid change request'; end if;
 insert into public.change_requests(agreement_id,version_number,message,requested_by) values(a.id,a.current_version,trim(p_message),auth.uid());
 update public.agreements set status='changes_requested',updated_at=now() where id=a.id;
 insert into public.agreement_events(agreement_id,event_type,actor_role,metadata) values(a.id,'changes_requested','recipient',jsonb_build_object('version',a.current_version));
end $$;

create or replace function public.create_agreement_revision(p_agreement_id uuid,p_expected_version integer,p_title text,p_description text,p_amount_minor bigint,p_currency text,p_start_date date,p_completion_date date,p_payment_terms text,p_additional_terms text) returns integer language plpgsql security definer set search_path=pg_catalog,public as $$
declare a public.agreements; v_next integer;
begin select * into a from public.agreements where id=p_agreement_id for update;
 if a.creator_id is distinct from auth.uid() then raise exception 'Not authorized'; end if;
 if a.locked_at is not null then raise exception 'Agreement is locked'; end if;
 if a.current_version<>p_expected_version then raise exception 'A newer version already exists'; end if;
 if p_currency<>'MYR' then raise exception 'Unsupported currency'; end if;
 v_next:=a.current_version+1;
 insert into public.agreement_versions(agreement_id,version_number,title,description,amount_minor,currency,start_date,completion_date,payment_terms,additional_terms,proposed_by) values(a.id,v_next,trim(p_title),trim(p_description),p_amount_minor,p_currency,p_start_date,p_completion_date,trim(p_payment_terms),nullif(trim(p_additional_terms),''),'creator');
 update public.agreements set current_version=v_next,status='awaiting_review',accepted_version=null,accepted_at=null,updated_at=now() where id=a.id;
 insert into public.agreement_events(agreement_id,event_type,actor_role,metadata) values(a.id,'version_created','creator',jsonb_build_object('version',v_next)); return v_next;
end $$;

create or replace function public.accept_agreement(p_share_token text) returns void language plpgsql security definer set search_path=pg_catalog,public,extensions as $$
declare a public.agreements; v_email text:=lower(coalesce(auth.jwt()->>'email',''));
begin select * into a from public.agreements where share_token_hash=encode(digest(p_share_token,'sha256'),'hex') for update;
 if a.id is null or auth.uid() is null or v_email<>a.intended_recipient_email then raise exception 'Recipient verification required'; end if;
 if a.locked_at is not null then raise exception 'Agreement is locked'; end if;
 if a.status<>'awaiting_review' then raise exception 'Agreement is not awaiting review'; end if;
 update public.agreements set accepted_version=current_version,accepted_at=now(),status='awaiting_signatures',updated_at=now() where id=a.id;
 insert into public.agreement_events(agreement_id,event_type,actor_role,metadata) values(a.id,'version_accepted','recipient',jsonb_build_object('version',a.current_version));
end $$;

create or replace function public.sign_agreement(p_agreement_id uuid,p_share_token text,p_signer_name text,p_signer_role text) returns void language plpgsql security definer set search_path=pg_catalog,public,extensions as $$
declare a public.agreements; v_email text:=lower(coalesce(auth.jwt()->>'email','')); v_role text;
begin select * into a from public.agreements where id=p_agreement_id or share_token_hash=encode(digest(coalesce(p_share_token,''),'sha256'),'hex') for update;
 if a.id is null or auth.uid() is null then raise exception 'Verification required'; end if;
 if a.locked_at is not null then raise exception 'Agreement is locked'; end if;
 if a.accepted_version is distinct from a.current_version or a.status<>'awaiting_signatures' then raise exception 'Current version is not accepted'; end if;
 v_role:=case when a.creator_id=auth.uid() and p_signer_role='creator' then 'creator' when v_email=a.intended_recipient_email and p_signer_role='recipient' then 'recipient' end;
 if v_role is null then raise exception 'Not authorized to sign in this role'; end if;
 insert into public.agreement_signatures(agreement_id,version_number,signer_role,signer_user_id,signer_name,signer_email) values(a.id,a.current_version,v_role,auth.uid(),trim(p_signer_name),v_email);
 insert into public.agreement_events(agreement_id,event_type,actor_role,metadata) values(a.id,'agreement_signed',v_role,jsonb_build_object('version',a.current_version));
 if (select count(*) from public.agreement_signatures where agreement_id=a.id and version_number=a.current_version)=2 then
   update public.agreements set status='completed',locked_at=now(),updated_at=now() where id=a.id;
   insert into public.agreement_events(agreement_id,event_type,actor_role,metadata) values(a.id,'agreement_completed','system',jsonb_build_object('version',a.current_version));
 end if;
end $$;

create or replace function public.get_shared_agreement(p_share_token text,p_recipient_email text) returns jsonb language sql stable security definer set search_path=pg_catalog,public,extensions as $$
 select jsonb_build_object('id',a.id,'okdeal_id',a.okdeal_id,'status',a.status,'locked_at',a.locked_at,'accepted_version',a.accepted_version,'intended_recipient_name',a.intended_recipient_name,'title',v.title,'description',v.description,'amount_minor',v.amount_minor,'currency',v.currency,'start_date',v.start_date,'completion_date',v.completion_date,'payment_terms',v.payment_terms,'additional_terms',v.additional_terms,'version_number',v.version_number,'creator_signed',exists(select 1 from public.agreement_signatures s where s.agreement_id=a.id and s.version_number=a.current_version and s.signer_role='creator'),'recipient_signed',exists(select 1 from public.agreement_signatures s where s.agreement_id=a.id and s.version_number=a.current_version and s.signer_role='recipient')) from public.agreements a join public.agreement_versions v on v.agreement_id=a.id and v.version_number=a.current_version where a.share_token_hash=encode(digest(p_share_token,'sha256'),'hex') and a.intended_recipient_email=lower(trim(p_recipient_email)) limit 1
$$;

revoke all on function public.request_agreement_changes(text,text),public.create_agreement_revision(uuid,integer,text,text,bigint,text,date,date,text,text),public.accept_agreement(text),public.sign_agreement(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.request_agreement_changes(text,text),public.accept_agreement(text) to authenticated;
grant execute on function public.create_agreement_revision(uuid,integer,text,text,bigint,text,date,date,text,text),public.sign_agreement(uuid,text,text,text) to authenticated;
