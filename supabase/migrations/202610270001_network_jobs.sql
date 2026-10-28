-- Apply through the Supabase SQL editor or `supabase db push`.
create extension if not exists pgcrypto;
create schema if not exists extensions;
create extension if not exists unaccent with schema extensions;
create text search configuration public.portuguese_unaccent (copy=pg_catalog.portuguese);
do $$
declare extension_schema text;
begin
 select n.nspname into extension_schema from pg_extension e join pg_namespace n on n.oid=e.extnamespace where e.extname='unaccent';
 execute format('alter text search configuration public.portuguese_unaccent alter mapping for hword,hword_part,word with %I.unaccent,pg_catalog.portuguese_stem',extension_schema);
end $$;
revoke create on schema public from public,anon,authenticated;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check(length(display_name) between 2 and 100), city text not null default '' check(length(city)<=80),
 role text not null default 'candidate' check(role in ('candidate','company','admin')), created_at timestamptz not null default now()
);
create function public.is_admin() returns boolean language sql stable security definer set search_path=public,pg_temp as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin') $$;
create function public.new_user() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 insert into public.profiles(id,display_name,city) values(new.id,left(coalesce(nullif(new.raw_user_meta_data->>'display_name',''),'Candidato'),100),left(coalesce(new.raw_user_meta_data->>'city',''),80));
 if new.raw_user_meta_data->>'policy_version'='2026-10-draft' then insert into public.consents(user_id,policy_version) values(new.id,'2026-10-draft');end if;
 return new;
end $$;
create trigger on_user_created after insert on auth.users for each row execute function public.new_user();

create table public.organizations (
 id uuid primary key default gen_random_uuid(),owner_id uuid not null unique references public.profiles(id) on delete cascade,
 name text not null check(length(name) between 3 and 150), website text not null, verification_notes text not null default '',
 status text not null default 'pending' check(status in ('pending','approved','rejected','suspended')),
 verified_at timestamptz,created_at timestamptz not null default now()
);
create table public.sources (
 id uuid primary key default gen_random_uuid(),name text not null check(length(name) between 2 and 150),url text not null unique,
 kind text not null default 'manual' check(kind in ('manual','authorized_csv','official_api')),
 permission_reference text not null check(length(permission_reference)>=20),
 status text not null default 'pending' check(status in ('pending','approved','rejected','suspended')),
 created_at timestamptz not null default now()
);
create function public.safe_url(value text) returns boolean language sql immutable as $$
 select coalesce(value ~ '^https://[A-Za-z0-9.-]+\.[A-Za-z]{2,}(/[^[:space:]]*)?$'
 and value !~* '^https://([^/]+\.)?(localhost|local|internal|test|invalid|example|lan|home|onion|bit\.ly|tinyurl\.com|t\.co|shorturl\.at|is\.gd|cutt\.ly|rebrand\.ly|rb\.gy|ow\.ly|buff\.ly|goo\.gl)(/|$)', false)
$$;
alter table public.organizations add constraint org_url_safe check(public.safe_url(website));
alter table public.sources add constraint source_url_safe check(public.safe_url(url));
create table public.opportunities (
 id uuid primary key default gen_random_uuid(), slug text not null unique default gen_random_uuid()::text,
 title text not null check(length(title) between 6 and 150),description text not null check(length(description) between 40 and 6000),
 kind text not null check(kind in ('aprendiz','estagio','emprego','curso','evento')),area text not null check(length(area) between 2 and 80),
 city text not null check(length(city) between 2 and 80),state text not null default 'SE' check(state='SE'),
 modality text not null check(modality in ('presencial','remoto','hibrido')),education text not null default '',
 experience text not null default 'nao_informado' check(experience in ('nao','sim','nao_informado')),
 salary text not null default '', min_age integer,max_age integer,age_justification text not null default '',hours integer check(hours between 0 and 10000),
 requirements text not null check(length(requirements) between 10 and 3000),free boolean not null default false,
 original_url text not null unique check(public.safe_url(original_url)),source_name text not null,source_url text not null check(public.safe_url(source_url)),
 source_id uuid references public.sources(id),organization_id uuid references public.organizations(id) on delete cascade,
 source_kind text not null default 'manual',external_id text,
 verification_status text not null default 'pending' check(verification_status in ('pending','verified','rejected')),
 verified_at timestamptz,published_at timestamptz,closing_at timestamptz,last_checked_at timestamptz,
 created_by uuid not null default auth.uid() references public.profiles(id) on delete cascade,
 moderation_status text not null default 'pending' check(moderation_status in ('pending','approved','rejected','closed','suspended')),
 safety_review boolean not null default false,review_reason text,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 search_document tsvector generated always as (to_tsvector('public.portuguese_unaccent',title||' '||description||' '||area||' '||source_name||' '||city)) stored,
 check(min_age is null or min_age between 14 and 99),check(max_age is null or max_age between 14 and 99),
 check(kind<>'emprego' or ((min_age is null or min_age>=16) and (max_age is null or max_age>=16))),check(min_age is null or max_age is null or max_age>=min_age),
 check((min_age is null and max_age is null) or length(age_justification)>=20),check(kind<>'curso' or free)
);
create unique index opportunity_external on public.opportunities(source_id,external_id) where external_id is not null;
create index opportunity_search on public.opportunities using gin(search_document);
create index opportunity_listing on public.opportunities(moderation_status,kind,city,published_at desc);
create index opportunity_owner on public.opportunities(created_by);
create table public.favorites(user_id uuid references public.profiles(id) on delete cascade,opportunity_id uuid references public.opportunities(id) on delete cascade,created_at timestamptz default now(),primary key(user_id,opportunity_id));
create table public.reports(id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,opportunity_id uuid not null references public.opportunities(id) on delete cascade,reason text not null check(length(reason) between 15 and 2000),status text not null default 'pending' check(status in ('pending','resolved')),resolution text,created_at timestamptz not null default now());
create table public.consents(user_id uuid references public.profiles(id) on delete cascade,policy_version text not null,accepted_at timestamptz not null default now(),primary key(user_id,policy_version));
create table public.audit_logs(id uuid primary key default gen_random_uuid(),actor_id uuid references public.profiles(id) on delete set null,entity text not null,entity_id uuid not null,old_status text,new_status text,reason text,created_at timestamptz not null default now());
create index report_owner on public.reports(user_id);
create index audit_date on public.audit_logs(created_at desc);
create table public.rate_limits(user_id uuid references public.profiles(id) on delete cascade,action text not null,window_start timestamptz not null default now(),hits integer not null default 1,primary key(user_id,action));
create function public.enforce_quota(action_name text,maximum integer) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare n integer;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 insert into public.rate_limits(user_id,action) values(auth.uid(),action_name)
 on conflict(user_id,action) do update set hits=case when rate_limits.window_start<now()-interval '1 hour' then 1 else rate_limits.hits+1 end,window_start=case when rate_limits.window_start<now()-interval '1 hour' then now() else rate_limits.window_start end returning hits into n;
 if n>maximum then raise exception 'Limite de envios por hora atingido'; end if;
end $$;
create function public.public_provenance(source uuid,org uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select (source is not null or org is not null)
 and (source is null or exists(select 1 from public.sources where id=source and status='approved'))
 and (org is null or exists(select 1 from public.organizations where id=org and status='approved'))
$$;
create function public.review_opportunity() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not public.is_admin() then
  if tg_op='INSERT' then
   perform public.enforce_quota('opportunity',10);
   new.created_by=auth.uid();
  else
   perform public.enforce_quota('opportunity_edit',30);
   if new.created_by<>old.created_by or new.organization_id is distinct from old.organization_id then raise exception 'Ownership immutable'; end if;
  end if;
  if not exists(select 1 from public.organizations where id=new.organization_id and owner_id=auth.uid()) then raise exception 'Organization required'; end if;
  new.moderation_status=case when new.moderation_status='closed' then 'closed' else 'pending' end;
  new.verified_at=null;new.published_at=null;new.last_checked_at=null;new.verification_status='pending';new.safety_review=false;new.review_reason=null;new.source_id=null;
 end if;
 if new.moderation_status='approved' then
  if not public.public_provenance(new.source_id,new.organization_id) then raise exception 'Proveniência aprovada obrigatória'; end if;
  if not new.safety_review or length(coalesce(new.review_reason,''))<20 then raise exception 'Revisão de segurança e justificativa obrigatórias'; end if;
  if new.closing_at is not null and new.closing_at<=now() then raise exception 'Prazo expirado'; end if;
  new.verified_at=now();new.last_checked_at=now();new.verification_status='verified';new.published_at=coalesce(new.published_at,now());
 end if;
 new.updated_at=now();return new;
end $$;
create trigger validate_opportunity before insert or update on public.opportunities for each row execute function public.review_opportunity();
create function public.audit_review() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare oldstate text;newstate text; note text;
begin
 if tg_table_name='opportunities' then
  newstate=new.moderation_status; note=new.review_reason;if tg_op='UPDATE' then oldstate=old.moderation_status;end if;
 else
  newstate=new.status;if tg_op='UPDATE' then oldstate=old.status;end if;
  if tg_table_name='organizations' then note=new.verification_notes;elsif tg_table_name='sources' then note=new.permission_reference;else note=new.resolution;end if;
 end if;
 if oldstate is distinct from newstate then insert into public.audit_logs(actor_id,entity,entity_id,old_status,new_status,reason) values(auth.uid(),tg_table_name,new.id,oldstate,newstate,note);end if;
 return new;
end $$;
create trigger audit_opportunity after insert or update on public.opportunities for each row execute function public.audit_review();
create trigger audit_org after insert or update on public.organizations for each row execute function public.audit_review();
create trigger audit_source after insert or update on public.sources for each row execute function public.audit_review();
create trigger audit_report after insert or update on public.reports for each row execute function public.audit_review();
create function public.report_quota() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$ begin perform public.enforce_quota('report',5);new.user_id=auth.uid();return new;end $$;
create trigger report_rate before insert on public.reports for each row execute function public.report_quota();
create function public.register_organization(org_name text,org_website text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if auth.uid() is null or not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise exception 'Confirme seu e-mail';end if;
 if exists(select 1 from public.profiles where id=auth.uid() and role<>'candidate') then raise exception 'Conta já possui papel atribuído';end if;
 insert into public.organizations(owner_id,name,website) values(auth.uid(),org_name,org_website);
 update public.profiles set role='company' where id=auth.uid();
end $$;
create function public.delete_own_account() returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if auth.uid() is null or public.is_admin() then raise exception 'Operação não permitida';end if;
 delete from auth.users where id=auth.uid();
end $$;
-- Explicit RLS on every table; client-supplied roles are never trusted.
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.sources enable row level security;
alter table public.opportunities enable row level security;
alter table public.favorites enable row level security;
alter table public.reports enable row level security;
alter table public.consents enable row level security;
alter table public.audit_logs enable row level security;
alter table public.rate_limits enable row level security;
create policy profile_private on public.profiles for select to authenticated using(id=auth.uid() or public.is_admin());
create policy profile_self on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy org_private on public.organizations for select to authenticated using(owner_id=auth.uid() or public.is_admin());
create policy org_review on public.organizations for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy source_read on public.sources for select to authenticated using(public.is_admin());
create policy source_admin on public.sources for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy published on public.opportunities for select to anon,authenticated using(moderation_status='approved' and verification_status='verified' and verified_at>now()-interval '30 days' and (closing_at is null or closing_at>now()) and public.public_provenance(source_id,organization_id));
create policy owner_read on public.opportunities for select to authenticated using(created_by=auth.uid() or public.is_admin());
create policy opportunity_insert on public.opportunities for insert to authenticated with check(public.is_admin() or (created_by=auth.uid() and exists(select 1 from public.organizations where id=organization_id and owner_id=auth.uid())));
create policy opportunity_update on public.opportunities for update to authenticated using(public.is_admin() or created_by=auth.uid()) with check(public.is_admin() or created_by=auth.uid());
create policy favorite_private on public.favorites for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and exists(select 1 from public.opportunities where id=opportunity_id));
create policy report_private on public.reports for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy report_insert on public.reports for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.opportunities where id=opportunity_id));
create policy report_moderate on public.reports for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy consent_private on public.consents for select to authenticated using(user_id=auth.uid());
create policy consent_insert on public.consents for insert to authenticated with check(user_id=auth.uid() and policy_version='2026-10-draft');
create policy audit_admin on public.audit_logs for select to authenticated using(public.is_admin());
revoke all on public.profiles,public.organizations,public.sources,public.opportunities,public.favorites,public.reports,public.consents,public.audit_logs,public.rate_limits from anon,authenticated;
grant usage on schema public to anon,authenticated;
grant select on public.opportunities to anon,authenticated;
grant select on public.sources to authenticated;
grant select on public.profiles,public.organizations,public.favorites,public.reports,public.consents,public.audit_logs to authenticated;
grant update(display_name,city) on public.profiles to authenticated;
grant update(status,verified_at,verification_notes) on public.organizations to authenticated;
grant insert,update,delete on public.sources to authenticated;
grant insert,update on public.opportunities to authenticated;
grant insert,delete on public.favorites to authenticated;
grant insert on public.reports to authenticated;
grant update(status,resolution) on public.reports to authenticated;
grant insert on public.consents to authenticated;
-- No security-definer helper is publicly callable unless explicitly needed.
revoke execute on function public.new_user(),public.enforce_quota(text,integer),public.review_opportunity(),public.audit_review(),public.report_quota() from public,anon,authenticated;
revoke execute on function public.register_organization(text,text),public.delete_own_account() from public,anon;
grant execute on function public.register_organization(text,text),public.delete_own_account() to authenticated;
comment on table public.audit_logs is 'Retenção operacional sugerida: 180 dias; aplicar rotina antes da produção. Sem conteúdo de perfil ou denúncia.';

-- Public presentation is filtered even for signed-in owners/admins.
create view public.public_catalog with (security_invoker=true,security_barrier=true) as
 select id,slug,title,description,kind,area,city,state,modality,education,experience,salary,min_age,max_age,age_justification,hours,requirements,free,original_url,source_name,source_url,verified_at,published_at,closing_at,last_checked_at,updated_at,moderation_status,search_document
 from public.opportunities where moderation_status='approved' and verification_status='verified' and verified_at>now()-interval '30 days' and (closing_at is null or closing_at>now()) and public.public_provenance(source_id,organization_id);
grant select on public.public_catalog to anon,authenticated;
-- Invoker rights preserve RLS and rank full-text matches before recency.
create function public.search_opportunities(search_query text) returns setof public.public_catalog language sql stable security invoker set search_path=public,pg_temp as $$ select * from public.public_catalog where search_document @@ websearch_to_tsquery('public.portuguese_unaccent',left(search_query,120)) order by ts_rank_cd(search_document,websearch_to_tsquery('public.portuguese_unaccent',left(search_query,120))) desc,published_at desc $$;
grant execute on function public.search_opportunities(text) to anon,authenticated;
