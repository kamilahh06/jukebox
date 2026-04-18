"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Loader2, Search, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContextCard {
  title: string;
  snippet: string;
  link: string;
  source: string;
}

interface ContextSectionProps {
  trackTitle: string;
  artistName: string;
}

export function ContextSection({ trackTitle, artistName }: ContextSectionProps) {
  const [cards, setCards] = useState<ContextCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  // const fetchContext = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await fetch("/api/context", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ mode: "track", trackTitle, artistName }),
  //     });
  //     const data = await res.json();
  //     setCards(data.cards || []);
  //     setIsDemo(data.demo === true);
  //     setFetched(true);
  //   } catch {
  //     setCards([]);
  //     setFetched(true);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchContext = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        track: trackTitle,
        artist: artistName,
        type: "track",
      });
  
      const res = await fetch(`/api/context?${params.toString()}`, { method: "GET" });
  
      // IMPORTANT: surface errors instead of silently failing
      if (!res.ok) {
        const text = await res.text();
        console.error("Context API failed:", res.status, text);
        setCards([]);
        setFetched(true);
        return;
      }
  
      const data = await res.json();
  
      // Map SerpMusicContext.organicResults -> ContextCard[]
      const mapped: ContextCard[] = (data.organicResults ?? []).map((r: any) => ({
        title: r.title ?? "",
        snippet: r.snippet ?? "",
        link: r.link ?? "",
        source: r.source ?? "Web",
      }));
  
      setCards(mapped);
      setIsDemo(false); // your current GET route doesn’t return demo mode
      setFetched(true);
    } catch (e) {
      console.error("Context fetch error:", e);
      setCards([]);
      setFetched(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContext();
  }, [trackTitle, artistName]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <div className="absolute inset-0 h-8 w-8 rounded-full neon-glow-cyan opacity-40 animate-pulse" />
        </div>
        <p className="text-sm text-muted-foreground mt-4">Searching for context...</p>
      </div>
    );
  }

  if (fetched && cards.length === 0) {
    return (
      <div className="glass rounded-xl p-10 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-secondary/60 mb-4">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground mb-4">No context cards found for this track.</p>
        <Button
          onClick={fetchContext}
          variant="outline"
          size="sm"
          className="border-border text-foreground hover:bg-secondary btn-press bg-transparent"
        >
          Retry Search
        </Button>
      </div>
    );
  }

  return (
    <div>
      {isDemo && (
        <div className="flex items-center gap-2 rounded-lg bg-accent/8 border border-accent/20 px-4 py-3 mb-5">
          <Info className="h-4 w-4 text-accent shrink-0" />
          <p className="text-xs text-accent">
            Showing sample context cards. Add a SERPAPI_KEY environment variable for live web search results.
          </p>
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => {
          const isRealLink = card.link && !card.link.includes("example.com");
          const CardWrapper = isRealLink ? "a" : "div";
          const linkProps = isRealLink
            ? { href: card.link, target: "_blank" as const, rel: "noopener noreferrer" }
            : {};
          return (
            <CardWrapper
              key={i}
              {...linkProps}
              className="glass rounded-xl p-5 transition-all duration-300 group block card-tilt hover:border-primary/15"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {card.title}
                </h4>
                {isRealLink && (
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                {card.snippet}
              </p>
              <span className="glow-chip text-[10px]">{card.source}</span>
            </CardWrapper>
          );
        })}
      </div>
      {/* {!isDemo && (
        <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-muted-foreground/50">
          <Search className="h-3 w-3" />
          Powered by SerpApi
        </div>
      )} */}
    </div>
  );
}
