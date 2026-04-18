import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { TrackHeader } from "@/components/track/track-header";
import { TrackTabs } from "@/components/track/track-tabs";
import { ListenSection } from "@/components/track/listen-section";
import { RecommendationsSection } from "@/components/track/recommendations-section";

export const dynamic = "force-dynamic";

export default async function TrackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: track } = await supabase
    .from("tracks")
    .select("*, average_rating, total_ratings")
    .eq("id", id)
    .single();

  if (!track) notFound();

  const { data: trackLinesRaw } = await supabase
    .from("track_lines")
    .select("*")
    .eq("track_id", id)
    .order("line_index", { ascending: true });

  const trackLines = (trackLinesRaw ?? []).map((l: Record<string, unknown>) => {
    const lineIndex = typeof l.line_index === "number" ? l.line_index : typeof l.line_number === "number" ? (l.line_number as number) - 1 : 0;
    const lineText = (l.text ?? l.content ?? "") as string;
    return {
      id: l.id,
      track_id: l.track_id,
      line_index: lineIndex,
      line_number: lineIndex + 1,
      content: lineText,
      text: lineText,
    };
  });

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, body, created_at, user_id, track_id, profiles(username, display_name, avatar_url)")
    .eq("track_id", id)
    .order("created_at", { ascending: false });

  const reviewIds = (reviews ?? []).map((r: { id: string }) => r.id);
  let reviewUpvoteCounts: Record<string, number> = {};
  if (reviewIds.length > 0) {
    const { data: reviewReactions } = await supabase
      .from("reactions")
      .select("target_id")
      .eq("target_type", "review")
      .in("target_id", reviewIds)
      .eq("emoji", "👍");
    for (const row of reviewReactions ?? []) {
      const tid = row.target_id as string;
      reviewUpvoteCounts[tid] = (reviewUpvoteCounts[tid] ?? 0) + 1;
    }
  }

  const { data: allAnnotations } = await supabase
    .from("annotations")
    .select("id, track_id, line_index, body, user_id, created_at, profiles(username, display_name, avatar_url)")
    .eq("track_id", id)
    .order("created_at", { ascending: false });

  const annotationIds = (allAnnotations ?? []).map((a: { id: string }) => a.id);
  let annotationReactionCounts: Record<string, Record<string, number>> = {};
  if (annotationIds.length > 0) {
    const { data: reactionRows } = await supabase
      .from("reactions")
      .select("target_id, emoji")
      .eq("target_type", "annotation")
      .in("target_id", annotationIds);
    const byTarget: Record<string, Record<string, number>> = {};
    for (const r of reactionRows ?? []) {
      const tid = r.target_id as string;
      const em = (r.emoji as string) || "";
      if (!byTarget[tid]) byTarget[tid] = {};
      byTarget[tid][em] = (byTarget[tid][em] ?? 0) + 1;
    }
    annotationReactionCounts = byTarget;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRating: number | null = null;
  if (user) {
    const { data: ratingData } = await supabase
      .from("ratings")
      .select("score")
      .eq("track_id", id)
      .eq("user_id", user.id)
      .single();
    userRating = ratingData?.score ?? null;
  }

  // Use rating stats from this fetch only (no stale overrides); force-dynamic avoids cache
  const trackWithStats = {
    ...track,
    average_rating: track.average_rating ?? 0,
    total_ratings: track.total_ratings ?? 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <TrackHeader
        track={trackWithStats}
        userRating={userRating}
        userId={user?.id ?? null}
      />
      <ListenSection
        trackId={track.id}
        title={track.title}
        artist={track.artist}
        youtube_url={track.youtube_url ?? null}
        spotify_url={track.spotify_url ?? null}
      />
      <TrackTabs
        track={track}
        trackLines={trackLines}
        reviews={reviews ?? []}
        reviewUpvoteCounts={reviewUpvoteCounts}
        annotations={allAnnotations ?? []}
        annotationReactionCounts={annotationReactionCounts}
        userId={user?.id ?? null}
      />
      <RecommendationsSection
        trackId={track.id}
        artist={track.artist}
      />
    </div>
  );
}
