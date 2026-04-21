import Link from "next/link";
import { ThumbsUp, Quote } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface TopReview {
  id: string;
  body: string;
  created_at: string;
  upvotes: number;
  track: {
    id: string;
    title: string;
    artist: string;
    cover_url?: string | null;
  };
  author: {
    username?: string | null;
    display_name?: string | null;
  };
}

export function TopReviewsSection({ reviews }: { reviews: TopReview[] }) {
  if (reviews.length === 0) return null;

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review, i) => (
        <Link key={review.id} href={`/track/${review.track.id}`}>
          <div
            className="glass rounded-xl p-5 border border-border/30 h-full flex flex-col gap-3 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_20px_rgba(91,234,214,0.08)] card-tilt cursor-pointer"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Quote */}
            <div className="flex gap-2.5 flex-1">
              <Quote className="h-3.5 w-3.5 text-primary/50 shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {review.body}
              </p>
            </div>

            <div className="groove-line" />

            {/* Track info */}
            <div className="flex items-center gap-2.5">
              {review.track.cover_url ? (
                <img
                  src={review.track.cover_url}
                  alt={review.track.title}
                  className="h-8 w-8 rounded object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-8 w-8 rounded holo-gradient opacity-30 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate tracking-wide">
                  {review.track.title}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {review.track.artist}
                </p>
              </div>
            </div>

            {/* Footer: author + upvotes */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 rounded-full holo-gradient flex items-center justify-center text-[9px] text-background font-bold shrink-0">
                  {(review.author.display_name || review.author.username || "A").charAt(0).toUpperCase()}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {review.author.display_name || review.author.username || "Anonymous"}
                </span>
                <span className="text-[11px] text-muted-foreground/50">·</span>
                <span className="text-[11px] text-muted-foreground/50">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-1 text-primary/70">
                <ThumbsUp className="h-3 w-3" />
                <span className="text-xs font-medium tabular-nums">{review.upvotes}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
