-- Fix reviews -> profiles relationship so PostgREST embed works on track page.
-- Schema uses reviews.body for content.

-- Allow embed: reviews.user_id -> profiles.id (so .select("*, profiles(...)") works)
ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
