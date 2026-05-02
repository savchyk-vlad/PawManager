-- Profiles / membership
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  membership_tier text not null default 'free' check (membership_tier in ('free', 'pro')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "owner_select_own_profile" on profiles
  for select using (auth.uid() = id);

create policy "owner_update_own_profile" on profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "owner_insert_own_profile" on profiles
  for insert with check (auth.uid() = id);

create or replace function set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
before update on profiles
for each row execute function set_profiles_updated_at();

create or replace function create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function create_profile_for_new_user();

insert into profiles (id)
select id
from auth.users
on conflict (id) do nothing;

create index if not exists profiles_membership_tier_idx on profiles (membership_tier);
