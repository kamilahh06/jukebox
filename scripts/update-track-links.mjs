#!/usr/bin/env node
/**
 * Seed/update listen links (youtube_url, spotify_url) for tracks.
 * Uses SerpApi when SERP_API_KEY is set; otherwise only processes tracks that already have URLs.
 * Usage: node scripts/update-track-links.mjs [--limit N] [--dry-run]
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) in env or .env.local
 * Optional: SERP_API_KEY for auto-discovery
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERP_API_KEY = process.env.SERP_API_KEY;
const limitIdx = process.argv.indexOf("--limit");
const limit = limitIdx >= 0 ? parseInt(process.argv[limitIdx + 1], 10) || 0 : parseInt(process.env.LIMIT || "0", 10);
const dryRun = process.argv.includes("--dry-run");
const delayMs = (v) => new Promise((r) => setTimeout(r, v));

async function loadEnv() {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      for (const line of content.split("\n")) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
      }
    }
  } catch (_) {}
}

async function searchSerp(query) {
  if (!SERP_API_KEY) return null;
  const url = new URL("https://serpapi.com/search");
  url.searchParams.set("api_key", SERP_API_KEY);
  url.searchParams.set("q", query);
  url.searchParams.set("engine", "google");
  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const data = await res.json();
  const link = data?.organic_results?.[0]?.link;
  return typeof link === "string" ? link : null;
}

function isValidYoutube(url) {
  return url && (url.includes("youtube.com") || url.includes("youtu.be"));
}
function isValidSpotify(url) {
  return url && url.includes("open.spotify.com");
}

async function main() {
  await loadEnv();
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_*) in env or .env.local");
    process.exit(1);
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  let query = supabase.from("tracks").select("id, title, artist, youtube_url, spotify_url").order("title");
  if (limit > 0) query = query.limit(limit);
  const { data: tracks, error } = await query;
  if (error) {
    console.error("Supabase error:", error.message);
    process.exit(1);
  }
  if (!tracks?.length) {
    console.log("No tracks found.");
    return;
  }
  const needYoutube = tracks.filter((t) => !t.youtube_url);
  const needSpotify = tracks.filter((t) => !t.spotify_url);
  const toFetch = SERP_API_KEY ? (needYoutube.length + needSpotify.length) : 0;
  console.log(`Tracks: ${tracks.length}. Missing YouTube: ${needYoutube.length}, Spotify: ${needSpotify.length}. SerpApi: ${SERP_API_KEY ? "yes" : "no"}. Dry run: ${dryRun}`);
  let updated = 0;
  for (const track of tracks) {
    let yt = track.youtube_url;
    let sp = track.spotify_url;
    const q = `${track.artist} ${track.title}`;
    if (!yt && SERP_API_KEY) {
      const link = await searchSerp(`${q} youtube official`);
      if (link && isValidYoutube(link)) yt = link;
      await delayMs(400);
    }
    if (!sp && SERP_API_KEY) {
      const link = await searchSerp(`${q} spotify track`);
      if (link && isValidSpotify(link)) sp = link;
      await delayMs(400);
    }
    if ((yt !== track.youtube_url || sp !== track.spotify_url) && (yt || sp)) {
      if (!dryRun) {
        const { error: upErr } = await supabase.from("tracks").update({ youtube_url: yt || null, spotify_url: sp || null }).eq("id", track.id);
        if (upErr) console.warn("Update failed", track.id, upErr.message);
        else updated++;
      } else {
        console.log(`Would update ${track.title} | ${track.artist} -> yt: ${yt ? "yes" : "no"}, sp: ${sp ? "yes" : "no"}`);
        updated++;
      }
    }
  }
  console.log(`Done. Updated: ${updated}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
