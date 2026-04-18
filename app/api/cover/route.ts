import { NextRequest } from "next/server";

/**
 * Deterministic placeholder cover image for tracks (e.g. from Kaggle seed).
 * GET /api/cover?h=xxx returns an SVG gradient; h is a hash from title+artist.
 */
export async function GET(request: NextRequest) {
  const h = request.nextUrl.searchParams.get("h") || "0";
  let seed = 0;
  for (let i = 0; i < h.length; i++) seed = (seed * 31 + h.charCodeAt(i)) >>> 0;
  const hue = Math.abs(seed % 360);
  const hue2 = (hue + 120) % 360;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:hsl(${hue},60%,25%)"/>
      <stop offset="100%" style="stop-color:hsl(${hue2},50%,15%)"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#g)"/>
</svg>`;
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
