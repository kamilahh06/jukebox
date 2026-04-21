"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MessageSquare, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PlaylistComment {
  id: string;
  body: string;
  created_at: string;
  profiles?: {
    username?: string | null;
    display_name?: string | null;
  } | null;
}

interface PlaylistCommentsProps {
  playlistId: string;
  comments: PlaylistComment[];
  userId: string | null;
}

export function PlaylistComments({ playlistId, comments, userId }: PlaylistCommentsProps) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Please sign in to comment");
      return;
    }
    if (!body.trim()) return;

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("playlist_comments").insert({
      playlist_id: playlistId,
      user_id: userId,
      body: body.trim(),
    });
    setSubmitting(false);

    if (error) {
      toast.error("Failed to post comment");
      return;
    }
    toast.success("Comment posted!");
    setBody("");
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <span className="glow-chip">
          <MessageSquare className="h-3 w-3" />
          {comments.length} Comment{comments.length !== 1 ? "s" : ""}
        </span>
      </div>

      {userId && (
        <form onSubmit={handleSubmit} className="glass rounded-xl p-5 mb-6 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px holo-gradient opacity-40" />
          <h4 className="text-sm font-display font-medium text-foreground mb-3 tracking-wide">
            Leave a Comment
          </h4>
          <Textarea
            placeholder="Share your thoughts on this playlist..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground min-h-[90px] mb-3 focus:border-primary/40 focus:ring-primary/20 transition-colors"
          />
          <Button
            type="submit"
            disabled={submitting || !body.trim()}
            size="sm"
            className="holo-gradient text-background font-medium hover:opacity-90 btn-press gap-1.5"
          >
            <Send className="h-3 w-3" />
            {submitting ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      )}

      {comments.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-secondary/60 mb-3">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {userId ? "Be the first to comment!" : "No comments yet."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <div key={comment.id} className="glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full holo-gradient flex items-center justify-center text-[10px] text-background font-bold shrink-0">
                  {(comment.profiles?.display_name || comment.profiles?.username || "A")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {comment.profiles?.display_name || comment.profiles?.username || "Anonymous"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-8">{comment.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
