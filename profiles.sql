
-- Run in Supabase SQL Editor
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  eco_word text,
  eco_type text,
  color text,
  bio text,
  dob date,
  constellation text default 'origen',
  updated_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "profiles are viewable by owners" on profiles for select to authenticated using ( auth.uid() = id );
create policy "users can upsert own profile" on profiles for insert to authenticated with check ( auth.uid() = id );
create policy "users can update own profile" on profiles for update to authenticated using ( auth.uid() = id );
