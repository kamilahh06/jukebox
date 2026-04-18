import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TrackCard } from "@/components/track-card";
import { SectionHeader } from "@/components/section-header";
import { RatingDistChart, TopArtistsChart, TopGenresChart } from "@/components/stats/StatsCharts";
import { Star, MessageSquare, PenLine, Disc3, Music2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // ── platform-wide counts ──────────────────────────────────────────────────
  const [
    { count: totalRatingsGlobal },
    { count: totalReviewsGlobal },
    { count: totalTracksGlobal },
  ] = await Promise.all([
    supabase.from("ratings").select("id",  { count: "exact", head: true }),
    supabase.from("reviews").select("id",  { count: "exact", head: true }),
    supabase.from("tracks").select("id",   { count: "exact", head: true }),
  ]);

  // ── top rated tracks (must have at least 1 rating) ───────────────────────
  const { data: topTracksRaw } = await supabase
    .from("tracks")
    .select("id, title, artist, cover_url, average_rating, total_ratings")
    .gt("total_ratings", 0)
    .order("average_rating", { ascending: false })
    .limit(6);

  const topTracks = (topTracksRaw ?? []) as {
    id: string; title: string; artist: string;
    cover_url: string | null;
    average_rating: number; total_ratings: number;
  }[];

  // ── artist & genre distributions (sample 500 rated tracks) ───────────────
  const { data: sampleRaw } = await supabase
    .from("tracks")
    .select("artist, total_ratings")
    .gt("total_ratings", 0)
    .order("total_ratings", { ascending: false })
    .limit(500);

  const sample = (sampleRaw ?? []) as {
    artist: string; total_ratings: number;
  }[];

  // top artists by total rating volume
  const artistMap = new Map<string, number>();
  for (const t of sample) {
    artistMap.set(t.artist, (artistMap.get(t.artist) ?? 0) + (t.total_ratings ?? 1));
  }
  const topArtists = [...artistMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // genre distribution not available (no genre column in DB)
  const topGenres: { name: string; count: number }[] = [];

  // ── rating distribution across the whole platform ─────────────────────────
  const { data: allRatingsRaw } = await supabase
    .from("ratings")
    .select("score");
  const allRatings = (allRatingsRaw ?? []) as { score: number }[];
  const ratingDist = [1, 2, 3, 4, 5].map((star) => ({
    star: `${star}★`,
    count: allRatings.filter((r) => r.score === star).length,
  }));

  // ── personal stats for the logged-in user ────────────────────────────────
  const { data: myRatingsRaw } = await supabase
    .from("ratings")
    .select("score, created_at, track_id, tracks(id, title, artist, cover_url, average_rating, total_ratings)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const myRatings = (myRatingsRaw ?? []) as Array<{
    score: number; created_at: string; track_id: string;
    tracks: { id: string; title: string; artist: string; cover_url: string | null;
      average_rating: number; total_ratings: number; } | null;
  }>;

  const [{ count: myReviews }, { count: myAnnotations }] = await Promise.all([
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("annotations").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const myAvgRating = myRatings.length
    ? Math.round((myRatings.reduce((s, r) => s + r.score, 0) / myRatings.length) * 10) / 10
    : null;

  const myRecentTracks = myRatings.slice(0, 6).filter((r) => r.tracks);
  const myFiveStars    = myRatings.filter((r) => r.score === 5 && r.tracks).slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ── Header ── */}
      <div className="mb-8">
        <span className="glow-chip mb-3 inline-block">PLATFORM STATS</span>
        <h1 className="font-display text-3xl text-foreground font-bold tracking-wider">
          JUKEBOX BY THE NUMBERS
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Community activity, top artists, and genre trends across the platform
        </p>
      </div>

      {/* ── Platform hero row ── */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: Disc3,         label: "TRACKS",      value: (totalTracksGlobal  ?? 0).toLocaleString() },
          { icon: Star,          label: "RATINGS",     value: (totalRatingsGlobal ?? 0).toLocaleString() },
          { icon: MessageSquare, label: "REVIEWS",     value: (totalReviewsGlobal ?? 0).toLocaleString() },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-5 border border-border/30 flex flex-col gap-2">
            <s.icon className="h-4 w-4 text-primary" />
            <p className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-wide">{s.value}</p>
            <p className="text-[10px] text-muted-foreground tracking-widest font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-xl p-5 border border-border/30">
          <p className="text-[10px] text-muted-foreground tracking-widest font-medium mb-4">COMMUNITY RATING BREAKDOWN</p>
          <RatingDistChart data={ratingDist} />
        </div>
        <div className="glass rounded-xl p-5 border border-border/30">
          <p className="text-[10px] text-muted-foreground tracking-widest font-medium mb-4">TOP GENRES</p>
          {topGenres.length > 0
            ? <TopGenresChart data={topGenres} />
            : <p className="text-sm text-muted-foreground">No genre data yet</p>}
        </div>
        <div className="glass rounded-xl p-5 border border-border/30">
          <p className="text-[10px] text-muted-foreground tracking-widest font-medium mb-4">MOST RATED ARTISTS</p>
          {topArtists.length > 0
            ? <TopArtistsChart data={topArtists} />
            : <p className="text-sm text-muted-foreground">No artist data yet</p>}
        </div>
      </div>

      <div className="groove-line mb-8" />

      {/* ── Top Rated Tracks ── */}
      {topTracks.length > 0 && (
        <section className="mb-10">
          <SectionHeader label="COMMUNITY PICKS" title="Highest Rated Tracks" subtitle="Tracks the community rates highest" />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {topTracks.map((t, i) => (
              <TrackCard
                key={t.id} id={t.id} title={t.title} artist={t.artist}
                albumArtUrl={t.cover_url}
                genre={null}
                averageRating={t.average_rating ?? 0}
                totalRatings={t.total_ratings ?? 0}
                rank={i + 1}
              />
            ))}
          </div>
        </section>
      )}

      <div className="groove-line mb-8" />

      {/* ── Personal stats ── */}
      <div className="mb-6">
        <span className="glow-chip mb-3 inline-block">YOUR ACTIVITY</span>
        <h2 className="font-display text-xl text-foreground font-bold tracking-wider">Your Stats</h2>
      </div>

      {myRatings.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center border border-border/30 mb-10">
          <Star className="h-8 w-8 text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            You haven&apos;t rated any tracks yet. Start rating to see your personal stats here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { icon: Star,          label: "TRACKS RATED",    value: myRatings.length.toLocaleString() },
              { icon: Star,          label: "YOUR AVG RATING", value: myAvgRating ? `${myAvgRating} / 5` : "—" },
              { icon: MessageSquare, label: "REVIEWS WRITTEN", value: (myReviews ?? 0).toLocaleString() },
              { icon: PenLine,       label: "ANNOTATIONS",     value: (myAnnotations ?? 0).toLocaleString() },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl p-5 border border-border/30 flex flex-col gap-2">
                <s.icon className="h-4 w-4 text-primary" />
                <p className="font-display text-2xl font-bold text-foreground tracking-wide">{s.value}</p>
                <p className="text-[10px] text-muted-foreground tracking-widest font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {myFiveStars.length > 0 && (
            <section className="mb-10">
              <SectionHeader label="YOUR TASTE" title="Tracks You Loved" subtitle="Everything you gave 5 stars" />
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {myFiveStars.map(({ tracks: t }) => t && (
                  <TrackCard key={t.id} id={t.id} title={t.title} artist={t.artist}
                    albumArtUrl={t.cover_url}
                    genre={null}
                    averageRating={t.average_rating ?? 0} totalRatings={t.total_ratings ?? 0} />
                ))}
              </div>
            </section>
          )}

          {myRecentTracks.length > 0 && (
            <section>
              <SectionHeader label="HISTORY" title="Recently Rated" subtitle="Your last 6 ratings" />
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {myRecentTracks.map(({ tracks: t, score }) => t && (
                  <div key={t.id} className="relative">
                    <TrackCard id={t.id} title={t.title} artist={t.artist}
                      albumArtUrl={t.cover_url}
                      genre={null}
                      averageRating={t.average_rating ?? 0} totalRatings={t.total_ratings ?? 0} />
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5 px-2 py-0.5 rounded-full glass border border-border/40 text-[10px] font-bold text-primary tracking-wide">
                      <Music2 className="h-2.5 w-2.5 mr-0.5" />YOU: {score}★
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
