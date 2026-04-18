#!/usr/bin/env node
/**
 * Seed tracks and track_lines from a local Kaggle-style CSV (fully offline).
 *
 * Reads scripts/data/song_lyrics.csv or the first .csv in scripts/data/.
 * Inserts into tracks (title, artist, tags from genre, deterministic cover_url)
 * and track_lines (track_id, line_index, line_number, text/content per schema).
 * Deduplicates by (lower(title), lower(artist)). Batches: 200 tracks, 2000 lines.
 *
 * Usage:
 *   node -r dotenv/config scripts/seed-kaggle-lyrics.mjs dotenv_config_path=.env.local
 *   node -r dotenv/config scripts/seed-kaggle-lyrics.mjs dotenv_config_path=.env.local --limit 5000 --dry-run
 *
 * Flags:
 *   --limit N           Only seed N rows from CSV (default: all)
 *   --dry-run           Log what would be done; no inserts/deletes
 *   --truncate          Wipe track_lines then tracks before seeding
 *   --max-lines N       Cap lyric lines per song (default: no cap)
 *   --min-lyrics-chars N  Skip rows with lyrics shorter than N chars (default: 0)
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_*)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "data");
const DEFAULT_CSV = "song_lyrics.csv";

const limitIdx = process.argv.indexOf("--limit");
const limit = limitIdx >= 0 ? parseInt(process.argv[limitIdx + 1], 10) || 0 : 0;
const dryRun = process.argv.includes("--dry-run");
const truncate = process.argv.includes("--truncate");
const maxLinesIdx = process.argv.indexOf("--max-lines");
const maxLines = maxLinesIdx >= 0 ? parseInt(process.argv[maxLinesIdx + 1], 10) || 0 : 0;
const minLyricsCharsIdx = process.argv.indexOf("--min-lyrics-chars");
const minLyricsChars = minLyricsCharsIdx >= 0 ? parseInt(process.argv[minLyricsCharsIdx + 1], 10) || 0 : 0;

const TRACK_BATCH = 200;
const LINES_BATCH = 2000;
const MAX_LINE_LENGTH = 500;

function loadEnv() {
  try {
    const path = join(process.cwd(), ".env.local");
    if (existsSync(path)) {
      const content = readFileSync(path, "utf8");
      for (const line of content.split("\n")) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
      }
    }
  } catch (_) {}
}

function findCsvPath() {
  const defaultPath = join(DATA_DIR, DEFAULT_CSV);
  if (existsSync(defaultPath)) return defaultPath;
  if (!existsSync(DATA_DIR)) return null;
  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".csv"));
  if (files.length === 0) return null;
  return join(DATA_DIR, files[0]);
}

function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headerLine = lines[0];
  const headers = parseCsvLine(headerLine);
  const rows = [];
  let i = 1;
  while (i < lines.length) {
    const result = parseCsvLineWithContinuation(lines, i);
    if (result.fields.length === headers.length) {
      const row = {};
      headers.forEach((h, j) => (row[h] = result.fields[j] ?? ""));
      rows.push(row);
    }
    i = result.nextIndex;
  }
  return { headers, rows };
}

function parseCsvLine(line) {
  const out = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let end = i + 1;
      const parts = [];
      while (end < line.length) {
        const next = line.indexOf('"', end);
        if (next === -1) break;
        if (line[next + 1] === '"') {
          parts.push(line.slice(end, next));
          end = next + 2;
        } else {
          parts.push(line.slice(end, next));
          end = next + 1;
          break;
        }
      }
      out.push(parts.join('"'));
      i = end;
      if (line[i] === ",") i++;
    } else {
      const comma = line.indexOf(",", i);
      const slice = comma === -1 ? line.slice(i) : line.slice(i, comma);
      out.push(slice.trim());
      i = comma === -1 ? line.length : comma + 1;
    }
  }
  return out;
}

function parseCsvLineWithContinuation(lines, startIndex) {
  let full = lines[startIndex];
  let idx = startIndex + 1;
  let quoteCount = (full.match(/"/g) || []).length;
  while (quoteCount % 2 !== 0 && idx < lines.length) {
    full += "\n" + lines[idx];
    quoteCount = (full.match(/"/g) || []).length;
    idx++;
  }
  return { fields: parseCsvLine(full), nextIndex: idx };
}

function normalizeHeaders(headers) {
  return headers.map((h) => {
    const lower = (h || "").toLowerCase().trim();
    if (lower === "song" || lower === "title" || lower === "track") return "song";
    if (lower === "artist" || lower === "singer" || lower === "band") return "artist";
    if (lower === "lyrics" || lower === "lyric" || lower === "text") return "lyrics";
    if (lower === "type" || lower === "genre" || lower === "genre_name") return "type";
    return lower.replace(/\s+/g, "_");
  });
}

function deterministicCoverUrl(title, artist) {
  const s = `${String(title).trim()}|${String(artist).trim()}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) >>> 0;
  const hash = Math.abs(h).toString(36).slice(0, 12);
  return `/api/cover?h=${hash}`;
}

function lyricsToLines(raw, maxLineLength = MAX_LINE_LENGTH) {
  return String(raw ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => (s.length > maxLineLength ? s.slice(0, maxLineLength) : s));
}

function detectTrackLinesSchema(supabase) {
  return (async () => {
    const { data: rows, error: selectError } = await supabase.from("track_lines").select("*").limit(1);
    if (!selectError && rows?.length > 0) {
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
      { line_number: 0, content: "__schema_check__" },
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
  })();
}

function buildLineRow(trackId, lineIndex, lineText, schema) {
  const row = { track_id: trackId };
  if (schema.hasLineIndex) row.line_index = lineIndex;
  if (schema.hasLineNumber) row.line_number = lineIndex;
  if (schema.hasText) row.text = lineText;
  if (schema.hasContent) row.content = lineText;
  return row;
}

async function main() {
  loadEnv();
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_*) in .env.local or env.");
    process.exit(1);
  }

  const csvPath = findCsvPath();
  if (!csvPath) {
    console.error(`No CSV found. Put song_lyrics.csv (or any .csv) in scripts/data/`);
    process.exit(1);
  }
  console.log(`Reading ${csvPath}`);
  const content = readFileSync(csvPath, "utf8");
  const { headers: rawHeaders, rows: rawRows } = parseCsv(content);
  const normalized = normalizeHeaders(rawHeaders);
  const rows = rawRows.map((r) => {
    const out = {};
    rawHeaders.forEach((h, i) => (out[normalized[i]] = (r[h] ?? "").trim()));
    return out;
  });

  const songKey = normalized.find((n) => n === "song") || rawHeaders[0];
  const artistKey = normalized.find((n) => n === "artist");
  const lyricsKey = normalized.find((n) => n === "lyrics");
  const typeKey = normalized.find((n) => n === "type");
  if (!songKey || !artistKey || !lyricsKey) {
    console.error("CSV must have columns for song/title, artist, and lyrics.");
    process.exit(1);
  }

  const seen = new Set();
  const deduped = rows.filter((r) => {
    const title = String(r[songKey] ?? "").trim();
    const artist = String(r[artistKey] ?? "").trim();
    if (!title || !artist) return false;
    const key = `${title.toLowerCase()}|${artist.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  let toSeed = deduped;
  if (minLyricsChars > 0) {
    toSeed = toSeed.filter((r) => (r[lyricsKey] ?? "").length >= minLyricsChars);
    console.log(`After --min-lyrics-chars ${minLyricsChars}: ${toSeed.length} rows`);
  }
  if (limit > 0) {
    toSeed = toSeed.slice(0, limit);
    console.log(`After --limit ${limit}: ${toSeed.length} rows`);
  }

  if (toSeed.length === 0) {
    console.log("No rows to seed.");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const schema = await detectTrackLinesSchema(supabase);
  console.log("Detected track_lines schema:", [
    schema.hasLineIndex && "line_index",
    schema.hasLineNumber && "line_number",
    schema.hasText && "text",
    schema.hasContent && "content",
  ].filter(Boolean).join(", "));

  if (truncate && !dryRun) {
    console.log("Truncating track_lines then tracks...");
    const { data: trackIds } = await supabase.from("tracks").select("id");
    const ids = (trackIds || []).map((t) => t.id);
    if (ids.length > 0) {
      for (let i = 0; i < ids.length; i += 500) {
        const chunk = ids.slice(i, i + 500);
        await supabase.from("track_lines").delete().in("track_id", chunk);
      }
      const { error: delTracks } = await supabase.from("tracks").delete().in("id", ids);
      if (delTracks) console.warn("Delete tracks:", delTracks.message);
    }
  } else if (truncate && dryRun) {
    console.log("[dry-run] Would truncate track_lines then tracks");
  }

  let insertedTracks = 0;
  let insertedLines = 0;
  const capped = maxLines > 0 ? maxLines : Infinity;

  for (let start = 0; start < toSeed.length; start += TRACK_BATCH) {
    const batch = toSeed.slice(start, start + TRACK_BATCH);
    // const tracksToInsert = batch.map((r) => {
    //   const title = String(r[songKey] ?? "").trim();
    //   const artist = String(r[artistKey] ?? "").trim();
    //   const genre = typeKey ? String(r[typeKey] ?? "").trim() : "";
    //   const tags = genre ? [genre] : [];
    //   return {
    //     title: title || "Unknown",
    //     artist: artist || "Unknown",
    //     cover_url: deterministicCoverUrl(title, artist),
    //     tags,
    //   };
    // });
    const tracksToInsert = batch.map((r) => {
      const title = String(r[songKey] ?? "").trim();
      const artist = String(r[artistKey] ?? "").trim();
      return {
        title: title || "Unknown",
        artist: artist || "Unknown",
        cover_url: deterministicCoverUrl(title, artist),
      };
    });

    if (dryRun) {
      console.log(`[dry-run] Would insert ${tracksToInsert.length} tracks and their lyrics`);
      insertedTracks += tracksToInsert.length;
      for (const r of batch) {
        const lines = lyricsToLines(r[lyricsKey]);
        insertedLines += Math.min(lines.length, capped);
      }
      continue;
    }

    const { data: inserted, error: trackErr } = await supabase.from("tracks").insert(tracksToInsert).select("id, title, artist");
    if (trackErr) {
      console.error("Tracks insert error:", trackErr.message);
      break;
    }
    const idByKey = new Map();
    for (const t of inserted || []) {
      idByKey.set(`${(t.title || "").toLowerCase()}|${(t.artist || "").toLowerCase()}`, t.id);
    }
    insertedTracks += inserted.length;

    for (const r of batch) {
      const title = String(r[songKey] ?? "").trim();
      const artist = String(r[artistKey] ?? "").trim();
      const trackId = idByKey.get(`${title.toLowerCase()}|${artist.toLowerCase()}`);
      if (!trackId) continue;
      let lines = lyricsToLines(r[lyricsKey]);
      if (capped !== Infinity) lines = lines.slice(0, capped);
      if (lines.length === 0) continue;
      const lineRows = lines.map((lineText, i) => buildLineRow(trackId, i, lineText, schema));
      for (let L = 0; L < lineRows.length; L += LINES_BATCH) {
        const chunk = lineRows.slice(L, L + LINES_BATCH);
        const { error: lineErr } = await supabase.from("track_lines").insert(chunk);
        if (lineErr) {
          console.warn("Lines insert error:", lineErr.message);
          break;
        }
        insertedLines += chunk.length;
      }
    }
  }

  console.log(`Done. Tracks: ${insertedTracks}, Lines: ${insertedLines}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
