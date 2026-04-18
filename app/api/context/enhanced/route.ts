import { NextRequest, NextResponse } from 'next/server';
import { fetchEnhancedMusicContext } from '@/lib/serpapi-advanced';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackTitle = searchParams.get('track');
    const artist = searchParams.get('artist');

    if (!trackTitle || !artist) {
      return NextResponse.json(
        { error: 'Both track and artist parameters are required' },
        { status: 400 }
      );
    }

    // Fetch enhanced context with videos, news, and images
    const context = await fetchEnhancedMusicContext(trackTitle, artist);

    return NextResponse.json(context, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Enhanced context API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enhanced context' },
      { status: 500 }
    );
  }
}