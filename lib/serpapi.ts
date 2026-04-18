/**
 * SerpAPI Integration for Music Context
 * Fetches AI-powered context, related searches, and knowledge graph data
 */

export interface SerpSearchResult {
    position: number;
    title: string;
    link: string;
    snippet: string;
    source?: string;
    date?: string;
  }
  
  export interface SerpKnowledgeGraph {
    title?: string;
    type?: string;
    description?: string;
    source?: {
      name: string;
      link: string;
    };
    thumbnail?: string;
    attributes?: Record<string, string>;
  }
  
  export interface SerpRelatedSearch {
    query: string;
    link: string;
  }
  
  export interface SerpAIOverview {
    text: string;
    sources?: Array<{
      title: string;
      link: string;
    }>;
  }
  
  export interface SerpMusicContext {
    aiOverview?: SerpAIOverview;
    knowledgeGraph?: SerpKnowledgeGraph;
    organicResults: SerpSearchResult[];
    relatedSearches: SerpRelatedSearch[];
    query: string;
  }

  function toPlainText(v: any): string {
    if (typeof v === "string") return v;
    if (v == null) return "";
    if (Array.isArray(v)) return v.map(toPlainText).filter(Boolean).join("\n\n");
    if (typeof v === "object") {
      // common shapes
      if ("text" in v) return toPlainText((v as any).text);
      if ("snippet" in v) return toPlainText((v as any).snippet);
      // fallback
      return JSON.stringify(v);
    }
    return String(v);
  }
  
  /**
   * Fetch comprehensive music context using SerpAPI
   */
  export async function fetchMusicContext(
    trackTitle: string,
    artistName: string
  ): Promise<SerpMusicContext> {
    const query = `${trackTitle} ${artistName} song meaning lyrics analysis`;
    
    const params = new URLSearchParams({
      q: query,
      api_key: process.env.SERP_API_KEY || '',
      engine: 'google',
      num: '10',
      gl: 'us',
      hl: 'en',
    });
  
    try {
      const response = await fetch(`https://serpapi.com/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Fresh data for each request
      });
  
    //   if (!response.ok) {
    //     throw new Error(`SerpAPI request failed: ${response.status}`);
        //   }
        if (!response.ok) {
            let msg = `Request failed (${response.status})`;
            try {
              const body = await response.json();
              msg = body?.error ?? msg;
            } catch {}
            throw new Error(msg);
          }
  
      const data = await response.json();
  
      // Extract AI Overview (Google's AI-generated summary)
    //   const aiOverview = data.ai_overview ? {
    //     text: data.ai_overview.text || data.ai_overview,
    //     sources: data.ai_overview.sources || [],
        //   } : undefined;
        const aiOverview = data.ai_overview
        ? {
            text: toPlainText(data.ai_overview.text ?? data.ai_overview),
            sources: Array.isArray(data.ai_overview.sources) ? data.ai_overview.sources : [],
            }
        : undefined;
  
      // Extract Knowledge Graph
      const knowledgeGraph = data.knowledge_graph ? {
        title: data.knowledge_graph.title,
        type: data.knowledge_graph.type,
        description: data.knowledge_graph.description,
        source: data.knowledge_graph.source,
        thumbnail: data.knowledge_graph.thumbnail,
        attributes: data.knowledge_graph.attributes || {},
      } : undefined;
  
      // Extract organic search results
      const organicResults: SerpSearchResult[] = (data.organic_results || [])
        .slice(0, 8)
        .map((result: any, index: number) => ({
          position: index + 1,
          title: result.title || '',
          link: result.link || '',
          snippet: result.snippet || '',
          source: result.source,
          date: result.date,
        }));
  
      // Extract related searches
      const relatedSearches: SerpRelatedSearch[] = (data.related_searches || [])
        .slice(0, 6)
        .map((search: any) => ({
          query: search.query || '',
          link: search.link || '',
        }));
  
      return {
        aiOverview,
        knowledgeGraph,
        organicResults,
        relatedSearches,
        query,
      };
    } catch (error) {
      console.error('SerpAPI fetch error:', error);
      
      // Return empty context on error
      return {
        organicResults: [],
        relatedSearches: [],
        query,
      };
    }
  }
  
  /**
   * Fetch artist context using SerpAPI
   */
  export async function fetchArtistContext(artistName: string): Promise<SerpMusicContext> {
    const query = `${artistName} artist biography discography`;
    
    const params = new URLSearchParams({
      q: query,
      api_key: process.env.SERP_API_KEY || '',
      engine: 'google',
      num: '8',
      gl: 'us',
      hl: 'en',
    });
  
    try {
      const response = await fetch(`https://serpapi.com/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
  
      if (!response.ok) {
        throw new Error(`SerpAPI request failed: ${response.status}`);
      }
  
      const data = await response.json();
  
    //   const aiOverview = data.ai_overview ? {
    //     text: data.ai_overview.text || data.ai_overview,
    //     sources: data.ai_overview.sources || [],
        //   } : undefined;
        const aiOverview = data.ai_overview
        ? {
            text: toPlainText(data.ai_overview.text ?? data.ai_overview),
            sources: Array.isArray(data.ai_overview.sources) ? data.ai_overview.sources : [],
            }
        : undefined;
  
      const knowledgeGraph = data.knowledge_graph ? {
        title: data.knowledge_graph.title,
        type: data.knowledge_graph.type,
        description: data.knowledge_graph.description,
        source: data.knowledge_graph.source,
        thumbnail: data.knowledge_graph.thumbnail,
        attributes: data.knowledge_graph.attributes || {},
      } : undefined;
  
      const organicResults: SerpSearchResult[] = (data.organic_results || [])
        .slice(0, 6)
        .map((result: any, index: number) => ({
          position: index + 1,
          title: result.title || '',
          link: result.link || '',
          snippet: result.snippet || '',
          source: result.source,
          date: result.date,
        }));
  
      const relatedSearches: SerpRelatedSearch[] = (data.related_searches || [])
        .slice(0, 4)
        .map((search: any) => ({
          query: search.query || '',
          link: search.link || '',
        }));
  
      return {
        aiOverview,
        knowledgeGraph,
        organicResults,
        relatedSearches,
        query,
      };
    } catch (error) {
      console.error('SerpAPI artist fetch error:', error);
      
      return {
        organicResults: [],
        relatedSearches: [],
        query,
      };
    }
  }