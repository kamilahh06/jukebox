/**
 * Advanced SerpAPI Integration
 * Includes video results, news, and image search for comprehensive music context
 */

import type { 
    SerpMusicContext, 
    SerpSearchResult 
  } from './serpapi';
  
  export interface SerpVideoResult {
    position: number;
    title: string;
    link: string;
    thumbnail: string;
    channel: string;
    duration?: string;
    views?: string;
    date?: string;
  }
  
  export interface SerpNewsResult {
    position: number;
    title: string;
    link: string;
    snippet: string;
    source: string;
    date: string;
    thumbnail?: string;
  }
  
  export interface SerpImageResult {
    position: number;
    title: string;
    link: string;
    thumbnail: string;
    source: string;
  }
  
  export interface EnhancedMusicContext extends SerpMusicContext {
    videos?: SerpVideoResult[];
    news?: SerpNewsResult[];
    images?: SerpImageResult[];
  }
  
  /**
   * Fetch video results about the track (performances, covers, interviews)
   */
  export async function fetchTrackVideos(
    trackTitle: string,
    artistName: string
  ): Promise<SerpVideoResult[]> {
    const query = `${trackTitle} ${artistName} official music video live performance`;
    
    const params = new URLSearchParams({
      q: query,
      api_key: process.env.SERP_API_KEY || '',
      engine: 'google_videos',
      num: '8',
    });
  
    try {
      const response = await fetch(`https://serpapi.com/search?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
  
      if (!response.ok) {
        throw new Error(`SerpAPI videos request failed: ${response.status}`);
      }
  
      const data = await response.json();
  
      return (data.video_results || []).slice(0, 8).map((video: any, index: number) => ({
        position: index + 1,
        title: video.title || '',
        link: video.link || '',
        thumbnail: video.thumbnail || '',
        channel: video.channel || video.source || '',
        duration: video.duration || video.length,
        views: video.views,
        date: video.date || video.published_date,
      }));
    } catch (error) {
      console.error('SerpAPI videos fetch error:', error);
      return [];
    }
  }
  
  /**
   * Fetch recent news about the track or artist
   */
  export async function fetchMusicNews(
    trackTitle: string,
    artistName: string
  ): Promise<SerpNewsResult[]> {
    const query = `${artistName} ${trackTitle} news`;
    
    const params = new URLSearchParams({
      q: query,
      api_key: process.env.SERP_API_KEY || '',
      engine: 'google',
      tbm: 'nws', // News tab
      num: '8',
    });
  
    try {
      const response = await fetch(`https://serpapi.com/search?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
  
      if (!response.ok) {
        throw new Error(`SerpAPI news request failed: ${response.status}`);
      }
  
      const data = await response.json();
  
      return (data.news_results || []).slice(0, 6).map((news: any, index: number) => ({
        position: index + 1,
        title: news.title || '',
        link: news.link || '',
        snippet: news.snippet || '',
        source: news.source || '',
        date: news.date || '',
        thumbnail: news.thumbnail,
      }));
    } catch (error) {
      console.error('SerpAPI news fetch error:', error);
      return [];
    }
  }
  
  /**
   * Fetch images related to the track (album art, performances, artist photos)
   */
  export async function fetchTrackImages(
    trackTitle: string,
    artistName: string
  ): Promise<SerpImageResult[]> {
    const query = `${trackTitle} ${artistName} album cover art`;
    
    const params = new URLSearchParams({
      q: query,
      api_key: process.env.SERP_API_KEY || '',
      engine: 'google_images',
      num: '12',
    });
  
    try {
      const response = await fetch(`https://serpapi.com/search?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
  
      if (!response.ok) {
        throw new Error(`SerpAPI images request failed: ${response.status}`);
      }
  
      const data = await response.json();
  
      return (data.images_results || []).slice(0, 12).map((image: any, index: number) => ({
        position: index + 1,
        title: image.title || '',
        link: image.link || '',
        thumbnail: image.thumbnail || '',
        source: image.source || '',
      }));
    } catch (error) {
      console.error('SerpAPI images fetch error:', error);
      return [];
    }
  }
  
  /**
   * Fetch comprehensive enhanced context with all media types
   */
  export async function fetchEnhancedMusicContext(
    trackTitle: string,
    artistName: string
  ): Promise<EnhancedMusicContext> {
    // Import the base context fetcher
    const { fetchMusicContext } = await import('./serpapi');
    
    // Fetch all data in parallel
    const [baseContext, videos, news, images] = await Promise.all([
      fetchMusicContext(trackTitle, artistName),
      fetchTrackVideos(trackTitle, artistName),
      fetchMusicNews(trackTitle, artistName),
      fetchTrackImages(trackTitle, artistName),
    ]);
  
    return {
      ...baseContext,
      videos: videos.length > 0 ? videos : undefined,
      news: news.length > 0 ? news : undefined,
      images: images.length > 0 ? images : undefined,
    };
  }
  
  /**
   * Search for similar songs using SerpAPI
   */
  export async function fetchSimilarSongs(
    trackTitle: string,
    artistName: string
  ): Promise<SerpSearchResult[]> {
    const query = `songs similar to ${trackTitle} by ${artistName} recommendations`;
    
    const params = new URLSearchParams({
      q: query,
      api_key: process.env.SERP_API_KEY || '',
      engine: 'google',
      num: '8',
    });
  
    try {
      const response = await fetch(`https://serpapi.com/search?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
  
      if (!response.ok) {
        throw new Error(`SerpAPI similar songs request failed: ${response.status}`);
      }
  
      const data = await response.json();
  
      return (data.organic_results || []).slice(0, 5).map((result: any, index: number) => ({
        position: index + 1,
        title: result.title || '',
        link: result.link || '',
        snippet: result.snippet || '',
        source: result.source,
      }));
    } catch (error) {
      console.error('SerpAPI similar songs fetch error:', error);
      return [];
    }
  }