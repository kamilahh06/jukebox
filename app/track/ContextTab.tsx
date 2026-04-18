"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Sparkles, Link2, TrendingUp, Brain, Loader2 } from "lucide-react";

interface SerpSearchResult {
  position: number;
  title: string;
  link: string;
  snippet: string;
  source?: string;
  date?: string;
}

interface SerpKnowledgeGraph {
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

interface SerpRelatedSearch {
  query: string;
  link: string;
}

interface SerpAIOverview {
  text: string;
  sources?: Array<{
    title: string;
    link: string;
  }>;
}

interface SerpMusicContext {
  aiOverview?: SerpAIOverview;
  knowledgeGraph?: SerpKnowledgeGraph;
  organicResults: SerpSearchResult[];
  relatedSearches: SerpRelatedSearch[];
  query: string;
}

interface ContextTabProps {
  trackTitle: string;
  artistName: string;
}

export function ContextTab({ trackTitle, artistName }: ContextTabProps) {
  const [context, setContext] = useState<SerpMusicContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContext() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          track: trackTitle,
          artist: artistName,
          type: 'track',
        });

        const response = await fetch(`/api/context?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to load context');
        }

        const data = await response.json();
        setContext(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadContext();
  }, [trackTitle, artistName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-400" />
          <p className="text-sm text-white/60">Loading context from the web...</p>
        </div>
      </div>
    );
  }

  if (error || !context) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">Failed to load context. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* AI Overview Section */}
      {context.aiOverview && (
        <div
          className="rounded-xl p-6 border transition-all duration-300 hover:shadow-lg"
          style={{
            background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.05), rgba(100, 70, 180, 0.03))',
            borderColor: 'rgba(139, 92, 246, 0.2)',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div
              className="p-2.5 rounded-lg shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(185, 128, 255, 0.1))',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)',
              }}
            >
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">AI Overview</h3>
              {/* <p className="text-xs text-white/50">Powered by SerpAPI</p> */}
            </div>
          </div>
          
          <p className="text-white/80 leading-relaxed mb-4">
            {context.aiOverview.text}
          </p>

          {context.aiOverview.sources && context.aiOverview.sources.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                Sources
              </p>
              <div className="flex flex-wrap gap-2">
                {context.aiOverview.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:scale-105"
                    style={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      color: 'rgba(185, 128, 255, 0.9)',
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="max-w-[200px] truncate">{source.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Knowledge Graph */}
      {context.knowledgeGraph && (
        <div
          className="rounded-xl p-6 border"
          style={{
            background: 'linear-gradient(145deg, rgba(20, 15, 35, 0.6), rgba(10, 8, 20, 0.8))',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          }}
        >
          <div className="flex items-start gap-4">
            {context.knowledgeGraph.thumbnail && (
              <img
                src={context.knowledgeGraph.thumbnail}
                alt={context.knowledgeGraph.title}
                className="w-24 h-24 rounded-lg object-cover shrink-0"
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">
                {context.knowledgeGraph.title}
              </h3>
              {context.knowledgeGraph.type && (
                <p className="text-xs text-purple-400 mb-3 uppercase tracking-wider">
                  {context.knowledgeGraph.type}
                </p>
              )}
              {context.knowledgeGraph.description && (
                <p className="text-white/70 text-sm mb-3 leading-relaxed">
                  {context.knowledgeGraph.description}
                </p>
              )}
              {context.knowledgeGraph.source && (
                <a
                  href={context.knowledgeGraph.source.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                >
                  <span>{context.knowledgeGraph.source.name}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Web Sources */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="p-2 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(91, 234, 214, 0.1), rgba(91, 234, 214, 0.05))',
            }}
          >
            <Link2 className="w-4 h-4 text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Related Articles & Analysis</h3>
        </div>

        <div className="space-y-3">
          {context.organicResults.map((result) => (
            <a
              key={result.position}
              href={result.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl p-4 border transition-all duration-200 hover:scale-[1.02] group"
              style={{
                background: 'linear-gradient(145deg, rgba(20, 15, 35, 0.4), rgba(10, 8, 20, 0.6))',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)',
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="text-white font-semibold leading-tight group-hover:text-cyan-400 transition-colors">
                  {result.title}
                </h4>
                <ExternalLink className="w-4 h-4 text-white/40 shrink-0 group-hover:text-cyan-400 transition-colors" />
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-2">
                {result.snippet}
              </p>
              {result.source && (
                <p className="text-xs text-white/40">
                  {result.source}
                  {result.date && ` · ${result.date}`}
                </p>
              )}
            </a>
          ))}
        </div>
      </div>

      {/* Related Searches */}
      {context.relatedSearches.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-2 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 45, 155, 0.1), rgba(255, 45, 155, 0.05))',
              }}
            >
              <TrendingUp className="w-4 h-4 text-pink-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Related Searches</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {context.relatedSearches.map((search, idx) => (
              <a
                key={idx}
                href={search.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 45, 155, 0.1), rgba(255, 45, 155, 0.05))',
                  border: '1px solid rgba(255, 45, 155, 0.2)',
                  color: 'rgba(255, 185, 215, 0.9)',
                }}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>{search.query}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Powered by badge */}
      <div className="text-center pt-4">
        <p className="text-xs text-white/30">
          Context powered by{' '}
          <a
            href="https://serpapi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            SerpAPI
          </a>
        </p>
      </div>
    </div>
  );
}