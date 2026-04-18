#!/usr/bin/env node
/**
 * Seed track_lines (lyrics) via SerpApi Google Search.
 *
 * For each track missing lyrics:
 *   - Searches: "${artist} ${title} lyrics" and "${title}" "${artist}" lyrics genius"
 *   - Picks best result (prefer Genius / AZLyrics / Musixmatch / LyricsFreak)
 *   - Fetches page HTML and extracts lyric text (best-effort)
 *   - If extraction fails, stores fallback so Track Text is never empty:
 *       Line 0: "Lyrics available here:"
 *       Line 1: <best_result_link>
 *
 * Inserts match your DB: detects line_index vs line_number and text vs content,
 * and satisfies NOT NULL (if both line_index and line_number exist, sets both).
 *
 * Usage:
 *   node scripts/seed-lyrics.mjs [--limit N] [--dry-run] [--force] [--delay MS]
 *
 * Flags:
 *   --limit N   Process only the first N tracks (default: all)
 *   --dry-run   Log what would be done; no deletes or inserts
 *   --force     Re-fetch and replace lyrics for tracks that already have lines
 *   --delay MS  Delay between SerpApi/HTTP calls in ms (default: 1200)
 *
 * Env (in .env.local or shell):
 *   SERPAPI_KEY or SERP_API_KEY   Required for SerpApi
 *   SUPABASE_URL                  Required (or NEXT_PUBLIC_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY     Required (or NEXT_PUBLIC_SUPABASE_ANON_KEY)
 *
 * Success output example:
 *   Detected track_lines schema: line_index + text
 *   Seeded 42 lines (extracted): Artist – Song Title
 *   Seeded 2 lines (fallback): Artist – Song Title
 *   Done. Seeded: 15, Skipped: 3, Failed: 0
 */

import { createClient } from "@supabase/supabase-js";

const limitIdx = process.argv.indexOf("--limit");
const limit = limitIdx >= 0 ? parseInt(process.argv[limitIdx + 1], 10) || 0 : 0;
const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");
const delayIdx = process.argv.indexOf("--delay");
const delayMs = delayIdx >= 0 ? parseInt(process.argv[delayIdx + 1], 10) || 1200 : 1200;

const PREFERRED_DOMAINS = ["genius.com", "azlyrics.com", "musixmatch.com", "lyricsfreak.com"];
const LYRICS_USER_AGENT = "Mozilla/5.0 (compatible; JukeboxLyrics/1.0)";

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

async function serpSearch(apiKey, query) {
  const url = new URL("https://serpapi.com/search");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("engine", "google");
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(15000) });
  if (!res.ok) return [];
  const data = await res.json();
  const results = data?.organic_results;
  return Array.isArray(results) ? results : [];
}

function pickBestResult(results) {
  const withLink = results.filter((r) => r?.link && typeof r.link === "string");
  for (const domain of PREFERRED_DOMAINS) {
    const found = withLink.find((r) => r.link.toLowerCase().includes(domain));
    if (found) return found.link;
  }
  return withLink[0]?.link ?? null;
}

async function fetchPageHtml(url) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(12000),
      headers: { "User-Agent": LYRICS_USER_AGENT },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function stripHtml(html) {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractLyricsFromHtml(html, pageUrl) {
  if (!html) return null;
  const lower = html.toLowerCase();
  const url = (pageUrl || "").toLowerCase();

  let raw = "";

  if (url.includes("genius.com")) {
    const m = html.match(/data-lyrics-container="true"[^>]*>([\s\S]*?)<\/div>/i)
      || html.match(/class="[^"]*Lyrics__Container[^"]*"[\s\S]*?>([\s\S]*?)<\/div>\s*<\/div>/i);
    if (m) raw = m[1].replace(/<[^>]+>/g, "\n").replace(/\n+/g, "\n").trim();
  }
  if (!raw && (url.includes("azlyrics.com") || url.includes("lyricsfreak.com"))) {
    const m = html.match(/<div[^>]*class="[^"]*lyrics[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
      || html.match(/<div[^>]*class="[^"]*ringtone[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (m) raw = m[1].replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "\n").replace(/\n+/g, "\n").trim();
  }
  if (!raw && url.includes("musixmatch.com")) {
    const m = html.match(/<span[^>]*class="[^"]*lyrics__content[^"]*"[^>]*>([\s\S]*?)<\/span>/gi);
    if (m) raw = m.map((s) => s.replace(/<[^>]+>/g, "").trim()).join("\n");
  }
  if (!raw) {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const block = bodyMatch ? bodyMatch[1] : html;
    raw = block.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>\s*<p/gi, "\n").replace(/<[^>]+>/g, "\n").replace(/\n+/g, "\n").trim();
  }

  const lines = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length < 500);
  if (lines.length < 6) return null;
  if (isLikelyLanguageList(lines)) return null;
  return lines.join("\n");
}

const LANGUAGE_AND_NAV_WORDS = new Set([
  "english", "español", "français", "deutsch", "italiano", "português", "portugues",
  "日本語", "中文", "한국어", "nederlands", "polski", "русский", "türkçe", "arabic",
  "language", "languages", "select", "translation", "translations", "home",
  "search", "submit", "login", "sign", "menu", "cookie", "cookies", "privacy", "terms",
  "facebook", "twitter", "instagram", "share", "embed", "video", "official",
]);

function isLikelyLanguageList(lines) {
  if (!lines || lines.length < 3 || lines.length > 30) return false;
  const normalized = lines.map((s) => s.toLowerCase().trim().replace(/\s+/g, " "));
  const singleWord = normalized.filter((s) => s.split(/\s/).length <= 1);
  const inSet = singleWord.filter((w) => LANGUAGE_AND_NAV_WORDS.has(w) || LANGUAGE_AND_NAV_WORDS.has(w.replace(/[^\w\s]/g, "")));
  if (singleWord.length >= 3 && inSet.length >= Math.min(3, singleWord.length)) return true;
  if (singleWord.length >= lines.length * 0.6 && lines.length <= 15) return true;
  const allOneWord = lines.every((l) => l.split(/\s/).length <= 2);
  if (lines.length >= 4 && allOneWord && lines.length <= 20) return true;
  return false;
}

function parseLines(rawLyrics) {
  return String(rawLyrics ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function buildFallbackLines(bestLink) {
  return ["Lyrics available here:", bestLink || "(no link found)"];
}

/**
 * Detect track_lines columns so we insert only existing columns and satisfy NOT NULL.
 * Returns { lineCol, textCol, hasLineIndex, hasLineNumber, hasText, hasContent }
 */
async function detectTrackLinesSchema(supabase) {
  const { data: rows, error: selectError } = await supabase
    .from("track_lines")
    .select("*")
    .limit(1);
  if (!selectError && rows && rows.length > 0) {
    const keys = Object.keys(rows[0]);
    return {
      hasLineIndex: keys.includes("line_index"),
      hasLineNumber: keys.includes("line_number"),
      hasText: keys.includes("text"),
      hasContent: keys.includes("content"),
    };
  }
  const { data: tracks } = await supabase.from("tracks").select("id").limit(1);
  const trackId = tracks?.[0]?.id;
  if (!trackId) return { hasLineIndex: true, hasLineNumber: false, hasText: true, hasContent: false };

  for (const shape of [
    { line_index: 0, text: "__schema_check__" },
    { line_number: 1, content: "__schema_check__" },
  ]) {
    const row = { track_id: trackId, ...shape };
    const { error } = await supabase.from("track_lines").insert(row);
    if (!error) {
      await supabase.from("track_lines").delete().eq("track_id", trackId);
      return {
        hasLineIndex: shape.line_index !== undefined,
        hasLineNumber: shape.line_number !== undefined,
        hasText: shape.text !== undefined,
        hasContent: shape.content !== undefined,
      };
    }
  }
  return { hasLineIndex: true, hasLineNumber: false, hasText: true, hasContent: false };
}

function buildRow(trackId, lineIndex, lineText, schema) {
  const row = { track_id: trackId };
  if (schema.hasLineIndex) row.line_index = lineIndex;
  if (schema.hasLineNumber) row.line_number = lineIndex + 1;
  if (schema.hasText) row.text = lineText;
  if (schema.hasContent) row.content = lineText;
  return row;
}

async function main() {
  await loadEnv();
  const apiKey = process.env.SERPAPI_KEY || process.env.SERP_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!apiKey) {
    console.error("Set SERPAPI_KEY or SERP_API_KEY in .env.local or env.");
    process.exit(1);
  }
  if (!supabaseUrl || !supabaseKey) {
    console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_*) in .env.local or env.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const schema = await detectTrackLinesSchema(supabase);
  console.log(
    "Detected track_lines schema:",
    [
      schema.hasLineIndex && "line_index",
      schema.hasLineNumber && "line_number",
      schema.hasText && "text",
      schema.hasContent && "content",
    ]
      .filter(Boolean)
      .join(", ")
  );

  let query = supabase.from("tracks").select("id, title, artist").order("title");
  if (limit > 0) query = query.limit(limit);
  const { data: tracks, error: tracksErr } = await query;
  if (tracksErr) {
    console.error("Tracks fetch error:", tracksErr.message);
    process.exit(1);
  }
  if (!tracks?.length) {
    console.log("No tracks in database.");
    return;
  }

  let seeded = 0;
  let skipped = 0;
  let failed = 0;

  for (const track of tracks) {
    if (!force) {
      const { data: existing } = await supabase
        .from("track_lines")
        .select("id")
        .eq("track_id", track.id)
        .limit(1);
      if (existing?.length) {
        skipped++;
        continue;
      }
    }

    const q1 = `${track.artist} ${track.title} lyrics`;
    const q2 = `"${track.title}" "${track.artist}" lyrics genius`;
    const [results1, results2] = await Promise.all([
      serpSearch(apiKey, q1),
      serpSearch(apiKey, q2),
    ]);
    await delay(delayMs);

    const allResults = [...(results1 || []), ...(results2 || [])];
    const bestLink = pickBestResult(allResults);
    let lines = [];

    if (bestLink) {
      const html = await fetchPageHtml(bestLink);
      await delay(delayMs);
      const extracted = extractLyricsFromHtml(html, bestLink);
      if (extracted) {
        lines = parseLines(extracted);
      }
    }
    if (lines.length === 0) {
      lines = buildFallbackLines(bestLink);
    }

    if (lines.length === 0) {
      console.warn(`No lyrics or link: ${track.artist} – ${track.title}`);
      failed++;
      continue;
    }

    if (force) {
      const { error: delErr } = await supabase.from("track_lines").delete().eq("track_id", track.id);
      if (delErr && !dryRun) {
        console.warn(`Delete failed ${track.title}:`, delErr.message);
        failed++;
        continue;
      }
    }

    const rows = lines.map((lineText, i) => buildRow(track.id, i, lineText, schema));

    if (dryRun) {
      console.log(
        `Would insert ${rows.length} lines: ${track.artist} – ${track.title}${lines[0] === "Lyrics available here:" ? " (fallback)" : " (extracted)"}`
      );
      seeded++;
      continue;
    }

    const CHUNK = 200;
    let ok = true;
    for (let start = 0; start < rows.length; start += CHUNK) {
      const chunk = rows.slice(start, start + CHUNK);
      const { error: insErr } = await supabase.from("track_lines").insert(chunk);
      if (insErr) {
        console.warn(`Insert failed ${track.title}:`, insErr.message);
        ok = false;
        break;
      }
    }
    if (!ok) {
      failed++;
      continue;
    }

    const kind = lines[0] === "Lyrics available here:" ? "fallback" : "extracted";
    console.log(`Seeded ${rows.length} lines (${kind}): ${track.artist} – ${track.title}`);
    seeded++;
  }

  console.log(`Done. Seeded: ${seeded}, Skipped: ${skipped}, Failed: ${failed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
