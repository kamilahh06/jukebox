import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Protect the endpoint — call it as /api/seed?secret=jukebox_seed
const SEED_SECRET = "jukebox_seed";

const FAKE_USERS = [
  { username: "vinylhead",      display: "Vinyl Head" },
  { username: "bassboost99",    display: "Bass Boost" },
  { username: "retrogroover",   display: "Retro Groover" },
  { username: "beatscrafter",   display: "Beats Crafter" },
  { username: "lofilucy",       display: "Lo-Fi Lucy" },
  { username: "synthwave_sam",  display: "Synthwave Sam" },
  { username: "drumline_dee",   display: "Drumline Dee" },
  { username: "chordalex",      display: "Chord Alex" },
  { username: "midnightmixer",  display: "Midnight Mixer" },
  { username: "waveguru",       display: "Wave Guru" },
  { username: "tempotrish",     display: "Tempo Trish" },
  { username: "echochamber_k",  display: "Echo Chamber K" },
  { username: "puremelody",     display: "Pure Melody" },
  { username: "subwooferjake",  display: "Subwoofer Jake" },
  { username: "crystalears",    display: "Crystal Ears" },
  { username: "nocturnalbeats", display: "Nocturnal Beats" },
  { username: "freqfinder",     display: "Freq Finder" },
  { username: "soulpatch_mo",   display: "Soul Patch Mo" },
  { username: "auralarchive",   display: "Aural Archive" },
  { username: "groovemapper",   display: "Groove Mapper" },
];

const REVIEW_POOL = [
  "This track hits different at 2am. Instant classic.",
  "Production is immaculate — every layer has a reason to be there.",
  "Been on repeat for a week straight. No notes.",
  "The bridge is where this song absolutely takes off.",
  "Underrated gem. More people need to hear this.",
  "The vocals carry so much emotion without being overdone.",
  "This is the kind of track that makes you stop whatever you're doing.",
  "Perfectly paced. Builds exactly where it needs to.",
  "The bassline alone deserves an award.",
  "First listen I wasn't sold. Third listen I couldn't stop.",
  "Lyrics are doing a lot of heavy lifting here and they deliver.",
  "Sonically this is exactly what I needed today.",
  "One of those rare tracks where nothing feels out of place.",
  "The way the drums drop at the chorus is genuinely genius.",
  "This slaps harder than it has any right to.",
  "Simple concept executed with incredible precision.",
  "Everything about the mixing on this is top tier.",
  "Captures a vibe I didn't even know I was chasing.",
  "The outro lingers in your head for hours. Incredible.",
  "Not a second wasted in this track. Tight composition.",
  "The feature fits perfectly — feels totally cohesive.",
  "A grower for sure. Give it three listens before judging.",
  "Raw emotion without being melodramatic. Rare balance.",
  "This production style is ahead of its time.",
  "The sample choice is inspired. Transforms the whole feel.",
  "Could listen to this on loop forever and never get tired.",
  "Every time the chorus hits I feel it in my chest.",
  "The instrumentation is doing things I didn't know were possible.",
  "Criminally underplayed. Should have millions of streams.",
  "The energy on this track is unmatched.",
];

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function weightedScore() {
  // Weights for 1★–5★: skews toward 3–5 so averages look realistic
  const weights = [1, 2, 4, 6, 5];
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i + 1;
  }
  return 4;
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Admin client unavailable. Check SUPABASE_SERVICE_ROLE_KEY env var." },
      { status: 500 }
    );
  }

  const log: string[] = [];

  // ── 1. Create / find fake users ───────────────────────────────────────────
  const userIds: string[] = [];

  for (const u of FAKE_USERS) {
    const email = `${u.username}@demo.jukebox.app`;
    try {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: "JukeboxDemo2025!",
        email_confirm: true,
        user_metadata: { username: u.username, display_name: u.display },
      });

      let uid: string | undefined;

      if (error) {
        // Already exists — look it up
        const { data: list } = await admin.auth.admin.listUsers();
        const existing = list?.users?.find((x) => x.email === email);
        if (existing) uid = existing.id;
      } else {
        uid = data.user?.id;
      }

      if (!uid) continue;
      userIds.push(uid);

      await admin.from("profiles").upsert(
        { id: uid, username: u.username, display_name: u.display },
        { onConflict: "id" }
      );
    } catch {
      // skip and continue
    }
  }

  log.push(`✓ ${userIds.length} fake users ready`);

  // ── 2. Fetch all track IDs ────────────────────────────────────────────────
  const { data: tracks } = await admin.from("tracks").select("id");
  const trackIds = (tracks ?? []).map((t) => t.id as string);
  log.push(`✓ Found ${trackIds.length} tracks`);

  if (trackIds.length === 0 || userIds.length === 0) {
    return NextResponse.json({ log, message: "Nothing to seed." });
  }

  // ── 3. Seed ratings (each user rates 60–90% of tracks) ───────────────────
  const ratingsToInsert: { user_id: string; track_id: string; score: number }[] = [];

  for (const uid of userIds) {
    const coverage = randInt(60, 90) / 100;
    const subset = pickRandom(trackIds, Math.floor(trackIds.length * coverage));
    for (const tid of subset) {
      ratingsToInsert.push({ user_id: uid, track_id: tid, score: weightedScore() });
    }
  }

  let ratingCount = 0;
  for (let i = 0; i < ratingsToInsert.length; i += 500) {
    const batch = ratingsToInsert.slice(i, i + 500);
    const { error } = await admin
      .from("ratings")
      .upsert(batch, { onConflict: "user_id,track_id" });
    if (!error) ratingCount += batch.length;
  }
  log.push(`✓ Inserted ${ratingCount} ratings`);

  // ── 4. Backfill average_rating + total_ratings on tracks ─────────────────
  // Calls the function created by scripts/006_backfill_rpc.sql
  const { error: rpcError } = await admin.rpc("backfill_track_ratings");
  if (rpcError) {
    log.push(
      `⚠ backfill_track_ratings() RPC failed: ${rpcError.message}. ` +
      `Run scripts/005_track_rating_stats.sql and scripts/006_backfill_rpc.sql in Supabase SQL editor, then re-run seed.`
    );
  } else {
    log.push(`✓ Recalculated average_rating + total_ratings on all tracks`);
  }

  // ── 5. Seed reviews (track-centric: every track gets 2–5 reviews) ─────────
  // Build a lookup: which score did each user give each track?
  const ratingMap = new Map<string, number>(); // "uid|tid" -> score
  for (const r of ratingsToInsert) {
    ratingMap.set(`${r.user_id}|${r.track_id}`, r.score);
  }

  const reviewsToInsert: { user_id: string; track_id: string; body: string }[] = [];

  for (const tid of trackIds) {
    // Pick 2–4 users who rated this track (prefer higher scores)
    const raters = userIds.filter((uid) => ratingMap.has(`${uid}|${tid}`));
    const reviewers = pickRandom(raters, randInt(2, 4));
    for (const uid of reviewers) {
      reviewsToInsert.push({
        user_id: uid,
        track_id: tid,
        body: REVIEW_POOL[Math.floor(Math.random() * REVIEW_POOL.length)],
      });
    }
  }

  // Insert reviews in batches (skip duplicates — no unique constraint, so just insert fresh)
  let reviewCount = 0;
  for (let i = 0; i < reviewsToInsert.length; i += 300) {
    const batch = reviewsToInsert.slice(i, i + 300);
    const { error } = await admin.from("reviews").insert(batch);
    if (!error) reviewCount += batch.length;
  }
  log.push(`✓ Inserted ${reviewCount} reviews across ${trackIds.length} tracks`);

  return NextResponse.json({
    message: "Seeding complete!",
    summary: {
      users: userIds.length,
      tracks: trackIds.length,
      ratings: ratingCount,
      reviews: reviewCount,
    },
    log,
  });
}
