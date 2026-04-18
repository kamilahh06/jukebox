import { createClient } from "@/lib/supabase/server";
import { TrackCard } from "@/components/track-card";
import { SectionHeader } from "@/components/section-header";
import { ArrowLeft, Disc3, Star } from "lucide-react";
import Link from "next/link";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const artistName = decodeURIComponent(name);
  const supabase = await createClient();

  const { data: tracks } = await supabase
    .from("tracks")
    .select("*, reviews(count)")
    .ilike("artist", artistName)
    .order("average_rating", { ascending: false });

  const totalRatings =
    tracks?.reduce((sum, t) => sum + (t.total_ratings || 0), 0) ?? 0;
  const avgRating =
    tracks && tracks.length > 0
      ? tracks.reduce((sum, t) => sum + Number(t.average_rating || 0), 0) /
        tracks.length
      : 0;
  const albums = [
    ...new Set(tracks?.map((t) => t.album).filter(Boolean) ?? []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Home
      </Link>

      {/* Artist header */}
      <div className="glass rounded-xl p-6 mb-8 border border-border/30">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-full holo-gradient flex items-center justify-center shrink-0 neon-glow-cyan">
            <Disc3 className="h-10 w-10 text-background" />
          </div>
          <div>
            <span className="glow-chip mb-2 inline-block">ARTIST</span>
            <h1 className="font-display text-3xl md:text-4xl text-foreground text-balance font-bold tracking-wider">
              {artistName.toUpperCase()}
            </h1>
            <div className="flex items-center gap-6 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Disc3 className="h-3.5 w-3.5" />
                {tracks?.length || 0} tracks
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                {avgRating.toFixed(1)} avg
              </div>
              <span>{totalRatings.toLocaleString()} total ratings</span>
            </div>
            {albums.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {albums.map((album) => (
                  <Link
                    key={album}
                    href={`/album/${encodeURIComponent(album!)}`}
                    className="text-[10px] px-2.5 py-1 rounded-full glass border border-border/30 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-200 tracking-wide font-medium"
                  >
                    {album?.toUpperCase()}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="groove-line mb-8" />

      <SectionHeader label="DISCOGRAPHY" title="All Tracks" />

      {!tracks || tracks.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center border border-border/30">
          <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Disc3 className="h-7 w-7 text-primary" />
          </div>
          <p className="text-muted-foreground">No tracks found for this artist.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track, i) => (
            <TrackCard
              key={track.id}
              id={track.id}
              title={track.title}
              artist={track.artist}
              album={track.album}
              albumArtUrl={track.cover_url || track.album_art_url}
              genre={track.genre}
              averageRating={track.average_rating}
              totalRatings={track.total_ratings}
              reviewCount={track.reviews?.[0]?.count ?? 0}
              rank={i + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
