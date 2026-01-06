create extension if not exists "uuid-ossp";

create table public.users (
  id uuid primary key default uuid_generate_v4(),
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
  model text not null default 'mistralai/Mistral-7B-Instruct-v0.2',
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

alter table public.users enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_participants enable row level security;
alter table public.messages enable row level security;
alter table public.ai_chats enable row level security;
alter table public.shared_files enable row level security;

create policy "Users can read all users" on public.users for select using (true);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

create policy "Users can read rooms they participate in" on public.chat_rooms for select using (
  exists (
    select 1 from public.chat_participants
    where chat_participants.room_id = chat_rooms.id
    and chat_participants.user_id = auth.uid()
  )
);

create policy "Users can create rooms" on public.chat_rooms for insert with check (true);

create policy "Users can read participants of their rooms" on public.chat_participants for select using (
  exists (
    select 1 from public.chat_participants cp
    where cp.room_id = chat_participants.room_id
    and cp.user_id = auth.uid()
  )
);

create policy "Users can insert participants" on public.chat_participants for insert with check (true);
create policy "Users can update own participation" on public.chat_participants for update using (user_id = auth.uid());

create policy "Users can read messages in their rooms" on public.messages for select using (
  exists (
    select 1 from public.chat_participants
    where chat_participants.room_id = messages.room_id
    and chat_participants.user_id = auth.uid()
  )
);

create policy "Users can insert messages" on public.messages for insert with check (sender_id = auth.uid());
create policy "Users can update own messages" on public.messages for update using (sender_id = auth.uid());

create policy "Users can read own AI chats" on public.ai_chats for select using (user_id = auth.uid());
create policy "Users can insert own AI chats" on public.ai_chats for insert with check (user_id = auth.uid());
create policy "Users can update own AI chats" on public.ai_chats for update using (user_id = auth.uid());

create policy "Users can read files in their rooms" on public.shared_files for select using (
  exists (
    select 1 from public.chat_participants
    where chat_participants.room_id = shared_files.room_id
    and chat_participants.user_id = auth.uid()
  )
);

create policy "Users can insert files" on public.shared_files for insert with check (user_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, avatar, provider)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'provider', 'email')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_users_updated_at before update on public.users
  for each row execute procedure public.update_updated_at_column();

create trigger update_chat_rooms_updated_at before update on public.chat_rooms
  for each row execute procedure public.update_updated_at_column();

create trigger update_messages_updated_at before update on public.messages
  for each row execute procedure public.update_updated_at_column();

