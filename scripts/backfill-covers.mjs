#!/usr/bin/env node
/**
 * One-time backfill: fetch album art via SerpAPI for the first 20 tracks
 * (by created_at ASC) that are missing cover_url, and save to the database.
 *
 * Only the first 20 songs ever trigger SerpAPI lookups. Each is fetched at most
 * once and cached in tracks.cover_url. No duplicate calls for the same track.
 *
 * Usage:
 *   node -r dotenv/config scripts/backfill-covers.mjs dotenv_config_path=.env.local
 *   node scripts/backfill-covers.mjs   # if .env.local is loaded elsewhere
 *
 * Env (in .env.local or shell):
 *   SERPAPI_KEY or SERP_API_KEY   Required for SerpAPI
 *   SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY    Required to update tracks
 *
 * Flags:
 *   --dry-run   Log what would be done; do not call SerpAPI or update DB
 */

import { createClient } from "@supabase/supabase-js";

const dryRun = process.argv.includes("--dry-run");
const FIRST_N = 20;
const DELAY_MS = 800;

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

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchAlbumCoverUrl(apiKey, artist, title) {
  const query = `${artist} ${title} album cover`.trim();
  const url = new URL("https://serpapi.com/search");
  url.searchParams.set("engine", "google_images");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", apiKey);
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(15000) });
  if (!res.ok) return null;
  const data = await res.json();
  const first = data?.images_results?.[0]?.original;
  return typeof first === "string" && first.startsWith("http") ? first : null;
}

async function main() {
  await loadEnv();
  const apiKey = process.env.SERPAPI_KEY || process.env.SERP_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!apiKey) {
    console.error("Set SERPAPI_KEY or SERP_API_KEY in .env.local or env.");
    process.exit(1);
  }
  if (!supabaseUrl || !supabaseKey) {
    console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local or env.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: tracks, error: fetchError } = await supabase
    .from("tracks")
    .select("id, title, artist, cover_url")
    .order("created_at", { ascending: true })
    .limit(FIRST_N);

  if (fetchError) {
    console.error("Fetch tracks error:", fetchError.message);
    process.exit(1);
  }
  const list = tracks ?? [];
  const missing = list.filter((t) => t.cover_url == null || String(t.cover_url).trim() === "");

  if (dryRun) {
    console.log(`[dry-run] First ${FIRST_N} tracks: ${list.length} total, ${missing.length} missing cover_url.`);
    missing.forEach((t, i) => console.log(`  ${i + 1}. ${t.artist} – ${t.title}`));
    return;
  }

  let fetched = 0;
  let skipped = list.length - missing.length;
  let failed = 0;

  for (const track of missing) {
    const artist = String(track.artist ?? "").trim();
    const title = String(track.title ?? "").trim();
    if (!title && !artist) {
      skipped += 1;
      continue;
    }
    console.log(`[SerpAPI cover] Called for: ${artist} – ${title}`);
    const url = await fetchAlbumCoverUrl(apiKey, artist, title);
    if (url) {
      const { error: updateError } = await supabase
        .from("tracks")
        .update({ cover_url: url })
        .eq("id", track.id);
      if (updateError) {
        console.warn(`  Update failed: ${updateError.message}`);
        failed += 1;
      } else {
        fetched += 1;
      }
    } else {
      failed += 1;
    }
    await delay(DELAY_MS);
  }

  console.log(`Done. Processed ${list.length} (first ${FIRST_N}); fetched ${fetched}, skipped ${skipped}, failed ${failed}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
