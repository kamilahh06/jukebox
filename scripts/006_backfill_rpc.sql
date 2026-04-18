-- Helper RPC so the seed route can force-recalculate all track rating stats in one SQL call.
-- Run this in your Supabase SQL editor after running 005_track_rating_stats.sql.

CREATE OR REPLACE FUNCTION public.backfill_track_ratings()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.tracks t
  SET
    average_rating = COALESCE((
      SELECT ROUND(AVG(r.score)::numeric, 2)
      FROM public.ratings r
      WHERE r.track_id = t.id
    ), 0),
    total_ratings = COALESCE((
      SELECT COUNT(*)::int
      FROM public.ratings r
      WHERE r.track_id = t.id
    ), 0)
  WHERE t.id IS NOT NULL;
$$;
