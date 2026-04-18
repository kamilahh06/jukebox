import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const SERP_API_KEY = process.env.SERP_API_KEY;

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

async function searchSerp(query: string): Promise<string | null> {
  if (!SERP_API_KEY) return null;
  const url = new URL("https://serpapi.com/search");
  url.searchParams.set("api_key", SERP_API_KEY);
  url.searchParams.set("q", query);
  url.searchParams.set("engine", "google");
  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) return null;
  const data = await res.json();
  const link = data?.organic_results?.[0]?.link;
  return typeof link === "string" ? link : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const trackId = body?.trackId ?? body?.track_id;
    if (!trackId || typeof trackId !== "string") {
      return NextResponse.json({ error: "trackId required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: track, error: fetchError } = await supabase
      .from("tracks")
      .select("id, title, artist, youtube_url, spotify_url")
      .eq("id", trackId)
      .single();

    if (fetchError || !track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    let youtube_url = track.youtube_url ?? null;
    let spotify_url = track.spotify_url ?? null;
    const query = `${track.artist} ${track.title}`;

    if (!youtube_url && SERP_API_KEY) {
      const ytLink = await searchSerp(`${query} youtube official`);
      if (ytLink && (ytLink.includes("youtube.com") || ytLink.includes("youtu.be"))) {
        youtube_url = ytLink;
      }
    }
    if (!spotify_url && SERP_API_KEY) {
      const spLink = await searchSerp(`${query} spotify track`);
      if (spLink && spLink.includes("open.spotify.com")) {
        spotify_url = spLink;
      }
    }

    if (youtube_url !== track.youtube_url || spotify_url !== track.spotify_url) {
      await supabase
        .from("tracks")
        .update({
          youtube_url: youtube_url || null,
          spotify_url: spotify_url || null,
        })
        .eq("id", trackId);
    }

    return NextResponse.json({
      youtube_url,
      spotify_url,
      youtube_embed_id: youtube_url ? extractYoutubeVideoId(youtube_url) : null,
      spotify_embed_id: spotify_url ? extractSpotifyTrackId(spotify_url) : null,
    });
  } catch (e) {
    console.error("track-links API error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
