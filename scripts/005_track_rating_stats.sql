-- Track rating stats: average_rating and total_ratings on tracks, kept in sync by trigger.
-- Run this migration as a user with permission to alter tables and create triggers (e.g. postgres).
-- The trigger runs on public.ratings (columns: track_id, score). SECURITY DEFINER allows the
-- function to update public.tracks even when RLS is on; the function runs with the definer's privileges.

-- 1. Add columns to tracks if missing
ALTER TABLE public.tracks
  ADD COLUMN IF NOT EXISTS average_rating numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_ratings int DEFAULT 0;

-- 2. Function: recalc rating stats for one track (uses ratings.track_id, ratings.score)
CREATE OR REPLACE FUNCTION public.update_track_rating_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tid uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    tid := OLD.track_id;
  ELSE
    tid := NEW.track_id;
  END IF;
  UPDATE public.tracks t
  SET
    average_rating = COALESCE((
      SELECT round(AVG(r.score)::numeric, 2)
      FROM public.ratings r
      WHERE r.track_id = t.id
    ), 0),
    total_ratings = COALESCE((
      SELECT count(*)::int
      FROM public.ratings r
      WHERE r.track_id = t.id
    ), 0)
  WHERE t.id = tid;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Trigger on ratings table (correct table and columns: track_id, score)
DROP TRIGGER IF EXISTS on_rating_change_track_stats ON public.ratings;
CREATE TRIGGER on_rating_change_track_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_track_rating_stats();

-- 4. Backfill existing tracks
UPDATE public.tracks t
SET
  average_rating = COALESCE((
    SELECT round(AVG(r.score)::numeric, 2)
    FROM public.ratings r
    WHERE r.track_id = t.id
  ), 0),
  total_ratings = COALESCE((
    SELECT count(*)::int
    FROM public.ratings r
    WHERE r.track_id = t.id
  ), 0);
