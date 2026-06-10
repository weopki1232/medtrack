-- MedTrack sync schema — paste into Supabase Dashboard → SQL Editor → Run.
-- One row per (user, localStorage key). RLS limits every user to their own rows.

create table if not exists public.user_state (
  user_id    uuid not null references auth.users(id) on delete cascade,
  key        text not null,
  value      jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.user_state enable row level security;

create policy "users manage own state"
  on public.user_state
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
