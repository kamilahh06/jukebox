"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const router = useRouter();
  const [finding, setFinding] = useState(false);
  const [autoFetched, setAutoFetched] = useState(false);
  const hasAny = !!(youtube_url || spotify_url);
  const ytId = youtube_url ? extractYoutubeVideoId(youtube_url) : null;
  const spId = spotify_url ? extractSpotifyTrackId(spotify_url) : null;

  useEffect(() => {
    if (hasAny || autoFetched || !trackId) return;
    setAutoFetched(true);
    setFinding(true);
    fetch("/api/track-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId }),
    })
      .then((r) => { if (r.ok) router.refresh(); })
      .finally(() => setFinding(false));
  }, [trackId, hasAny, autoFetched, router]);

  const handleFindLinks = async () => {
    setFinding(true);
    try {
      const res = await fetch("/api/track-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId }),
      });
      if (res.ok) router.refresh();
    } finally {
      setFinding(false);
    }
  };

  return (
    <div className="glass rounded-xl p-6 mb-8 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px holo-gradient opacity-40" />
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="font-display text-sm font-semibold text-foreground tracking-wider flex items-center gap-2">
          <Music className="h-4 w-4 text-primary" />
          LISTEN
        </h2>
        {(!hasAny || finding) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleFindLinks}
            disabled={finding}
            className="border-border/50 text-muted-foreground hover:text-foreground"
          >
            {finding ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Finding…
              </>
            ) : (
              "Find listen links"
            )}
          </Button>
        )}
      </div>

      {!hasAny && !finding && (
        <p className="text-sm text-muted-foreground">
          No listen links yet. Click &quot;Find listen links&quot; to search (requires SerpApi key).
        </p>
      )}

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

      {hasAny && !ytId && !spId && (
        <div className="flex flex-wrap gap-2">
          {youtube_url && (
            <a
              href={youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-border/30 text-xs text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" /> YouTube
            </a>
          )}
          {spotify_url && (
            <a
              href={spotify_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-border/30 text-xs text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Spotify
            </a>
          )}
        </div>
      )}
    </div>
  );
}
