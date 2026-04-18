import { createClient } from "@/lib/supabase/server";
import { TrackCard } from "@/components/track-card";
import { SectionHeader } from "@/components/section-header";
import { ArrowLeft, Disc3, Star } from "lucide-react";
import Link from "next/link";

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const albumName = decodeURIComponent(name);
  const supabase = await createClient();

  const { data: tracks } = await supabase
    .from("tracks")
    .select("*, reviews(count)")
    .ilike("album", albumName)
    .order("average_rating", { ascending: false });

  const artist = tracks?.[0]?.artist ?? "Unknown Artist";
  const coverUrl = tracks?.find((t) => t.cover_url || t.album_art_url);
  const coverImage = coverUrl?.cover_url || coverUrl?.album_art_url;
  const avgRating =
    tracks && tracks.length > 0
      ? tracks.reduce((sum, t) => sum + Number(t.average_rating || 0), 0) /
        tracks.length
      : 0;
  const releaseYear = tracks?.find((t) => t.release_year)?.release_year;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        href={`/artist/${encodeURIComponent(artist)}`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {artist}
      </Link>

      {/* Album header */}
      <div className="glass rounded-xl p-6 mb-8 border border-border/30">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Album art + vinyl */}
          <div className="relative group shrink-0">
            <div
              className="absolute top-2 -right-6 h-48 w-48 vinyl-disc opacity-40 transition-all duration-700 group-hover:translate-x-4 group-hover:opacity-60 group-hover:animate-vinyl-spin"
              aria-hidden="true"
            />
            <div className="relative z-10 h-48 w-48 rounded-xl bg-secondary overflow-hidden holo-glow">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt={`${albumName} cover`}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full holo-gradient opacity-25 flex items-center justify-center">
                  <Disc3 className="h-12 w-12 text-background/50" />
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <span className="glow-chip w-fit mb-3">ALBUM</span>
            <h1 className="font-display text-3xl md:text-4xl text-foreground text-balance font-bold tracking-wider">
              {albumName.toUpperCase()}
            </h1>
            <Link
              href={`/artist/${encodeURIComponent(artist)}`}
              className="text-lg text-muted-foreground mt-1 hover:text-primary transition-colors"
            >
              {artist}
            </Link>
            <div className="flex items-center gap-6 mt-3 text-sm text-muted-foreground">
              {releaseYear && <span>{releaseYear}</span>}
              <span>{tracks?.length || 0} tracks</span>
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                {avgRating.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="groove-line mb-8" />

      <SectionHeader label="TRACKLIST" title="Album Tracks" />

      {!tracks || tracks.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center border border-border/30">
          <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Disc3 className="h-7 w-7 text-primary" />
          </div>
          <p className="text-muted-foreground">No tracks found for this album.</p>
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
