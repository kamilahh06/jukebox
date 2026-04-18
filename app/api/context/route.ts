// import { NextResponse } from "next/server";

// interface ContextCard {
//   title: string;
//   snippet: string;
//   link: string;
//   source: string;
// }

// // Fallback demo data when SERPAPI_KEY is not set
// function getDemoCards(
//   trackTitle: string,
//   artistName: string,
//   mode: string
// ): ContextCard[] {
//   if (mode === "line") {
//     return [
//       {
//         title: `Lyric Analysis: ${trackTitle} by ${artistName}`,
//         snippet: `This line from "${trackTitle}" has been widely discussed by fans and critics alike. Many interpret it as a metaphor for personal transformation and the challenges of staying authentic.`,
//         link: "https://example.com/analysis",
//         source: "Music Analysis Weekly",
//       },
//       {
//         title: `${artistName} Interview: Behind the Lyrics`,
//         snippet: `In a 2019 interview, ${artistName} discussed the meaning behind several tracks, noting that many lines were inspired by personal experiences and literary references.`,
//         link: "https://example.com/interview",
//         source: "Rolling Stone",
//       },
//       {
//         title: `Cultural Impact of ${trackTitle}`,
//         snippet: `The lyrics of "${trackTitle}" have become part of popular culture, frequently referenced in media and academic discussions about modern music.`,
//         link: "https://example.com/culture",
//         source: "Cultural Studies Journal",
//       },
//     ];
//   }

//   return [
//     {
//       title: `The Making of "${trackTitle}" by ${artistName}`,
//       snippet: `An in-depth look at how ${artistName} created one of the most iconic tracks in music history. The recording process involved innovative techniques that defined a generation.`,
//       link: "https://example.com/making-of",
//       source: "Sound on Sound",
//     },
//     {
//       title: `${trackTitle} - Song Meaning and Analysis`,
//       snippet: `"${trackTitle}" explores themes of identity, change, and resilience. Critics have praised the track for its layered composition and deeply personal lyrics.`,
//       link: "https://example.com/meaning",
//       source: "Genius",
//     },
//     {
//       title: `${artistName} on ${trackTitle}: Exclusive Interview`,
//       snippet: `"I wrote this track during a period of significant change in my life," ${artistName} revealed in an exclusive interview about the creative process behind "${trackTitle}."`,
//       link: "https://example.com/interview",
//       source: "NME",
//     },
//     {
//       title: `Why "${trackTitle}" Still Matters Today`,
//       snippet: `Decades after its release, "${trackTitle}" continues to resonate with new generations of listeners. Music historians explain why this track has endured.`,
//       link: "https://example.com/legacy",
//       source: "Pitchfork",
//     },
//     {
//       title: `${trackTitle} Review - A Critical Perspective`,
//       snippet: `When "${trackTitle}" was first released, critics were divided. Today, it's widely regarded as one of ${artistName}'s greatest achievements and a landmark in its genre.`,
//       link: "https://example.com/review",
//       source: "AllMusic",
//     },
//     {
//       title: `The Story Behind ${artistName}'s "${trackTitle}"`,
//       snippet: `From studio sessions to its chart-topping release, the story of "${trackTitle}" is filled with unexpected twists and creative breakthroughs.`,
//       link: "https://example.com/story",
//       source: "Billboard",
//     },
//   ];
// }

// async function searchSerpApi(
//   query: string,
//   apiKey: string
// ): Promise<ContextCard[]> {
//   try {
//     const url = new URL("https://serpapi.com/search.json");
//     url.searchParams.set("q", query);
//     url.searchParams.set("api_key", apiKey);
//     url.searchParams.set("engine", "google");
//     url.searchParams.set("num", "3");

//     const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
//     if (!res.ok) return [];

//     const data = await res.json();
//     const results = data.organic_results || [];

//     return results.slice(0, 3).map(
//       (r: { title?: string; snippet?: string; link?: string; source?: string; displayed_link?: string }) => ({
//         title: r.title || "",
//         snippet: r.snippet || "",
//         link: r.link || "",
//         source: r.source || r.displayed_link || new URL(r.link || "https://example.com").hostname,
//       })
//     );
//   } catch {
//     return [];
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { mode, trackTitle, artistName, lineText } = body;

//     if (!trackTitle || !artistName) {
//       return NextResponse.json(
//         { error: "trackTitle and artistName are required" },
//         { status: 400 }
//       );
//     }

//     const apiKey = process.env.SERPAPI_KEY;

//     // If no API key, return demo cards
//     if (!apiKey) {
//       return NextResponse.json({
//         cards: getDemoCards(trackTitle, artistName, mode || "track"),
//         demo: true,
//       });
//     }

//     let cards: ContextCard[] = [];

//     if (mode === "line" && lineText) {
//       const queries = [
//         `"${lineText}" meaning ${artistName}`,
//         `${lineText} reference ${trackTitle} ${artistName}`,
//       ];
//       const results = await Promise.all(
//         queries.map((q) => searchSerpApi(q, apiKey))
//       );
//       cards = results.flat();
//     } else {
//       const queries = [
//         `${trackTitle} ${artistName} meaning`,
//         `${trackTitle} ${artistName} interview`,
//         `${trackTitle} ${artistName} review`,
//       ];
//       const results = await Promise.all(
//         queries.map((q) => searchSerpApi(q, apiKey))
//       );
//       cards = results.flat();
//     }

//     // Deduplicate by link
//     const seen = new Set<string>();
//     cards = cards.filter((c) => {
//       if (seen.has(c.link)) return false;
//       seen.add(c.link);
//       return true;
//     });

//     return NextResponse.json({ cards: cards.slice(0, 6) });
//   } catch {
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { fetchMusicContext, fetchArtistContext } from '@/lib/serpapi';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackTitle = searchParams.get('track');
    const artist = searchParams.get('artist');
    const type = searchParams.get('type') || 'track'; // 'track' or 'artist'

    if (!artist) {
      return NextResponse.json(
        { error: 'Artist parameter is required' },
        { status: 400 }
      );
    }

    let context;
    
    if (type === 'artist') {
      context = await fetchArtistContext(artist);
    } else {
      if (!trackTitle) {
        return NextResponse.json(
          { error: 'Track title is required for track context' },
          { status: 400 }
        );
      }
      context = await fetchMusicContext(trackTitle, artist);
    }

    return NextResponse.json(context, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Context API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch context' },
      { status: 500 }
    );
  }
}