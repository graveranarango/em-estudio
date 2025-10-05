-- Chat Service Database Schema
-- Production-ready schema with RLS for secure multi-tenant access

-- threads table: chat conversations
create table if not exists threads (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  title text,
  system text,
  objective text,
  active_branch text default 'main',
  settings jsonb default '{}',
  meta jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- messages table: individual chat messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references threads(id) on delete cascade,
  role text not null check (role in ('system','user','assistant')),
  parts jsonb not null default '[]',
  meta jsonb default '{}',
  tokens integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- attachments table: files and media attached to threads
create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references threads(id) on delete cascade,
  message_id uuid references messages(id) on delete set null,
  url text not null,
  filename text,
  kind text not null check (kind in ('pdf','image','audio','link')),
  mime_type text,
  size_bytes bigint,
  meta jsonb default '{}',
  created_at timestamptz default now()
);

-- events table: observability and audit trail
create table if not exists events (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  thread_id uuid references threads(id) on delete set null,
  message_id uuid references messages(id) on delete set null,
  stage text not null,
  tool text,
  latency_ms integer,
  tokens integer default 0,
  code text,
  info jsonb default '{}',
  ts timestamptz default now()
);

-- quotas table: user usage tracking
create table if not exists quotas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  tokens_used integer default 0,
  requests_count integer default 0,
  attachments_mb numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, period_start)
);

-- share_links table: shared conversation links
create table if not exists share_links (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references threads(id) on delete cascade,
  owner uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('read','write')) default 'read',
  scope text not null check (scope in ('public','internal','private')) default 'private',
  token text not null unique,
  expires_at timestamptz,
  access_count integer default 0,
  last_accessed_at timestamptz,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_threads_owner on threads(owner);
create index if not exists idx_threads_updated_at on threads(updated_at desc);
create index if not exists idx_messages_thread_id on messages(thread_id);
create index if not exists idx_messages_created_at on messages(created_at);
create index if not exists idx_attachments_thread_id on attachments(thread_id);
create index if not exists idx_events_user_id_ts on events(user_id, ts desc);
create index if not exists idx_events_thread_id on events(thread_id);
create index if not exists idx_quotas_user_period on quotas(user_id, period_start);
create index if not exists idx_share_links_token on share_links(token);
create index if not exists idx_share_links_thread_id on share_links(thread_id);

-- Enable Row Level Security
alter table threads enable row level security;
alter table messages enable row level security;
alter table attachments enable row level security;
alter table events enable row level security;
alter table quotas enable row level security;
alter table share_links enable row level security;

-- RLS Policies for threads
create policy "Users can only access their own threads"
  on threads for all
  using (owner = auth.uid())
  with check (owner = auth.uid());

-- RLS Policies for messages
create policy "Users can access messages from their threads"
  on messages for all
  using (
    thread_id in (
      select id from threads where owner = auth.uid()
    )
  )
  with check (
    thread_id in (
      select id from threads where owner = auth.uid()
    )
  );

-- RLS Policies for attachments
create policy "Users can access attachments from their threads"
  on attachments for all
  using (
    thread_id in (
      select id from threads where owner = auth.uid()
    )
  )
  with check (
    thread_id in (
      select id from threads where owner = auth.uid()
    )
  );

-- RLS Policies for events
create policy "Users can access their own events"
  on events for select
  using (user_id = auth.uid());

create policy "System can insert events"
  on events for insert
  with check (true); -- Events are inserted by the system

-- RLS Policies for quotas
create policy "Users can access their own quotas"
  on quotas for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- RLS Policies for share_links
create policy "Users can manage their own share links"
  on share_links for all
  using (owner = auth.uid())
  with check (owner = auth.uid());

-- Public access policy for shared links (when token is valid)
create policy "Public can read via valid share token"
  on threads for select
  using (
    id in (
      select thread_id from share_links 
      where token = current_setting('app.share_token', true)
      and (expires_at is null or expires_at > now())
      and scope in ('public', 'internal')
    )
  );

-- Functions for automation
create or replace function update_thread_timestamp()
returns trigger as $$
begin
  update threads set updated_at = now() where id = new.thread_id;
  return new;
end;
$$ language plpgsql;

-- Trigger to update thread timestamp when messages are added
create trigger update_thread_on_message_insert
  after insert on messages
  for each row execute function update_thread_timestamp();

-- Function to clean up expired share links
create or replace function cleanup_expired_share_links()
returns void as $$
begin
  delete from share_links 
  where expires_at is not null 
  and expires_at < now() - interval '1 day';
end;
$$ language plpgsql;

-- Function to get or create daily quota
create or replace function get_or_create_quota(p_user_id uuid, p_date date default current_date)
returns quotas as $$
declare
  quota_record quotas;
  period_start timestamptz;
  period_end timestamptz;
begin
  period_start := p_date::timestamptz;
  period_end := (p_date + interval '1 day')::timestamptz;
  
  select * into quota_record
  from quotas
  where user_id = p_user_id
  and period_start = period_start::timestamptz;
  
  if not found then
    insert into quotas (user_id, period_start, period_end)
    values (p_user_id, period_start, period_end)
    returning * into quota_record;
  end if;
  
  return quota_record;
end;
$$ language plpgsql;

-- Function to check and update quotas
create or replace function check_and_update_quota(
  p_user_id uuid,
  p_tokens integer default 0,
  p_requests integer default 1,
  p_attachments_mb numeric default 0
)
returns boolean as $$
declare
  quota_record quotas;
  max_tokens integer := 200000; -- 200k tokens per day
  max_requests integer := 1000; -- 1k requests per day
  max_attachments_mb numeric := 500; -- 500MB per day
begin
  quota_record := get_or_create_quota(p_user_id);
  
  -- Check limits
  if (quota_record.tokens_used + p_tokens) > max_tokens then
    return false;
  end if;
  
  if (quota_record.requests_count + p_requests) > max_requests then
    return false;
  end if;
  
  if (quota_record.attachments_mb + p_attachments_mb) > max_attachments_mb then
    return false;
  end if;
  
  -- Update quota
  update quotas
  set 
    tokens_used = tokens_used + p_tokens,
    requests_count = requests_count + p_requests,
    attachments_mb = attachments_mb + p_attachments_mb,
    updated_at = now()
  where id = quota_record.id;
  
  return true;
end;
$$ language plpgsql;

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on threads, messages, attachments, quotas, share_links to authenticated;
grant insert on events to authenticated;
grant usage on all sequences in schema public to authenticated;

-- Comments for documentation
comment on table threads is 'Chat conversation threads with RLS for multi-tenant access';
comment on table messages is 'Individual messages within chat threads';
comment on table attachments is 'Files and media attachments linked to threads/messages';
comment on table events is 'Audit trail and observability events';
comment on table quotas is 'User usage quotas and limits tracking';
comment on table share_links is 'Shareable links for chat conversations';

comment on function get_or_create_quota(uuid, date) is 'Get existing or create new daily quota record for user';
comment on function check_and_update_quota(uuid, integer, integer, numeric) is 'Check and update user quotas, returns false if limits exceeded';
comment on function cleanup_expired_share_links() is 'Cleanup expired share links (should be run periodically)';

-- Create storage bucket for attachments (if not exists)
do $$
begin
  -- This will be handled by the Supabase console or separate storage setup
  -- insert into storage.buckets (id, name, public) values ('chat-uploads', 'chat-uploads', false);
exception when others then
  -- Bucket might already exist
  null;
end;
$$;