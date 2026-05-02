create table if not exists user_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  platform text not null default 'unknown' check (platform in ('ios', 'android', 'web', 'unknown')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (user_id, token)
);

alter table user_push_tokens enable row level security;

create policy "owner_select_own_push_tokens" on user_push_tokens
  for select using (auth.uid() = user_id);

create policy "owner_insert_own_push_tokens" on user_push_tokens
  for insert with check (auth.uid() = user_id);

create policy "owner_update_own_push_tokens" on user_push_tokens
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "owner_delete_own_push_tokens" on user_push_tokens
  for delete using (auth.uid() = user_id);

create or replace function set_user_push_tokens_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  new.last_seen_at = now();
  return new;
end;
$$;

drop trigger if exists user_push_tokens_set_updated_at on user_push_tokens;
create trigger user_push_tokens_set_updated_at
before update on user_push_tokens
for each row execute function set_user_push_tokens_updated_at();

create index if not exists user_push_tokens_user_id_idx on user_push_tokens (user_id);
create index if not exists user_push_tokens_token_idx on user_push_tokens (token);
