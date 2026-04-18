-- Add listen links and optional metadata for tracks.
-- Store YouTube and Spotify URLs for embeds; backfill via API/script.

ALTER TABLE public.tracks
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS spotify_url text;

COMMENT ON COLUMN public.tracks.youtube_url IS 'Full YouTube URL (e.g. watch or youtu.be) for embed and open link';
COMMENT ON COLUMN public.tracks.spotify_url IS 'Full Spotify track URL for embed and open link';
