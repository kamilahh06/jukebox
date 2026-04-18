import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Star, User, ListMusic, ArrowLeft } from "lucide-react";

export default async function PlaylistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id === "new") {
    redirect("/playlists/new");
  }
  const supabase = await createClient();

  const { data: playlist } = await supabase
    .from("playlists")
    .select("*, profiles(username, display_name)")
    .eq("id", id)
    .single();

  if (!playlist) notFound();

  const { data: items } = await supabase
    .from("playlist_items")
    .select("*, tracks(*)")
    .eq("playlist_id", id)
    .order("position", { ascending: true });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/playlists"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors btn-press"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Playlists
      </Link>

      {/* Playlist header */}
      <div className="glass rounded-xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px holo-gradient opacity-40" />
        <div className="flex flex-col md:flex-row gap-6">
          <div className="h-40 w-40 rounded-xl holo-gradient opacity-25 shrink-0 holo-glow" />
          <div className="flex flex-col justify-end">
            <span className="glow-chip w-fit mb-3">
              <ListMusic className="h-3 w-3" />
              Playlist
            </span>
            <h1 className="font-display text-3xl text-foreground tracking-tight">{playlist.title}</h1>
            {playlist.description && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xl">
                {playlist.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {playlist.profiles?.display_name || playlist.profiles?.username || "Anonymous"}
              </div>
              <div className="flex items-center gap-1.5">
                <ListMusic className="h-3.5 w-3.5" />
                {items?.length || 0} tracks
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="groove-line mb-6" />

      {/* Tracks */}
      {!items || items.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-secondary/60 mb-4">
            <ListMusic className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">This playlist has no tracks yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item, i) => (
            <Link
              key={item.id}
              href={`/track/${item.tracks.id}`}
              className="glass rounded-xl p-4 transition-all duration-300 group block card-tilt hover:border-primary/15"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm font-mono text-muted-foreground/40 w-6 text-right shrink-0 tabular-nums">
                  {i + 1}
                </span>
                <div className="relative h-12 w-12 shrink-0">
                  <div
                    className="absolute top-0.5 -right-1.5 h-10 w-10 vinyl-disc opacity-50 transition-all duration-500 group-hover:translate-x-1.5 group-hover:opacity-70"
                    aria-hidden="true"
                  />
                  <div className="relative z-10 h-12 w-12 rounded-lg bg-secondary overflow-hidden">
                    {(item.tracks.cover_url || item.tracks.album_art_url) ? (
                      <img
                        src={item.tracks.cover_url || item.tracks.album_art_url}
                        alt={`${item.tracks.title} art`}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full holo-gradient opacity-25" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {item.tracks.title}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.tracks.artist}
                    {item.tracks.album && ` \u00B7 ${item.tracks.album}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="h-3 w-3 text-primary fill-primary" />
                  <span className="text-xs text-foreground font-medium tabular-nums">
                    {Number(item.tracks.average_rating).toFixed(1)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
