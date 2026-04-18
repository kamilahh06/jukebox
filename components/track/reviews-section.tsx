"use client";

import React, { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ThumbsUp, MessageSquare, ArrowUpDown, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  text?: string;
  body?: string;
  created_at: string;
  user_id: string;
  profiles?: {
    username?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
  } | null;
}

interface ReviewsSectionProps {
  trackId: string;
  reviews: Review[];
  reviewUpvoteCounts?: Record<string, number>;
  userId: string | null;
}

export function ReviewsSection({ trackId, reviews, reviewUpvoteCounts = {}, userId }: ReviewsSectionProps) {
  const [sort, setSort] = useState<"top" | "newest">("newest");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const sortedReviews = useMemo(() => {
    const list = [...reviews];
    if (sort === "top") {
      return list.sort(
        (a, b) => (reviewUpvoteCounts[b.id] ?? 0) - (reviewUpvoteCounts[a.id] ?? 0)
      );
    }
    return list.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [reviews, sort, reviewUpvoteCounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Please sign in to write a review");
      return;
    }
    if (!body.trim()) {
      toast.error("Review text is required");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("reviews").insert({
      track_id: trackId,
      user_id: userId,
      body: body.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Failed to submit review");
      return;
    }
    toast.success("Review submitted!");
    setBody("");
    router.refresh();
  };

  const handleUpvote = async (reviewId: string) => {
    if (!userId) {
      toast.error("Please sign in to react");
      return;
    }
    const supabase = createClient();
    const { data: existing } = await supabase
      .from("reactions")
      .select("id")
      .eq("user_id", userId)
      .eq("target_type", "review")
      .eq("target_id", reviewId)
      .eq("emoji", "👍")
      .maybeSingle();

    if (existing) {
      await supabase.from("reactions").delete().eq("id", existing.id);
      toast("Removed reaction");
    } else {
      await supabase.from("reactions").insert({
        user_id: userId,
        target_type: "review",
        target_id: reviewId,
        emoji: "👍",
      });
      toast.success("Upvoted!");
    }
    router.refresh();
  };

  return (
    <div>
      {/* Sort controls */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="glow-chip">
            <MessageSquare className="h-3 w-3" />
            {reviews.length} Review{reviews.length !== 1 ? "s" : ""}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSort(sort === "top" ? "newest" : "top")}
          className="text-muted-foreground hover:text-foreground gap-1 btn-press"
        >
          <ArrowUpDown className="h-3 w-3" />
          {sort === "top" ? "Top" : "Newest"}
        </Button>
      </div>

      {/* Add review form */}
      {userId && (
        <form onSubmit={handleSubmit} className="glass rounded-xl p-5 mb-6 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px holo-gradient opacity-40" />
          <h4 className="text-sm font-display font-medium text-foreground mb-3 tracking-wide">Write a Review</h4>
          <Textarea
            placeholder="Share your thoughts on this track..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground min-h-[100px] mb-3 focus:border-primary/40 focus:ring-primary/20 transition-colors"
          />
          <Button
            type="submit"
            disabled={submitting || !body.trim()}
            size="sm"
            className="holo-gradient text-background font-medium hover:opacity-90 btn-press gap-1.5"
          >
            <Send className="h-3 w-3" />
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      )}

      {/* Reviews list */}
      {sortedReviews.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-secondary/60 mb-4">
            <MessageSquare className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedReviews.map((review, i) => (
            <div
              key={review.id}
              className="glass rounded-xl p-5 transition-all duration-300 hover:border-primary/10"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full holo-gradient flex items-center justify-center text-[10px] text-background font-bold shrink-0">
                      {(review.profiles?.display_name || review.profiles?.username || "A").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {review.profiles?.display_name || review.profiles?.username || "Anonymous"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-8">
                    {review.body ?? review.text ?? ""}
                  </p>
                </div>
              </div>
              <div className="groove-line my-3 ml-8" />
              <div className="flex items-center gap-2 pl-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUpvote(review.id)}
                  className="text-muted-foreground hover:text-primary gap-1.5 h-7 px-2.5 btn-press rounded-full"
                >
                  <ThumbsUp className="h-3 w-3" />
                  <span className="text-xs">Upvote</span>
                  <span className="text-xs tabular-nums font-medium" title="Total upvotes from all users">
                    ({(reviewUpvoteCounts[review.id] ?? 0)})
                  </span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
