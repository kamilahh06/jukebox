"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  X,
  ThumbsUp,
  Sparkles,
  ExternalLink,
  Loader2,
  Send,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TrackLine {
  id: string;
  line_index: number;
  line_number: number;
  content: string;
}

interface Annotation {
  id: string;
  track_id: string;
  line_index: number;
  body: string;
  user_id: string;
  created_at: string;
  profiles?: {
    username?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
  } | null;
}

interface LyricsSectionProps {
  track: { id: string; title: string; artist: string };
  trackLines: TrackLine[];
  annotations: Annotation[];
  annotationReactionCounts?: Record<string, Record<string, number>>;
  userId: string | null;
}

const REACTION_EMOJIS = [
  { emoji: "\u2764\ufe0f", label: "love" },
  { emoji: "\ud83d\udd25", label: "fire" },
  { emoji: "\ud83e\udd2f", label: "mind blown" },
  { emoji: "\ud83d\ude02", label: "funny" },
  { emoji: "\ud83d\ude2d", label: "crying" },
];

export function LyricsSection({
  track,
  trackLines,
  annotations,
  annotationReactionCounts = {},
  userId,
}: LyricsSectionProps) {
  const [selectedLine, setSelectedLine] = useState<TrackLine | null>(null);
  const [annotationText, setAnnotationText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [aiExplain, setAiExplain] = useState<{
    explanation: string;
    interpretations: string[];
    reference?: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const router = useRouter();

  const lineAnnotations = selectedLine
    ? annotations.filter((a) => a.line_index === selectedLine.line_index)
    : [];

  const getAnnotationCount = (lineIndex: number) =>
    annotations.filter((a) => a.line_index === lineIndex).length;

  const handleSubmitAnnotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annotationText.trim() || !selectedLine) return;
    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !currentUser) {
      setSubmitting(false);
      toast.error("Please sign in to annotate");
      return;
    }
    let result = await supabase.from("annotations").insert({
      track_id: track.id,
      track_line_id: selectedLine.id,
      line_index: selectedLine.line_index,
      user_id: currentUser.id,
      body: annotationText.trim(),
    });
    if (result.error?.code === "23503") {
      const email = currentUser.email ?? "";
      const fallbackName = email ? email.split("@")[0] : "User";
      await supabase.from("profiles").upsert(
        {
          id: currentUser.id,
          username: currentUser.user_metadata?.username ?? fallbackName,
          display_name: currentUser.user_metadata?.display_name ?? fallbackName,
        },
        { onConflict: "id" }
      );
      result = await supabase.from("annotations").insert({
        track_id: track.id,
        track_line_id: selectedLine.id,
        line_index: selectedLine.line_index,
        user_id: currentUser.id,
        body: annotationText.trim(),
      });
    }
    setSubmitting(false);
    if (result.error) {
      console.error("Annotation insert error:", result.error);
      const msg =
        result.error.code === "23503"
          ? "Profile may be missing. Complete your profile and try again."
          : result.error.message || "Failed to submit annotation";
      toast.error(msg);
      return;
    }
    toast.success("Annotation added!");
    setAnnotationText("");
    router.refresh();
  };

  const handleUpvoteAnnotation = async (annotationId: string) => {
    if (!userId) {
      toast.error("Please sign in to react");
      return;
    }
    const supabase = createClient();
    const { data: existing } = await supabase
      .from("reactions")
      .select("id")
      .eq("user_id", userId)
      .eq("target_type", "annotation")
      .eq("target_id", annotationId)
      .eq("emoji", "👍")
      .maybeSingle();

    if (existing) {
      await supabase.from("reactions").delete().eq("id", existing.id);
    } else {
      await supabase.from("reactions").insert({
        user_id: userId,
        target_type: "annotation",
        target_id: annotationId,
        emoji: "👍",
      });
    }
    router.refresh();
  };

  const handleAiExplain = async () => {
    if (!selectedLine) return;
    setAiLoading(true);
    setAiExplain(null);
    try {
      const res = await fetch("/api/ai-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackTitle: track.title,
          artistName: track.artist,
          lineText: selectedLine.content,
        }),
      });
      const data = await res.json();
      setAiExplain(data);
    } catch {
      toast.error("AI explain failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleFindSources = () => {
    if (!selectedLine) return;
    window.open(
      `/track/${track.id}?tab=context&line=${encodeURIComponent(selectedLine.content)}`,
      "_self"
    );
  };

  if (trackLines.length === 0) {
    return (
      <div className="glass rounded-xl p-10 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-secondary/60 mb-4">
          <MessageSquare className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No track text available for this song.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Lines column */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col gap-0.5">
          {trackLines.map((line) => {
            const count = getAnnotationCount(line.line_index);
            const isSelected = selectedLine?.id === line.id;
            return (
              <button
                key={line.id}
                onClick={() => setSelectedLine(isSelected ? null : line)}
                className={`text-left px-4 py-2.5 rounded-lg transition-all duration-300 group flex items-start gap-3 ${
                  isSelected
                    ? "bg-primary/8 border border-primary/30 neon-glow-cyan"
                    : "hover:bg-secondary/60 border border-transparent hover:border-primary/10"
                }`}
              >
                <span className="text-xs text-muted-foreground/40 font-mono w-6 shrink-0 pt-0.5 text-right tabular-nums">
                  {line.line_number}
                </span>
                <span
                  className={`text-sm leading-relaxed flex-1 transition-colors duration-200 ${
                    isSelected
                      ? "text-primary font-medium"
                      : "text-foreground/80 group-hover:text-foreground"
                  }`}
                >
                  {line.content}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary shrink-0 font-medium tabular-nums min-w-[1.25rem] text-center" title={`${count} annotation${count !== 1 ? "s" : ""}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Annotation panel */}
      {selectedLine && (
        <div className="w-full lg:w-96 shrink-0">
          <div className="glass rounded-xl p-5 sticky top-20 relative overflow-hidden">
            {/* Top glow line */}
            <div className="absolute inset-x-0 top-0 h-px holo-gradient opacity-50" />

            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <span className="glow-chip mb-2">Line {selectedLine.line_number}</span>
                <p className="text-sm text-foreground font-medium leading-relaxed mt-2">
                  {`"${selectedLine.content}"`}
                </p>
              </div>
              <button
                onClick={() => setSelectedLine(null)}
                className="text-muted-foreground hover:text-foreground ml-2 shrink-0 btn-press"
                aria-label="Close panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAiExplain}
                disabled={aiLoading}
                className="border-accent/30 text-accent hover:bg-accent/10 gap-1.5 btn-press bg-transparent"
              >
                {aiLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                AI Context
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFindSources}
                className="border-border text-foreground hover:bg-secondary gap-1.5 btn-press bg-transparent"
              >
                <ExternalLink className="h-3 w-3" />
                Sources
              </Button>
            </div>

            {/* AI Explanation */}
            {aiExplain && (
              <div className="rounded-lg bg-accent/8 border border-accent/20 p-4 mb-4 relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-3 w-3 text-accent" />
                  <span className="text-xs font-display font-medium text-accent tracking-wide">
                    AI Insight
                  </span>
                </div>
                <p className="text-sm text-foreground/90 mb-2 leading-relaxed">
                  {aiExplain.explanation}
                </p>
                {aiExplain.interpretations?.map((interp, i) => (
                  <div
                    key={i}
                    className="text-xs text-muted-foreground mt-1.5 pl-3 border-l-2 border-accent/30 leading-relaxed"
                  >
                    {interp}
                  </div>
                ))}
                {aiExplain.reference && (
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    Possible reference: {aiExplain.reference}
                  </p>
                )}
              </div>
            )}

            <div className="groove-line my-3" />

            {/* Existing annotations */}
            <div className="flex flex-col gap-3 mb-4">
              {lineAnnotations.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No annotations yet for this line.
                </p>
              ) : (
                lineAnnotations.map((ann) => (
                  <div
                    key={ann.id}
                    className="rounded-lg bg-secondary/50 p-3 border border-border/30 transition-colors hover:border-primary/10"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="h-5 w-5 rounded-full holo-gradient flex items-center justify-center text-[9px] text-background font-bold shrink-0">
                        {(ann.profiles?.display_name || ann.profiles?.username || "A").charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        {ann.profiles?.display_name || ann.profiles?.username || "Anonymous"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(ann.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pl-7">
                      {ann.body}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 pl-7">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpvoteAnnotation(ann.id)}
                        className="h-6 px-1.5 text-muted-foreground hover:text-primary btn-press"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span className="text-[10px] ml-1">Upvote</span>
                        <span className="text-[10px] ml-1 tabular-nums" title="Total upvotes from all users">
                          ({annotationReactionCounts[ann.id]?.["👍"] ?? 0})
                        </span>
                      </Button>
                      {REACTION_EMOJIS.map((r) => {
                        const count = annotationReactionCounts[ann.id]?.[r.emoji] ?? 0;
                        return (
                          <button
                            key={r.label}
                            className="inline-flex items-center gap-1 text-sm hover:scale-105 transition-transform btn-press px-1.5 py-0.5 rounded border border-transparent hover:border-border/50"
                            aria-label={r.label}
                            onClick={async () => {
                              if (!userId) {
                                toast.error("Sign in to react");
                                return;
                              }
                              const supabase = createClient();
                              const { data: ex } = await supabase
                                .from("reactions")
                                .select("id")
                                .eq("user_id", userId)
                                .eq("target_type", "annotation")
                                .eq("target_id", ann.id)
                                .eq("emoji", r.emoji)
                                .maybeSingle();
                              if (ex) {
                                await supabase.from("reactions").delete().eq("id", ex.id);
                                toast(`Removed ${r.emoji}`);
                              } else {
                                await supabase.from("reactions").insert({
                                  user_id: userId,
                                  target_type: "annotation",
                                  target_id: ann.id,
                                  emoji: r.emoji,
                                });
                                toast.success(`Reacted with ${r.emoji}`);
                              }
                              router.refresh();
                            }}
                          >
                            <span>{r.emoji}</span>
                            <span className="text-[10px] tabular-nums text-muted-foreground" title="Total reactions from all users">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add annotation form */}
            {userId ? (
              <form onSubmit={handleSubmitAnnotation}>
                <Textarea
                  placeholder="Add your annotation..."
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground min-h-[80px] mb-2 text-sm focus:border-primary/40 focus:ring-primary/20"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting || !annotationText.trim()}
                  className="holo-gradient text-background font-medium hover:opacity-90 w-full btn-press gap-1.5"
                >
                  <Send className="h-3 w-3" />
                  {submitting ? "Submitting..." : "Add Annotation"}
                </Button>
              </form>
            ) : (
              <p className="text-xs text-muted-foreground text-center">
                Sign in to add annotations
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
