import Link from "next/link";
import { Star, MessageSquare } from "lucide-react";

interface TrackCardProps {
  id: string;
  title: string;
  artist: string;
  album?: string | null;
  albumArtUrl?: string | null;
  genre?: string | null;
  averageRating: number;
  totalRatings: number;
  rank?: number;
  reviewCount?: number;
}

export function TrackCard({
  id,
  title,
  artist,
  album,
  albumArtUrl,
  genre,
  averageRating,
  totalRatings,
  rank,
  reviewCount,
}: TrackCardProps) {
  return (
    <div className="glass rounded-xl p-4 border border-border/30 transition-all duration-500 group card-tilt hover:border-primary/20 hover:shadow-[0_0_20px_rgba(91,234,214,0.08)]">
      <div className="flex gap-4">
        {rank !== undefined && (
          <div className="flex items-center justify-center w-8 shrink-0">
            <span className="font-display text-2xl holo-text font-bold tracking-wide">
              {rank}
            </span>
          </div>
        )}

        {/* Vinyl sleeve + disc — links to track */}
        <Link href={`/track/${id}`} className="relative h-16 w-16 shrink-0">
          <div
            className="absolute top-0.5 -right-2 h-14 w-14 vinyl-disc opacity-60 transition-all duration-500 group-hover:translate-x-2 group-hover:opacity-80"
            aria-hidden="true"
          />
          <div className="relative z-10 h-16 w-16 rounded-lg bg-secondary overflow-hidden">
            {albumArtUrl ? (
              <img
                src={albumArtUrl}
                alt={`${title} album art`}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full holo-gradient opacity-25" />
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/track/${id}`}>
            <h3 className="font-medium text-foreground truncate hover:text-primary transition-colors duration-200">
              {title}
            </h3>
          </Link>
          <Link href={`/artist/${encodeURIComponent(artist)}`}>
            <p className="text-sm text-muted-foreground truncate hover:text-primary transition-colors duration-200">
              {artist}
            </p>
          </Link>
          {album && (
            <p className="text-xs text-muted-foreground/60 truncate">{album}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-primary fill-primary" />
              <span className="text-xs text-foreground font-medium">
                {Number(averageRating ?? 0).toFixed(1)}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground tracking-wide">
              {(totalRatings ?? 0).toLocaleString()} ratings
            </span>
            {reviewCount !== undefined && reviewCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{reviewCount}</span>
              </div>
            )}
            {genre && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium tracking-wide">
                {genre}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
