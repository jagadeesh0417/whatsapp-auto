-- AKRADHI CRM initial schema
create extension if not exists "pgcrypto";

create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

-- organizations
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger organizations_updated before update on organizations for each row execute function set_updated_at();

-- profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated before update on profiles for each row execute function set_updated_at();

-- organization_members
create table if not exists organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('owner','administrator','sales_rep','viewer')),
  status text not null default 'active' check (status in ('active','invited','disabled')),
  unique (organization_id, user_id)
);

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
  pipeline_status text not null default 'new_lead',
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
  created_at timestamptz not null default now()
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
  organization_id uuid references organizations(id),
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
  organization_id uuid references organizations(id),
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

-- Helper: current user's organization ids
create or replace function user_org_ids() returns setof uuid as $$
  select organization_id from organization_members where user_id = auth.uid() and status = 'active';
$$ language sql security definer stable;

-- Policies (organization isolation)
do $$ declare t text; begin
  for t in select unnest(array['businesses','consent_records','business_analyses','daily_leads','conversations','messages','message_queue','follow_ups','knowledge_base','sales_pipeline','pipeline_history','meetings','activity_logs','settings']) loop
    execute format('create policy %I_org on %I for all using (organization_id in (select user_org_ids())) with check (organization_id in (select user_org_ids()))', t, t);
  end loop;
end $$;

create policy organizations_member on organizations for select using (id in (select user_org_ids()));
create policy profiles_self on profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy org_members_self on organization_members for select using (user_id = auth.uid() or organization_id in (select user_org_ids()));
create policy webhook_events_org on webhook_events for all using (organization_id is null or organization_id in (select user_org_ids()));
create policy ai_usage_org on ai_usage_logs for all using (organization_id is null or organization_id in (select user_org_ids()));
