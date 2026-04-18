import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Usage: /api/import-itunes?secret=jukebox_seed&terms=Drake,Taylor+Swift,SZA
// Uses the free Deezer API — no key required, returns 1000x1000 album art.

const SEED_SECRET = "jukebox_seed";

interface DeezerTrack {
  id: number;
  title: string;
  artist: { name: string };
  album: {
    title: string;
    cover_xl?: string;
    cover_big?: string;
    cover_medium?: string;
  };
}

interface DeezerResponse {
  data?: DeezerTrack[];
  error?: { message: string };
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const termsParam = req.nextUrl.searchParams.get("terms") ?? "";
  const terms = termsParam.split(",").map((t) => t.trim()).filter(Boolean);

  if (terms.length === 0) {
    return NextResponse.json({
      error: "No terms provided. Usage: ?secret=jukebox_seed&terms=Drake,Beyonce,SZA",
    }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Admin client unavailable. Check SUPABASE_SERVICE_ROLE_KEY." },
      { status: 500 }
    );
  }

  const log: string[] = [];
  let totalInserted = 0;
  let totalSkipped  = 0;

  for (const term of terms) {
    try {
      // Deezer public search API — completely free, no key needed
      const url = `https://api.deezer.com/search?q=${encodeURIComponent(term)}&limit=50`;
      const res = await fetch(url);

      if (!res.ok) {
        log.push(`⚠ Deezer fetch failed for "${term}": ${res.status}`);
        continue;
      }

      const json = (await res.json()) as DeezerResponse;

      if (json.error) {
        log.push(`⚠ Deezer error for "${term}": ${json.error.message}`);
        continue;
      }

      const songs = json.data ?? [];
      if (songs.length === 0) {
        log.push(`— No songs found for "${term}"`);
        continue;
      }

      // Deduplicate within this batch by title+artist
      const seen = new Set<string>();
      const rows: { title: string; artist: string; cover_url: string | null }[] = [];

      for (const s of songs) {
        if (!s.title || !s.artist?.name) continue;
        const key = `${s.title.toLowerCase()}|||${s.artist.name.toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);

        // Prefer highest quality art available
        const cover = s.album?.cover_xl ?? s.album?.cover_big ?? s.album?.cover_medium ?? null;

        rows.push({
          title:     s.title,
          artist:    s.artist.name,
          cover_url: cover,
        });
      }

      if (rows.length === 0) {
        log.push(`— "${term}": no valid rows to insert`);
        continue;
      }

      // Check which title+artist combos already exist
      const { data: existing } = await admin
        .from("tracks")
        .select("title, artist")
        .in("title", rows.map((r) => r.title));

      const existingKeys = new Set(
        (existing ?? []).map((e: { title: string; artist: string }) =>
          `${e.title.toLowerCase()}|||${e.artist.toLowerCase()}`
        )
      );

      const newRows = rows.filter(
        (r) => !existingKeys.has(`${r.title.toLowerCase()}|||${r.artist.toLowerCase()}`)
      );

      const skipped = rows.length - newRows.length;
      totalSkipped += skipped;

      if (newRows.length === 0) {
        log.push(`— "${term}": all ${rows.length} tracks already in DB`);
        continue;
      }

      const { error } = await admin.from("tracks").insert(newRows);
      if (error) {
        log.push(`⚠ Insert failed for "${term}": ${error.message}`);
      } else {
        log.push(`✓ "${term}": +${newRows.length} tracks inserted (${skipped} already existed)`);
        totalInserted += newRows.length;
      }
    } catch (err) {
      log.push(`⚠ Error processing "${term}": ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({
    message: "Import complete!",
    summary: { terms: terms.length, inserted: totalInserted, skipped: totalSkipped },
    log,
  });
}
