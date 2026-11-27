-- AKRADHI CRM initial schema
create extension if not exists "pgcrypto";

create or replace function set_updated_at() returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin new.updated_at = now(); return new; end;
$$;

-- organizations
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger organizations_updated before update on organizations for each row execute function set_updated_at();

-- profiles (auto-created on signup via trigger)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated before update on profiles for each row execute function set_updated_at();

create or replace function handle_new_user() returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke execute on function handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- organization_members
create table if not exists organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('owner','administrator','sales_rep','viewer')),
  status text not null default 'active' check (status in ('active','invited','disabled')),
  unique (organization_id, user_id)
);

-- role escalation prevention
create or replace function prevent_role_escalation() returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_role text;
begin
  select role into actor_role
  from organization_members
  where organization_id = new.organization_id and user_id = auth.uid() and status = 'active';

  if new.role = 'owner' and actor_role is distinct from 'owner' then
    raise exception 'Only owners can assign the owner role';
  end if;
  if actor_role = 'administrator' and new.role in ('owner','administrator') then
    raise exception 'Administrators cannot assign owner or administrator roles';
  end if;
  if actor_role = 'sales_rep' and new.role in ('owner','administrator','sales_rep') then
    raise exception 'Sales representatives cannot assign elevated roles';
  end if;
  if actor_role = 'viewer' then
    raise exception 'Viewers cannot manage memberships';
  end if;
  -- prevent self role change except by owner
  if TG_OP = 'UPDATE' and old.user_id = auth.uid() and old.role is distinct from new.role and actor_role is distinct from 'owner' then
    raise exception 'Users cannot change their own role';
  end if;
  return new;
end;
$$;
revoke execute on function prevent_role_escalation() from public;

create trigger org_members_role_check before insert or update on organization_members
  for each row execute function prevent_role_escalation();

-- org consistency: assigned_to must be active member of same org
create or replace function check_assigned_member() returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.assigned_to is not null then
    if not exists (
      select 1 from organization_members
      where organization_id = new.organization_id and user_id = new.assigned_to and status = 'active'
    ) then
      raise exception 'assigned_to must be an active member of the organization';
    end if;
  end if;
  return new;
end;
$$;

-- transactional organization onboarding
create or replace function create_organization(org_name text, org_timezone text default 'Asia/Kolkata')
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  new_org_id uuid;
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  insert into organizations (name, timezone) values (org_name, org_timezone) returning id into new_org_id;
  insert into organization_members (organization_id, user_id, role, status)
  values (new_org_id, uid, 'owner', 'active');
  return new_org_id;
end;
$$;
revoke execute on function create_organization(text, text) from public;
grant execute on function create_organization(text, text) to authenticated;

-- helper
create or replace function user_org_ids() returns setof uuid
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select organization_id from organization_members where user_id = auth.uid() and status = 'active';
$$;
revoke execute on function user_org_ids() from public;
grant execute on function user_org_ids() to authenticated;

-- businesses
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  business_name text not null,
  contact_person text,
  phone_number text,
  normalized_phone_number text,
  email text,
  business_category text,
  city text,
  state text,
  country text,
  website_url text,
  source text,
  notes text,
  pipeline_status text not null default 'new_lead' check (pipeline_status in ('new_lead','consent_pending','eligible','message_prepared','awaiting_approval','contacted','replied','interested','follow_up_required','meeting_scheduled','proposal_sent','negotiation','converted','not_interested','opted_out','archived')),
  lead_score integer not null default 0,
  assigned_to uuid references profiles(id),
  last_contacted_at timestamptz,
  last_replied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists businesses_org_phone_unique on businesses (organization_id, normalized_phone_number) where normalized_phone_number is not null;
create index if not exists businesses_org_idx on businesses (organization_id);
create index if not exists businesses_pipeline_idx on businesses (organization_id, pipeline_status);
create trigger businesses_updated before update on businesses for each row execute function set_updated_at();
create trigger businesses_assigned_check before insert or update on businesses for each row execute function check_assigned_member();

-- consent_records
create table if not exists consent_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  communication_channel text not null default 'whatsapp',
  consent_status text not null check (consent_status in ('granted','pending','denied','revoked')),
  consent_source text,
  consent_scope text,
  consent_timestamp timestamptz,
  evidence_reference text,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, business_id, communication_channel)
);
create index if not exists consent_org_idx on consent_records (organization_id);

-- business_analyses
create table if not exists business_analyses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  analysis_status text not null default 'pending',
  website_status text,
  findings jsonb not null default '[]',
  evidence jsonb not null default '{}',
  suggested_services jsonb not null default '[]',
  confidence numeric not null default 0,
  analyzed_at timestamptz,
  unique (organization_id, business_id)
);

-- daily_leads
create table if not exists daily_leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  selection_date date not null,
  selection_reason text,
  status text not null default 'queued',
  created_at timestamptz not null default now(),
  unique (organization_id, business_id, selection_date)
);

-- conversations
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  provider text not null default 'simulation',
  external_conversation_id text,
  conversation_status text not null default 'open',
  ai_enabled boolean not null default true,
  assigned_to uuid references profiles(id),
  last_message_at timestamptz,
  last_customer_message_at timestamptz,
  created_at timestamptz not null default now()
);

-- messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  conversation_id uuid not null references conversations(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  direction text not null check (direction in ('inbound','outbound')),
  sender_type text not null,
  message_type text not null default 'text',
  content text not null,
  provider_message_id text,
  delivery_status text not null default 'pending',
  ai_generated boolean not null default false,
  approved_by uuid references profiles(id),
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists messages_conv_idx on messages (conversation_id, created_at);

-- message_queue
create table if not exists message_queue (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  conversation_id uuid references conversations(id),
  message_type text not null,
  generated_content text not null,
  edited_content text,
  approval_status text not null default 'pending',
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  rejection_reason text,
  scheduled_at timestamptz,
  created_at timestamptz not null default now()
);

-- follow_ups
create table if not exists follow_ups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  conversation_id uuid references conversations(id),
  due_at timestamptz not null,
  reason text not null,
  suggested_message text,
  status text not null default 'pending',
  assigned_to uuid references profiles(id),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- knowledge_base
create table if not exists knowledge_base (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  category text not null,
  title text not null,
  content text not null,
  structured_data jsonb,
  is_active boolean not null default true,
  version integer not null default 1,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger knowledge_base_updated before update on knowledge_base for each row execute function set_updated_at();

-- sales_pipeline
create table if not exists sales_pipeline (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  current_stage text not null default 'new_lead',
  estimated_value numeric,
  actual_value numeric,
  assigned_to uuid references profiles(id),
  expected_close_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, business_id)
);
create trigger sales_pipeline_updated before update on sales_pipeline for each row execute function set_updated_at();

-- pipeline_history
create table if not exists pipeline_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  previous_stage text,
  new_stage text not null,
  changed_by uuid references profiles(id),
  changed_at timestamptz not null default now()
);

-- meetings
create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  meeting_date timestamptz not null,
  meeting_type text not null default 'consultation',
  meeting_link text,
  status text not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now()
);

-- activity_logs
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists activity_org_idx on activity_logs (organization_id, created_at desc);

-- webhook_events
create table if not exists webhook_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  provider text not null,
  external_event_id text not null,
  event_type text not null,
  processing_status text not null default 'received',
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, external_event_id)
);

-- ai_usage_logs
create table if not exists ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  operation text not null,
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  estimated_cost numeric not null default 0,
  status text not null default 'success',
  created_at timestamptz not null default now()
);

-- settings
create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  setting_key text not null,
  setting_value jsonb,
  updated_at timestamptz not null default now(),
  unique (organization_id, setting_key)
);
create trigger settings_updated before update on settings for each row execute function set_updated_at();

-- RLS
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table organization_members enable row level security;
alter table businesses enable row level security;
alter table consent_records enable row level security;
alter table business_analyses enable row level security;
alter table daily_leads enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table message_queue enable row level security;
alter table follow_ups enable row level security;
alter table knowledge_base enable row level security;
alter table sales_pipeline enable row level security;
alter table pipeline_history enable row level security;
alter table meetings enable row level security;
alter table activity_logs enable row level security;
alter table webhook_events enable row level security;
alter table ai_usage_logs enable row level security;
alter table settings enable row level security;

-- Helper
create or replace function user_org_ids() returns setof uuid
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select organization_id from organization_members where user_id = auth.uid() and status = 'active';
$$;
revoke execute on function user_org_ids() from public;
grant execute on function user_org_ids() to authenticated;

-- Role check helper
create or replace function user_role(org_id uuid) returns text
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select role from organization_members where organization_id = org_id and user_id = auth.uid() and status = 'active' limit 1;
$$;
revoke execute on function user_role(uuid) from public;
grant execute on function user_role(uuid) to authenticated;

-- Policies: organizations
create policy organizations_select on organizations for select using (id in (select user_org_ids()));
create policy organizations_insert on organizations for insert with check (auth.uid() is not null);
create policy organizations_update on organizations for update using (id in (select user_org_ids()) and user_role(id) in ('owner','administrator')) with check (id in (select user_org_ids()));
create policy organizations_delete on organizations for delete using (id in (select user_org_ids()) and user_role(id) = 'owner');

-- profiles
create policy profiles_select on profiles for select using (id = auth.uid() or id in (select user_id from organization_members where organization_id in (select user_org_ids())));
create policy profiles_insert on profiles for insert with check (id = auth.uid());
create policy profiles_update on profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_delete on profiles for delete using (id = auth.uid());

-- organization_members
create policy org_members_select on organization_members for select using (user_id = auth.uid() or organization_id in (select user_org_ids()));
create policy org_members_insert on organization_members for insert with check (
  auth.uid() is not null
  and (user_role(organization_id) in ('owner','administrator') or not exists (select 1 from organization_members where organization_id = organization_members.organization_id))
);
create policy org_members_update on organization_members for update using (
  organization_id in (select user_org_ids()) and user_role(organization_id) in ('owner','administrator')
) with check (
  organization_id in (select user_org_ids()) and user_role(organization_id) in ('owner','administrator')
);
create policy org_members_delete on organization_members for delete using (
  organization_id in (select user_org_ids()) and user_role(organization_id) in ('owner','administrator')
);

-- Generic data tables: SELECT for all members, INSERT/UPDATE for owner/admin/sales_rep, DELETE for owner/admin
do $$
declare t text;
begin
  for t in select unnest(array['businesses','consent_records','business_analyses','daily_leads','conversations','messages','message_queue','follow_ups','knowledge_base','sales_pipeline','pipeline_history','meetings','activity_logs','settings']) loop
    execute format('create policy %I_select on %I for select using (organization_id in (select user_org_ids()))', t, t);
    execute format('create policy %I_insert on %I for insert with check (organization_id in (select user_org_ids()) and user_role(organization_id) in (''owner'',''administrator'',''sales_rep''))', t, t);
    execute format('create policy %I_update on %I for update using (organization_id in (select user_org_ids()) and user_role(organization_id) in (''owner'',''administrator'',''sales_rep'')) with check (organization_id in (select user_org_ids()))', t, t);
    execute format('create policy %I_delete on %I for delete using (organization_id in (select user_org_ids()) and user_role(organization_id) in (''owner'',''administrator''))', t, t);
  end loop;
end $$;

-- webhook_events: service role handles writes; authenticated read only for their org (or null stays service-role only)
create policy webhook_events_select on webhook_events for select using (organization_id is null and false or organization_id in (select user_org_ids()));
-- (no insert/update/delete policies for authenticated => only service role)

-- ai_usage_logs: read for org members; insert for sales_rep+; no update/delete
create policy ai_usage_select on ai_usage_logs for select using (organization_id is null and false or organization_id in (select user_org_ids()));
create policy ai_usage_insert on ai_usage_logs for insert with check (organization_id in (select user_org_ids()) and user_role(organization_id) in ('owner','administrator','sales_rep'));
