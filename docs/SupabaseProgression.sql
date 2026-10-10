-- Frontline Frenzy progression database. Run once in Supabase > SQL Editor.
-- Players cannot access this table directly: the game server verifies a
-- Firebase Google ID token and uses its private Render-only service key.

create table if not exists public.player_profiles (
  firebase_uid text primary key,
  username text not null default 'Commander' check (char_length(username) between 1 and 32),
  credits integer not null default 0 check (credits >= 0),
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.player_profiles enable row level security;
-- There are deliberately no browser policies. The game server is the only
-- writer so players cannot forge cash, XP, purchases, or inventory entries.
