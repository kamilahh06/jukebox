-- Allow annotations -> profiles embed so track page can show annotator names.
ALTER TABLE public.annotations
  DROP CONSTRAINT IF EXISTS annotations_user_id_fkey;

ALTER TABLE public.annotations
  ADD CONSTRAINT annotations_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
