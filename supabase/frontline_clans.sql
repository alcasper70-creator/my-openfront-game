-- Run once in Supabase: SQL Editor -> New query -> Run.
create table if not exists public.frontline_clans (
  id uuid primary key default gen_random_uuid(),
  tag text not null unique check (tag ~ '^[A-Z0-9]{2,6}$'),
  name text not null unique check (char_length(name) between 3 and 32),
  owner_uid text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.frontline_clan_members (
  clan_id uuid not null references public.frontline_clans(id) on delete cascade,
  firebase_uid text not null,
  username text not null,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (clan_id, firebase_uid)
);
create unique index if not exists frontline_one_clan_per_commander on public.frontline_clan_members(firebase_uid);
alter table public.frontline_clans enable row level security;
alter table public.frontline_clan_members enable row level security;
-- Browser access is blocked. The Render server uses SUPABASE_SERVICE_ROLE_KEY.
