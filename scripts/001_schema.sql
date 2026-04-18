-- Jukebox Database Schema

-- Profiles table (references auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  top_tracks uuid[] default '{}',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Tracks
create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  cover_url text,
  tags text[] default '{}',
  created_at timestamptz default now()
);

alter table public.tracks enable row level security;
create policy "tracks_select_all" on public.tracks for select using (true);
create policy "tracks_insert_auth" on public.tracks for insert with check (auth.uid() is not null);

-- Track lines
create table if not exists public.track_lines (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks(id) on delete cascade,
  line_index int not null,
  text text not null,
  unique(track_id, line_index)
);

alter table public.track_lines enable row level security;
create policy "track_lines_select_all" on public.track_lines for select using (true);
create policy "track_lines_insert_auth" on public.track_lines for insert with check (auth.uid() is not null);

-- Ratings
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  score int not null check (score >= 1 and score <= 5),
  created_at timestamptz default now(),
  unique(user_id, track_id)
);

alter table public.ratings enable row level security;
create policy "ratings_select_all" on public.ratings for select using (true);
create policy "ratings_insert_own" on public.ratings for insert with check (auth.uid() = user_id);
create policy "ratings_update_own" on public.ratings for update using (auth.uid() = user_id);
create policy "ratings_delete_own" on public.ratings for delete using (auth.uid() = user_id);

-- Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;
create policy "reviews_select_all" on public.reviews for select using (true);
create policy "reviews_insert_own" on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update_own" on public.reviews for update using (auth.uid() = user_id);
create policy "reviews_delete_own" on public.reviews for delete using (auth.uid() = user_id);

-- Annotations
create table if not exists public.annotations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  line_index int not null,
  body text not null,
  created_at timestamptz default now()
);

alter table public.annotations enable row level security;
create policy "annotations_select_all" on public.annotations for select using (true);
create policy "annotations_insert_own" on public.annotations for insert with check (auth.uid() = user_id);
create policy "annotations_update_own" on public.annotations for update using (auth.uid() = user_id);
create policy "annotations_delete_own" on public.annotations for delete using (auth.uid() = user_id);

-- Reactions (for reviews and annotations)
create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('review', 'annotation')),
  target_id uuid not null,
  emoji text not null,
  created_at timestamptz default now(),
  unique(user_id, target_type, target_id, emoji)
);

alter table public.reactions enable row level security;
create policy "reactions_select_all" on public.reactions for select using (true);
create policy "reactions_insert_own" on public.reactions for insert with check (auth.uid() = user_id);
create policy "reactions_delete_own" on public.reactions for delete using (auth.uid() = user_id);

-- Playlists
create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  tags text[] default '{}',
  created_at timestamptz default now()
);

alter table public.playlists enable row level security;
create policy "playlists_select_all" on public.playlists for select using (true);
create policy "playlists_insert_own" on public.playlists for insert with check (auth.uid() = user_id);
create policy "playlists_update_own" on public.playlists for update using (auth.uid() = user_id);
create policy "playlists_delete_own" on public.playlists for delete using (auth.uid() = user_id);

-- Playlist items
create table if not exists public.playlist_items (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  position int not null default 0,
  note text
);

alter table public.playlist_items enable row level security;
create policy "playlist_items_select_all" on public.playlist_items for select using (true);
create policy "playlist_items_insert_own" on public.playlist_items for insert
  with check (
    auth.uid() = (select user_id from public.playlists where id = playlist_id)
  );
create policy "playlist_items_update_own" on public.playlist_items for update
  using (
    auth.uid() = (select user_id from public.playlists where id = playlist_id)
  );
create policy "playlist_items_delete_own" on public.playlist_items for delete
  using (
    auth.uid() = (select user_id from public.playlists where id = playlist_id)
  );

-- Badges
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_type text not null,
  label text not null,
  awarded_at timestamptz default now(),
  unique(user_id, badge_type)
);

alter table public.badges enable row level security;
create policy "badges_select_all" on public.badges for select using (true);
create policy "badges_insert_service" on public.badges for insert with check (auth.uid() is not null);
