"use client";

import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TrackHeaderProps {
  track: {
    id: string;
    title: string;
    artist: string;
    album?: string | null;
    cover_url?: string | null;
    album_art_url?: string | null;
    genre?: string | null;
    release_year?: number | null;
    duration_seconds?: number | null;
    average_rating?: number | null;
    total_ratings?: number | null;
    youtube_url?: string | null;
    spotify_url?: string | null;
  };
  userRating: number | null;
  userId: string | null;
}

export function TrackHeader({ track, userRating, userId }: TrackHeaderProps) {
  const [rating, setRating] = useState(userRating);
  const [hoveredStar, setHoveredStar] = useState(0);
  const router = useRouter();

  const handleRate = async (score: number) => {
    if (!userId) {
      toast.error("Please sign in to rate tracks");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.from("ratings").upsert(
      { track_id: track.id, user_id: userId, score },
      { onConflict: "track_id,user_id" }
    );
    if (error) {
      toast.error("Failed to save rating");
      return;
    }
    setRating(score);
    toast.success(`Rated ${score}/5`);
    // Refresh so server re-fetches track; DB trigger updates average_rating and total_ratings
    router.refresh();
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const coverImage = track.cover_url || track.album_art_url;

  return (
    <div className="flex flex-col md:flex-row gap-8 mb-10">
      {/* Album art + vinyl disc "Now Spinning" */}
      <div className="relative group shrink-0">
        {/* Vinyl disc behind, rotates on hover */}
        <div
          className="absolute top-2 -right-6 md:-right-8 h-48 w-48 md:h-56 md:w-56 vinyl-disc opacity-50 transition-all duration-700 group-hover:translate-x-4 group-hover:opacity-70 group-hover:animate-vinyl-spin"
          aria-hidden="true"
        />
        {/* Album sleeve */}
        <div className="relative z-10 h-48 w-48 md:h-56 md:w-56 rounded-xl bg-secondary overflow-hidden holo-glow">
          {coverImage ? (
            <img
              src={coverImage}
              alt={`${track.title} album art`}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full holo-gradient opacity-25" />
          )}
        </div>
        {/* "Now Spinning" label */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 glow-chip opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          NOW SPINNING
        </div>
      </div>

      <div className="flex flex-col justify-end">
        {track.genre && (
          <span className="glow-chip w-fit mb-3">
            {track.genre.toUpperCase()}
          </span>
        )}
        <h1 className="font-display text-3xl md:text-4xl text-foreground font-bold tracking-wider">
          {track.title.toUpperCase()}
        </h1>
        <Link
          href={`/artist/${encodeURIComponent(track.artist)}`}
          className="text-lg text-muted-foreground mt-1 hover:text-primary transition-colors inline-block"
        >
          {track.artist}
        </Link>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          {track.album && (
            <Link
              href={`/album/${encodeURIComponent(track.album)}`}
              className="hover:text-primary transition-colors"
            >
              {track.album}
            </Link>
          )}
          {track.release_year && <span>{track.release_year}</span>}
          {track.duration_seconds && (
            <span>{formatDuration(track.duration_seconds)}</span>
          )}
        </div>

        {/* Listen links */}
        {(track.youtube_url || track.spotify_url) && (
          <div className="flex items-center gap-2 mt-3">
            {track.youtube_url && (
              <a
                href={track.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-border/30 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200 btn-press"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube
              </a>
            )}
            {track.spotify_url && (
              <a
                href={track.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-border/30 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200 btn-press"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Spotify
              </a>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 mt-5">
          <div className="flex items-center gap-1.5" title="Community average from all user ratings">
            <Star className="h-5 w-5 text-primary fill-primary" />
            <span className="text-xl font-display font-bold text-foreground tracking-wide">
              {Number(track.average_rating ?? 0).toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({(track.total_ratings ?? 0).toLocaleString()} ratings)
            </span>
          </div>

          <div className="h-6 w-px bg-border/50" />

          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground mr-1.5">Your rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="transition-all duration-150 hover:scale-125 btn-press"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={`h-5 w-5 transition-colors duration-150 ${
                    star <= (hoveredStar || rating || 0)
                      ? "text-primary fill-primary"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
