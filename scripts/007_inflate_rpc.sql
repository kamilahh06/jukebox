-- Run this in Supabase SQL Editor, then call /api/inflate?secret=jukebox_seed

CREATE OR REPLACE FUNCTION public.inflate_track_stats()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated int;
BEGIN
  UPDATE public.tracks
  SET
    -- Ratings clustered realistically: most 3.0–4.5, some beloved, some divisive
    average_rating = ROUND(
      CASE floor(random() * 10)::int
        WHEN 0 THEN 1.5 + random() * 1.4   -- 10%: divisive/bad  (1.5–2.9)
        WHEN 1 THEN 4.4 + random() * 0.5   -- 10%: beloved       (4.4–4.9)
        ELSE       2.9 + random() * 1.5     -- 80%: normal range  (2.9–4.4)
      END::numeric, 1
    ),
    -- Rating counts: mix of obscure, normal, popular, and a few viral
    total_ratings = floor(
      CASE floor(random() * 10)::int
        WHEN 0 THEN random() * 450   + 50      -- 10%: obscure     50–500
        WHEN 1 THEN random() * 40000 + 10000   -- 10%: popular     10k–50k
        WHEN 2 THEN random() * 450000 + 50000  -- 10%: viral       50k–500k
        ELSE       random() * 4800   + 200     -- 70%: normal      200–5k
      END
    )::int
  WHERE id IS NOT NULL;

  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated;
END;
$$;
