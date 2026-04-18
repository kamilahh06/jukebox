import { NextResponse } from "next/server";

type Organic = {
  title?: string;
  link?: string;
  snippet?: string;
  source?: string;
};

const ALLOWED_DOMAINS = [
  "genius.com",
  "songmeanings.com",
  "songmeaningsandfacts.com",
  "lyricsinterpretations.com",
  "reddit.com",
  "medium.com",
  "pitchfork.com",
  "rollingstone.com",
  "theguardian.com",
  "npr.org",
  "stereogum.com",
];

const BLOCKLIST_TERMS = [
  "prince harry",
  "harry styles",
  "aperture",
  "incredibly thick",
];

function safeLower(s: string) {
  return (s ?? "").toLowerCase();
}

function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isAllowed(url: string) {
  const d = domainOf(url);
  return ALLOWED_DOMAINS.some((ok) => d === ok || d.endsWith(`.${ok}`));
}

function looksRelevant(r: Organic, trackTitle: string, artistName: string) {
  const hay = safeLower(`${r.title} ${r.snippet} ${r.link}`);
  const t = safeLower(trackTitle);
  const a = safeLower(artistName);

  // Must mention track OR artist
  const mentions = hay.includes(t) || hay.includes(a);

  // Block obvious unrelated junk
  const blocked = BLOCKLIST_TERMS.some((b) => hay.includes(b));

  return mentions && !blocked;
}

function extractMeaningSentences(text: string) {
  // Pull sentences likely to contain interpretation.
  // This is deterministic + cheap.
  const candidates = (text || "")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const KEYWORDS = [
    "means",
    "meaning",
    "about",
    "refers",
    "represents",
    "symbol",
    "metaphor",
    "explores",
    "captures",
    "suggests",
    "theme",
  ];

  return candidates.filter((s) => {
    const l = safeLower(s);
    return KEYWORDS.some((k) => l.includes(k)) && s.length >= 40 && s.length <= 220;
  });
}

async function serpSearch(q: string, apiKey: string) {
  const params = new URLSearchParams({
    engine: "google",
    q,
    api_key: apiKey,
    num: "10",
    hl: "en",
    gl: "us",
  });

  const resp = await fetch(`https://serpapi.com/search?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`SerpAPI ${resp.status}: ${txt}`);
  }
  return resp.json();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trackTitle, artistName, lineText } = body ?? {};

    if (!trackTitle || !artistName || !lineText) {
      return NextResponse.json(
        { error: "trackTitle, artistName, and lineText are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SERP_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        demo: true,
        explanation: `Add SERP_API_KEY to enable live lyric context.`,
        interpretations: [
          `Try again after setting SERP_API_KEY in your environment.`,
          `Then we’ll pull real “meaning/annotation” sources for this line.`,
        ],
        reference: `No live SerpAPI key found.`,
        sources: [],
      });
    }

    // Keep the line short for better relevance (google hates giant chunks)
    const cleanLine = String(lineText).trim().slice(0, 180);

    // Query 1: exact line + track + artist + interpretation sources
    const q1 =
      `"${cleanLine}" "${trackTitle}" ${artistName} meaning OR interpretation OR annotation ` +
      `site:genius.com OR site:songmeanings.com OR site:reddit.com`;

    // Query 2 fallback: track/artist meaning discussion (no exact line)
    const q2 =
      `"${trackTitle}" ${artistName} meaning interpretation analysis ` +
      `site:genius.com OR site:songmeanings.com OR site:reddit.com`;

    const [d1, d2] = await Promise.all([serpSearch(q1, apiKey), serpSearch(q2, apiKey)]);

    const organic1: Organic[] = (d1.organic_results ?? []).map((r: any) => ({
      title: r.title,
      link: r.link,
      snippet: r.snippet,
      source: r.source,
    }));

    const organic2: Organic[] = (d2.organic_results ?? []).map((r: any) => ({
      title: r.title,
      link: r.link,
      snippet: r.snippet,
      source: r.source,
    }));

    // Merge, then filter
    const merged = [...organic1, ...organic2]
      .filter((r) => r.link && r.title && r.snippet)
      .filter((r) => isAllowed(r.link!))
      .filter((r) => looksRelevant(r, trackTitle, artistName));

    // Extract meaning-like sentences
    const meaningBits = merged
      .flatMap((r) => extractMeaningSentences(r.snippet || ""))
      .slice(0, 4);

    const sources = merged
      .slice(0, 5)
      .map((r) => ({ title: r.title!.trim(), link: r.link!.trim() }));

    // If we STILL don’t have meaning sentences, we’ll use non-meaning snippets but keep it honest.
    const fallbackSnippets = merged
      .map((r) => (r.snippet || "").trim())
      .filter((s) => s.length > 40)
      .slice(0, 2);

    const explanation =
      meaningBits[0]
        ? `Web context suggests this lyric is discussed in terms of: ${meaningBits[0]}`
        : `We found sources for "${trackTitle}" by ${artistName}, but didn’t get clean “meaning” sentences for this exact line. Try a slightly longer excerpt (1–2 lines), or we can rely on broader song meaning sources.`;

    const interpretations = [
      meaningBits[1]
        ? `Interpretation #1: ${meaningBits[1]}`
        : fallbackSnippets[0]
          ? `Interpretation #1 (from source snippets): ${fallbackSnippets[0]}`
          : `Interpretation #1: This line likely reinforces the song’s central emotional tension—what the narrator wants vs. what they fear.`,
      meaningBits[2]
        ? `Interpretation #2: ${meaningBits[2]}`
        : fallbackSnippets[1]
          ? `Interpretation #2 (from source snippets): ${fallbackSnippets[1]}`
          : `Interpretation #2: It can also be read as a symbolic image—using a concrete detail to imply something bigger about the relationship.`,
    ];

    const reference =
      sources.length > 0
        ? `Top sources surfaced: ${sources
            .slice(0, 3)
            .map((s) => s.title)
            .join(" · ")}.`
        : `No strong sources returned.`;

    return NextResponse.json({
      demo: false,
      explanation,
      interpretations,
      reference,
      sources,
      queryUsed: { q1, q2 },
    });
  } catch (e) {
    console.error("ai-explain (serp) error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}