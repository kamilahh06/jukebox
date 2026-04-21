import { ExternalLink, Music } from "lucide-react";

function extractYoutubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0] || null;
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

function extractSpotifyTrackId(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("spotify.com")) return null;
    const m = u.pathname.match(/\/track\/([a-zA-Z0-9]+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

interface ListenSectionProps {
  trackId: string;
  title: string;
  artist: string;
  youtube_url: string | null;
  spotify_url: string | null;
}

export function ListenSection({
  trackId,
  title,
  artist,
  youtube_url,
  spotify_url,
}: ListenSectionProps) {
  const ytId = youtube_url ? extractYoutubeVideoId(youtube_url) : null;
  const spId = spotify_url ? extractSpotifyTrackId(spotify_url) : null;

  if (!ytId && !spId) return null;

  return (
    <div className="glass rounded-xl p-6 mb-8 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px holo-gradient opacity-40" />
      <h2 className="font-display text-sm font-semibold text-foreground tracking-wider flex items-center gap-2 mb-4">
        <Music className="h-4 w-4 text-primary" />
        LISTEN
      </h2>

      {(ytId || spId) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spId && (
            <div className="rounded-lg overflow-hidden bg-secondary/30 border border-border/30">
              <p className="text-xs text-muted-foreground px-3 py-2 border-b border-border/30 font-medium">
                Spotify
              </p>
              <iframe
                src={`https://open.spotify.com/embed/track/${spId}?theme=0`}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title={`Spotify: ${title}`}
                className="min-h-[152px]"
              />
              {spotify_url && (
                <a
                  href={spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary px-3 py-2"
                >
                  <ExternalLink className="h-3 w-3" /> Open in Spotify
                </a>
              )}
            </div>
          )}
          {ytId && (
            <div className="rounded-lg overflow-hidden bg-secondary/30 border border-border/30">
              <p className="text-xs text-muted-foreground px-3 py-2 border-b border-border/30 font-medium">
                YouTube
              </p>
              <div className="relative w-full aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`YouTube: ${title}`}
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              {youtube_url && (
                <a
                  href={youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary px-3 py-2"
                >
                  <ExternalLink className="h-3 w-3" /> Open in YouTube
                </a>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
