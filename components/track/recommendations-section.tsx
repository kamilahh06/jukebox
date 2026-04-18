import { createClient } from "@/lib/supabase/server";
import { TrackCard } from "@/components/track-card";
import { Sparkles } from "lucide-react";

interface Props {
  trackId: string;
  artist:  string;
}

type TrackRow = {
  id: string; title: string; artist: string;
  cover_url: string | null; average_rating: number; total_ratings: number;
};

// Only select columns confirmed to exist in the DB
const cols = "id, title, artist, cover_url, average_rating, total_ratings";

export async function RecommendationsSection({ trackId, artist }: Props) {
  const supabase = await createClient();

  // More tracks by same artist
  const { data: byArtist } = await supabase
    .from("tracks")
    .select(cols)
    .ilike("artist", artist)
    .neq("id", trackId)
    .order("average_rating", { ascending: false })
    .limit(4);

  const artistTracks = (byArtist ?? []) as TrackRow[];
  const artistIds    = new Set(artistTracks.map((t) => t.id));

  // Pad with top-rated tracks from other artists if we have fewer than 6
  let topTracks: TrackRow[] = [];
  const need = 6 - artistTracks.length;
  if (need > 0) {
    const { data } = await supabase
      .from("tracks")
      .select(cols)
      .neq("id", trackId)
      .order("average_rating", { ascending: false })
      .limit(need + 10); // fetch extra to account for filtering

    topTracks = ((data ?? []) as TrackRow[])
      .filter((t) => !artistIds.has(t.id))
      .slice(0, need);
  }

  const combined = [...artistTracks, ...topTracks];
  if (combined.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="groove-line mb-8" />
      <span className="glow-chip mb-3 inline-block">YOU MIGHT LIKE</span>
      <h2 className="font-display text-xl text-foreground font-bold tracking-wider mb-1">
        MORE TO EXPLORE
      </h2>
      <p className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        More from {artist} and top community picks
      </p>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {combined.map((t) => (
          <TrackCard
            key={t.id}
            id={t.id}
            title={t.title}
            artist={t.artist}
            albumArtUrl={t.cover_url}
            averageRating={t.average_rating ?? 0}
            totalRatings={t.total_ratings ?? 0}
          />
        ))}
      </div>
    </section>
  );
}
