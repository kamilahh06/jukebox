/**
 * Server-only backfill: fetch album art via SerpAPI for the first 20 tracks
 * (by created_at ASC) that are missing cover_url, and save to the database.
 * Call once (e.g. POST /api/backfill-covers). No client-side SerpAPI usage.
 */
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAlbumCoverUrl } from "@/lib/serp-api-cover";

const FIRST_N_TRACKS = 20;
const DELAY_MS = 800;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface Track {
  id: string;
  title: string | null;
  artist: string | null;
  cover_url: string | null;
}

export async function POST() {
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Service role not configured (SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 503 }
    );
  }

  const { data: tracks, error: fetchError } = await supabase
    .from("tracks")
    .select("id, title, artist, cover_url")
    .order("created_at", { ascending: true })
    .limit(FIRST_N_TRACKS);

  if (fetchError) {
    console.error("[backfill-covers] Fetch tracks error:", fetchError);
    return NextResponse.json(
      { error: "Failed to fetch tracks", details: fetchError.message },
      { status: 500 }
    );
  }

  const list: Track[] = (tracks ?? []) as Track[];
  const missing: Track[] = list.filter((t) => !t.cover_url || String(t.cover_url).trim() === "");
  const alreadyHasCover = list.length - missing.length;

  if (alreadyHasCover > 0) {
    console.log(`[backfill-covers] Skipped ${alreadyHasCover} track(s) (already have cover_url).`);
  }

  let fetched = 0;
  let skipped = alreadyHasCover;
  let failed = 0;

  for (const track of missing) {
    const artist = (track.artist ?? "").trim();
    const title = (track.title ?? "").trim();

    if (!title && !artist) {
      skipped += 1;
      continue;
    }

    try {
      const result = await fetchAlbumCoverUrl(artist, title);

      if (result.called && result.url) {
        const { error: updateError } = await supabase
          .from("tracks")
          // @ts-ignore - Supabase admin client without generated types
          .update({ cover_url: result.url })
          .eq("id", track.id);

        if (updateError) {
          console.warn(`[backfill-covers] Update failed for ${track.id}:`, updateError.message);
          failed += 1;
        } else {
          fetched += 1;
          console.log(`[backfill-covers] Backfilled: ${artist} – ${title} (id: ${track.id})`);
        }
      } else {
        if (result.called) failed += 1;
        else skipped += 1;
      }
    } catch (err) {
      console.error(`[backfill-covers] Error for track ${track.id}:`, err);
      failed += 1;
    }

    await delay(DELAY_MS);
  }

  return NextResponse.json({
    ok: true,
    processed: list.length,
    fetched,
    skipped,
    failed,
    message: `Processed first ${list.length} tracks; fetched ${fetched}, skipped ${skipped}, failed ${failed}.`,
  });
}
