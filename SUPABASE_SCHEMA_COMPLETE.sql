-- Complete Supabase Schema with Auto User Creation

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- STEP 1: Create Tables

create table public.users (
  id uuid primary key,
  email text unique not null,
  name text not null,
  avatar text,
  provider text not null default 'email',
  online_status boolean default false,
  last_seen timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table public.chat_rooms (
  id uuid primary key default uuid_generate_v4(),
  type text not null default 'direct',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  last_message_at timestamp with time zone default now()
);

create table public.chat_participants (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid references public.chat_rooms(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  joined_at timestamp with time zone default now(),
  last_read_at timestamp with time zone default now(),
  is_archived boolean default false,
  is_muted boolean default false,
  unique(room_id, user_id)
);

create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  content text not null,
  sender_id uuid references public.users(id) on delete cascade,
  receiver_id uuid references public.users(id) on delete cascade,
  room_id uuid references public.chat_rooms(id) on delete cascade,
  is_read boolean default false,
  is_ai boolean default false,
  metadata jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table public.ai_chats (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  messages jsonb not null default '[]',
  model text not null default 'mistralai/Mistral-7B-Instruct-v0.1',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table public.shared_files (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid references public.chat_rooms(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text not null,
  file_size bigint not null,
  created_at timestamp with time zone default now()
);

-- STEP 2: Create Indexes

create index idx_users_email on public.users(email);
create index idx_users_online_status on public.users(online_status);
create index idx_messages_sender_id on public.messages(sender_id);
create index idx_messages_receiver_id on public.messages(receiver_id);
create index idx_messages_room_id on public.messages(room_id);
create index idx_messages_created_at on public.messages(created_at desc);
create index idx_messages_room_created on public.messages(room_id, created_at desc);
create index idx_chat_participants_room_id on public.chat_participants(room_id);
create index idx_chat_participants_user_id on public.chat_participants(user_id);
create index idx_chat_rooms_last_message_at on public.chat_rooms(last_message_at desc);
create index idx_shared_files_room_id on public.shared_files(room_id);

-- STEP 3: Enable Row Level Security (but disable for testing)

alter table public.users enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_participants enable row level security;
alter table public.messages enable row level security;
alter table public.ai_chats enable row level security;
alter table public.shared_files enable row level security;

-- STEP 4: Create Permissive Policies (FOR TESTING - allows all operations)

-- Users table policies
create policy "Allow all operations on users" on public.users for all using (true) with check (true);

-- Chat rooms policies
create policy "Allow all operations on chat_rooms" on public.chat_rooms for all using (true) with check (true);

-- Chat participants policies
create policy "Allow all operations on chat_participants" on public.chat_participants for all using (true) with check (true);

-- Messages policies
create policy "Allow all operations on messages" on public.messages for all using (true) with check (true);

-- AI chats policies  
create policy "Allow all operations on ai_chats" on public.ai_chats for all using (true) with check (true);

-- Shared files policies
create policy "Allow all operations on shared_files" on public.shared_files for all using (true) with check (true);

-- STEP 5: Create Function to Handle New User Registration

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, name, avatar, provider, online_status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    coalesce(new.raw_user_meta_data->>'provider', 'email'),
    true
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(excluded.name, public.users.name),
    avatar = coalesce(excluded.avatar, public.users.avatar),
    online_status = true,
    updated_at = now();
  return new;
end;
$$;

-- STEP 6: Create Trigger on Auth User Creation

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function public.handle_new_user();

-- STEP 7: Create function to update last_seen timestamp

create or replace function public.update_user_last_seen(user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.users
  set last_seen = now(), online_status = true, updated_at = now()
  where id = user_id;
end;
$$;

-- STEP 8: Create function to set user offline

create or replace function public.set_user_offline(user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.users
  set online_status = false, updated_at = now()
  where id = user_id;
end;
$$;

-- STEP 9: Insert existing auth users into public.users table (if any)

insert into public.users (id, email, name, avatar, provider, online_status)
select 
  au.id,
  au.email,
  coalesce(au.raw_user_meta_data->>'name', au.email),
  coalesce(au.raw_user_meta_data->>'avatar_url', au.raw_user_meta_data->>'picture'),
  coalesce(au.raw_user_meta_data->>'provider', 'email'),
  true
from auth.users au
where not exists (select 1 from public.users pu where pu.id = au.id)
on conflict (id) do nothing;

-- DONE! Your database is now ready.

