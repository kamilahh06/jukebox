import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const SEED_SECRET = "jukebox_seed";

// 60 varied review lines so no two tracks feel the same
const REVIEWS = [
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
  "The outro lingers in your head for hours.",
  "Not a second wasted in this track. Tight composition.",
  "The feature fits perfectly — feels totally cohesive.",
  "A grower for sure. Give it three listens before judging.",
  "Raw emotion without being melodramatic. Rare balance.",
  "This production style is ahead of its time.",
  "The sample choice is inspired. Transforms the whole feel.",
  "Could listen to this on loop forever and never get tired.",
  "Every time the chorus hits I feel it in my chest.",
  "Criminally underplayed. Should have way more streams.",
  "The energy on this track is completely unmatched.",
  "I don't even like this genre but this one got me.",
  "The way the melody evolves through the track is so satisfying.",
  "Instant mood shift every single time it comes on.",
  "Short but does exactly what it needs to. Perfect runtime.",
  "The production has so many little details on repeat listens.",
  "This deserved way more attention when it dropped.",
  "Genuinely can't pick a favorite part — it's all good.",
  "The artist sounds completely locked in here. Career best?",
  "Opened this randomly and now it's in my top 10.",
  "Rare track where the hook AND the verses both go hard.",
  "The tonal shift halfway through caught me completely off guard.",
  "Every instrument earns its place. Nothing extra, nothing missing.",
  "This would soundtrack a perfect moment in a film.",
  "The ad libs on this are a whole separate experience.",
  "Didn't expect to cry but here we are.",
  "Someone in the studio made the right call on every single choice.",
  "The intro alone is better than most full songs.",
  "This hit differently after I read what it was about.",
  "That chord progression is doing something illegal.",
  "This is the song I'd play to explain what good music feels like.",
  "The restraint shown here is what separates great artists.",
  "Sounds effortless. Which means it took a thousand tries.",
  "Track of the year contender and it's not even close.",
  "The artist has never sounded more confident.",
  "Every listen reveals something new. Incredible depth.",
  "This makes every other track on the album make more sense.",
  "The subtle background elements are doing so much work.",
  "I keep starting it over before it finishes.",
  "The pacing on this is genuinely masterful.",
  "Comfort song. Has been for years, will be for years.",
  "Certified skip-proof. Every second earns its place.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin client unavailable." }, { status: 500 });
  }

  const log: string[] = [];

  // ── 1. Inflate track stats via RPC ────────────────────────────────────────
  const { data: rpcResult, error: rpcError } = await admin.rpc("inflate_track_stats");
  if (rpcError) {
    log.push(
      `⚠ inflate_track_stats() RPC failed: ${rpcError.message}. ` +
      `Run scripts/007_inflate_rpc.sql in Supabase SQL Editor first, then try again.`
    );
  } else {
    log.push(`✓ Updated stats on ${rpcResult} tracks`);
  }

  // ── 2. Find the 20 fake user accounts ────────────────────────────────────
  const fakeEmails = [
    "vinylhead","bassboost99","retrogroover","beatscrafter","lofilucy",
    "synthwave_sam","drumline_dee","chordalex","midnightmixer","waveguru",
    "tempotrish","echochamber_k","puremelody","subwooferjake","crystalears",
    "nocturnalbeats","freqfinder","soulpatch_mo","auralarchive","groovemapper",
  ].map((u) => `${u}@demo.jukebox.app`);

  const { data: userList } = await admin.auth.admin.listUsers({ perPage: 200 });
  const userIds = (userList?.users ?? [])
    .filter((u) => fakeEmails.includes(u.email ?? ""))
    .map((u) => u.id);

  if (userIds.length === 0) {
    log.push("⚠ No fake users found — run /api/seed first to create them.");
    return NextResponse.json({ message: "Partial complete", log });
  }
  log.push(`✓ Found ${userIds.length} fake user accounts`);

  // ── 3. Fetch all track IDs ────────────────────────────────────────────────
  const { data: tracks } = await admin.from("tracks").select("id");
  const trackIds = (tracks ?? []).map((t) => t.id as string);
  log.push(`✓ Found ${trackIds.length} tracks`);

  // ── 4. Flood every track with 8–14 reviews ───────────────────────────────
  // Each track gets reviews from a random selection of fake users.
  // No unique constraint on reviews, so multiple reviews per user/track is fine.
  const reviewRows: { user_id: string; track_id: string; body: string }[] = [];

  for (const tid of trackIds) {
    const count = randInt(8, 14);
    // Shuffle users and take `count` of them (wrap around if needed)
    const shuffled = [...userIds].sort(() => Math.random() - 0.5);
    for (let i = 0; i < count; i++) {
      reviewRows.push({
        user_id:  shuffled[i % shuffled.length],
        track_id: tid,
        body:     pick(REVIEWS),
      });
    }
  }

  // Insert in batches of 500
  let reviewCount = 0;
  for (let i = 0; i < reviewRows.length; i += 500) {
    const batch = reviewRows.slice(i, i + 500);
    const { error } = await admin.from("reviews").insert(batch);
    if (!error) reviewCount += batch.length;
  }
  log.push(`✓ Inserted ${reviewCount.toLocaleString()} reviews across ${trackIds.length} tracks`);

  return NextResponse.json({
    message: "Inflation complete!",
    summary: {
      tracks:  trackIds.length,
      reviews: reviewCount,
      users:   userIds.length,
    },
    log,
  });
}
