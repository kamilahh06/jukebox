-- Playlist comments
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.playlist_comments (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid        NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body        text        NOT NULL,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.playlist_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "playlist_comments_select_all" ON public.playlist_comments
  FOR SELECT USING (true);

CREATE POLICY "playlist_comments_insert_own" ON public.playlist_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "playlist_comments_delete_own" ON public.playlist_comments
  FOR DELETE USING (auth.uid() = user_id);
