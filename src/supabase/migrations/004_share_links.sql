-- Migration: Share Links for Chat Maestro Export/Share functionality
-- Create share_links table for managing shared conversation links

create table if not exists share_links (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references threads(id) on delete cascade,
  owner uuid references auth.users(id),
  mode text check (mode in ('readonly','comments')) default 'readonly',
  scope text check (scope in ('thread','branch','selection')) default 'thread',
  branch text,
  selection jsonb,
  token text not null unique,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table share_links enable row level security;

-- Policy: Users can only manage their own share links
create policy p_share_owner on share_links 
  using (owner = auth.uid()) 
  with check (owner = auth.uid());

-- Policy: Anyone can read share links by token (for public access)
create policy p_share_public_read on share_links 
  for select 
  using (true);

-- Create index for efficient token lookups
create index idx_share_links_token on share_links(token);
create index idx_share_links_expires on share_links(expires_at);
create index idx_share_links_owner on share_links(owner);

-- Function to automatically update updated_at timestamp
create or replace function update_share_links_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger tr_share_links_updated_at
  before update on share_links
  for each row
  execute function update_share_links_updated_at();

-- Function to clean up expired share links
create or replace function cleanup_expired_share_links()
returns void as $$
begin
  delete from share_links 
  where expires_at is not null 
    and expires_at < now();
end;
$$ language plpgsql;

-- Create a scheduled job to run cleanup (requires pg_cron extension)
-- This would typically be configured outside of the migration
-- select cron.schedule('cleanup-expired-shares', '0 * * * *', 'select cleanup_expired_share_links();');