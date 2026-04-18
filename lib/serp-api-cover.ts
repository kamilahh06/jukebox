/**
 * Server-only: fetch album cover image URL via SerpAPI Google Images.
 * Used only for the first 20 tracks (by created_at ASC) when cover_url is missing.
 * Never call from client components.
 */

const SERP_API_KEY = process.env.SERPAPI_KEY || process.env.SERP_API_KEY;

export function getSerpApiKey(): string | null {
  return SERP_API_KEY && SERP_API_KEY.trim() !== "" ? SERP_API_KEY.trim() : null;
}

export interface FetchCoverResult {
  url: string | null;
  called: boolean;
  reason?: string;
}

/**
 * Fetch album cover URL for a track using SerpAPI Google Images.
 * Returns the first image result's original URL, or null if none or API unavailable.
 * Logs when SerpAPI is actually called vs skipped.
 */
export async function fetchAlbumCoverUrl(
  artist: string,
  title: string
): Promise<FetchCoverResult> {
  const key = getSerpApiKey();
  if (!key) {
    console.log("[SerpAPI cover] Skipped (no SERPAPI_KEY / SERP_API_KEY)");
    return { url: null, called: false, reason: "no_api_key" };
  }

  const query = `${artist} ${title} album cover`.trim();
  const url = new URL("https://serpapi.com/search");
  url.searchParams.set("engine", "google_images");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", key);

  try {
    console.log(`[SerpAPI cover] Called for: ${artist} – ${title}`);
    const res = await fetch(url.toString(), {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.warn(`[SerpAPI cover] HTTP ${res.status} for: ${artist} – ${title}`);
      return { url: null, called: true, reason: `http_${res.status}` };
    }
    const data = (await res.json()) as {
      images_results?: Array<{ original?: string }>;
      error?: string;
    };
    if (data.error) {
      console.warn(`[SerpAPI cover] API error: ${data.error}`);
      return { url: null, called: true, reason: "api_error" };
    }
    const first = data.images_results?.[0]?.original;
    const imageUrl = typeof first === "string" && first.startsWith("http") ? first : null;
    if (!imageUrl) {
      console.log(`[SerpAPI cover] No image result for: ${artist} – ${title}`);
    }
    return { url: imageUrl, called: true };
  } catch (err) {
    console.warn("[SerpAPI cover] Fetch error:", err);
    return { url: null, called: true, reason: "fetch_error" };
  }
}
