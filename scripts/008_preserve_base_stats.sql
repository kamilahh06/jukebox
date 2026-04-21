-- Preserve inflated stats when real users add ratings.
--
-- Problem: inflate_track_stats() writes big fake numbers directly to tracks.total_ratings
-- and tracks.average_rating. The trigger update_track_rating_stats() then recalculates
-- those columns from the ratings table alone, discarding the fake baseline.
--
-- Fix: store the synthetic offset in two new columns (base_total_ratings, base_rating_sum).
-- The trigger adds real ratings on top of that base instead of replacing it.
--
-- Run this in Supabase SQL Editor, then re-run /api/inflate to repopulate the base columns.

-- 1. Add base columns
ALTER TABLE public.tracks
  ADD COLUMN IF NOT EXISTS base_total_ratings int     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS base_rating_sum    numeric DEFAULT 0;

-- 2. Update inflate_track_stats() to also write the base offset columns
CREATE OR REPLACE FUNCTION public.inflate_track_stats()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated int;
BEGIN
  -- Step 1: Set inflated display values on every track
  UPDATE public.tracks
  SET
    average_rating = ROUND(
      CASE floor(random() * 10)::int
        WHEN 0 THEN 1.5 + random() * 1.4    -- 10%: divisive/bad   (1.5–2.9)
        WHEN 1 THEN 4.4 + random() * 0.5    -- 10%: beloved        (4.4–4.9)
        ELSE       2.9  + random() * 1.5    -- 80%: normal range   (2.9–4.4)
      END::numeric, 1
    ),
    total_ratings = floor(
      CASE floor(random() * 10)::int
        WHEN 0 THEN random() * 450    + 50       -- 10%: obscure   50–500
        WHEN 1 THEN random() * 40000  + 10000    -- 10%: popular   10k–50k
        WHEN 2 THEN random() * 450000 + 50000    -- 10%: viral     50k–500k
        ELSE       random() * 4800    + 200      -- 70%: normal    200–5k
      END
    )::int
  WHERE id IS NOT NULL;

  GET DIAGNOSTICS updated = ROW_COUNT;

  -- Step 2: Compute base = inflated - real, so trigger can add real on top.
  -- For tracks that already have real ratings in the table:
  UPDATE public.tracks t
  SET
    base_total_ratings = GREATEST(0, t.total_ratings - r.cnt),
    base_rating_sum    = GREATEST(0, (t.average_rating * t.total_ratings) - r.sum_score)
  FROM (
    SELECT track_id,
           COUNT(*)::int        AS cnt,
           SUM(score)::numeric  AS sum_score
    FROM   public.ratings
    GROUP  BY track_id
  ) r
  WHERE t.id = r.track_id;

  -- For tracks with no real ratings at all (base = entire inflated value):
  UPDATE public.tracks t
  SET
    base_total_ratings = t.total_ratings,
    base_rating_sum    = t.average_rating * t.total_ratings
  WHERE NOT EXISTS (SELECT 1 FROM public.ratings WHERE track_id = t.id);

  RETURN updated;
END;
$$;

-- 3. Update the per-row trigger to use base + real ratings
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
    total_ratings  = t.base_total_ratings + real_stats.cnt,
    average_rating = CASE
      WHEN t.base_total_ratings + real_stats.cnt = 0 THEN 0
      ELSE ROUND(
        (t.base_rating_sum + real_stats.sum_score)
        / (t.base_total_ratings + real_stats.cnt)
      , 2)
    END
  FROM (
    SELECT
      COALESCE(COUNT(*)::int,        0) AS cnt,
      COALESCE(SUM(score)::numeric,  0) AS sum_score
    FROM public.ratings
    WHERE track_id = tid
  ) real_stats
  WHERE t.id = tid;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Update the bulk backfill RPC to use the same base+real logic
CREATE OR REPLACE FUNCTION public.backfill_track_ratings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Tracks that have real ratings
  UPDATE public.tracks t
  SET
    total_ratings  = t.base_total_ratings + r.cnt,
    average_rating = CASE
      WHEN t.base_total_ratings + r.cnt = 0 THEN 0
      ELSE ROUND(
        (t.base_rating_sum + r.sum_score)
        / (t.base_total_ratings + r.cnt)
      , 2)
    END
  FROM (
    SELECT track_id,
           COUNT(*)::int        AS cnt,
           SUM(score)::numeric  AS sum_score
    FROM   public.ratings
    GROUP  BY track_id
  ) r
  WHERE t.id = r.track_id;

  -- Tracks with no real ratings: display base values
  UPDATE public.tracks t
  SET
    total_ratings  = t.base_total_ratings,
    average_rating = CASE
      WHEN t.base_total_ratings = 0 THEN 0
      ELSE ROUND(t.base_rating_sum / t.base_total_ratings, 2)
    END
  WHERE NOT EXISTS (SELECT 1 FROM public.ratings WHERE track_id = t.id);
END;
$$;

-- 5. Backfill base columns for tracks that are already inflated
--    (assumes their current total_ratings/average_rating are the inflated values)
UPDATE public.tracks t
SET
  base_total_ratings = GREATEST(0, t.total_ratings - COALESCE(r.cnt, 0)),
  base_rating_sum    = GREATEST(0, (t.average_rating * t.total_ratings) - COALESCE(r.sum_score, 0))
FROM (
  SELECT track_id,
         COUNT(*)::int        AS cnt,
         SUM(score)::numeric  AS sum_score
  FROM   public.ratings
  GROUP  BY track_id
) r
WHERE t.id = r.track_id
  AND t.base_total_ratings = 0;

UPDATE public.tracks t
SET
  base_total_ratings = t.total_ratings,
  base_rating_sum    = t.average_rating * t.total_ratings
WHERE t.base_total_ratings = 0
  AND t.total_ratings > 0
  AND NOT EXISTS (SELECT 1 FROM public.ratings WHERE track_id = t.id);
