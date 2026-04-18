"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { TrackCard } from "@/components/track-card";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Disc3, SlidersHorizontal, X } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string | null;
  cover_url?: string | null;
  album_art_url?: string | null;
  genre?: string | null;
  tags?: string[] | null;
  average_rating: number;
  total_ratings: number;
}

const SORT_OPTIONS = [
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
  { value: "most_rated", label: "Most Rated" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

const STAR_OPTIONS = [0, 1, 2, 3, 4] as const;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const [sort, setSort] = useState<SortOption>("rating");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("tracks")
      .select("*")
      .order("average_rating", { ascending: false })
      .then(({ data }) => {
        setAllTracks(data ?? []);
        setLoading(false);
      });
  }, []);

  // Collect unique genres from tracks
  const availableGenres = useMemo(() => {
    const seen = new Set<string>();
    for (const t of allTracks) {
      const g = t.genre || (Array.isArray(t.tags) && t.tags[0]) || null;
      if (g) seen.add(g);
    }
    return Array.from(seen).sort();
  }, [allTracks]);

  const filtered = useMemo(() => {
    let result = [...allTracks];

    // Text search
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          (t.genre && t.genre.toLowerCase().includes(q)) ||
          (Array.isArray(t.tags) && t.tags.some((tag) => tag.toLowerCase().includes(q))) ||
          (t.album && t.album.toLowerCase().includes(q))
      );
    }

    // Genre filter
    if (activeGenre) {
      result = result.filter((t) => {
        const g = t.genre || (Array.isArray(t.tags) && t.tags[0]) || null;
        return g === activeGenre;
      });
    }

    // Min rating filter
    if (minRating > 0) {
      result = result.filter((t) => Number(t.average_rating ?? 0) >= minRating);
    }

    // Sort
    if (sort === "rating") {
      result.sort((a, b) => Number(b.average_rating ?? 0) - Number(a.average_rating ?? 0));
    } else if (sort === "most_rated") {
      result.sort((a, b) => Number(b.total_ratings ?? 0) - Number(a.total_ratings ?? 0));
    }
    // "newest" keeps original DB order (insert order, already desc from query)

    return result;
  }, [allTracks, query, activeGenre, minRating, sort]);

  const hasActiveFilters = activeGenre !== null || minRating > 0 || sort !== "rating";

  const clearFilters = useCallback(() => {
    setActiveGenre(null);
    setMinRating(0);
    setSort("rating");
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <span className="glow-chip mb-3 inline-block">SEARCH</span>
        <h1 className="font-display text-3xl text-foreground font-bold tracking-wider">
          FIND TRACKS
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search by title, artist, album, or genre
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6 max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tracks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-secondary/40 border-border/30 text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:shadow-[0_0_12px_rgba(91,234,214,0.15)] transition-all duration-200"
        />
      </div>

      {/* Filters row */}
      <div className="glass rounded-xl p-4 border border-border/30 mb-6 space-y-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary shrink-0" />
          <span className="text-xs font-medium text-foreground tracking-widest">FILTERS</span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          )}
        </div>

        {/* Genre pills */}
        {availableGenres.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground tracking-widest mb-2">GENRE</p>
            <div className="flex flex-wrap gap-2">
              {availableGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setActiveGenre(activeGenre === genre ? null : genre)}
                  className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-all duration-200 border ${
                    activeGenre === genre
                      ? "holo-gradient text-background border-transparent neon-glow-cyan"
                      : "glass border-border/30 text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-6">
          {/* Min rating */}
          <div>
            <p className="text-[10px] text-muted-foreground tracking-widest mb-2">MIN RATING</p>
            <div className="flex gap-1">
              {STAR_OPTIONS.map((val) => (
                <button
                  key={val}
                  onClick={() => setMinRating(val === minRating ? 0 : val)}
                  className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-all duration-200 border ${
                    minRating === val && val > 0
                      ? "holo-gradient text-background border-transparent neon-glow-cyan"
                      : "glass border-border/30 text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  {val === 0 ? "Any" : `${val}★+`}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <p className="text-[10px] text-muted-foreground tracking-widest mb-2">SORT BY</p>
            <div className="flex gap-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-all duration-200 border ${
                    sort === opt.value
                      ? "holo-gradient text-background border-transparent neon-glow-cyan"
                      : "glass border-border/30 text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-xs text-muted-foreground tracking-wide mb-4">
          {filtered.length} track{filtered.length !== 1 ? "s" : ""}
          {hasActiveFilters || query ? " matching filters" : ""}
        </p>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">Loading tracks...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center border border-border/30">
          <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Disc3 className="h-7 w-7 text-primary" />
          </div>
          <p className="text-muted-foreground mb-3">
            {query || hasActiveFilters
              ? "No tracks match your filters"
              : "No tracks available"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-primary hover:underline tracking-wide"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((track, i) => (
            <TrackCard
              key={track.id}
              id={track.id}
              title={track.title}
              artist={track.artist}
              album={track.album}
              albumArtUrl={track.cover_url || track.album_art_url}
              genre={track.genre || (Array.isArray(track.tags) && track.tags[0]) || null}
              averageRating={track.average_rating ?? 0}
              totalRatings={track.total_ratings ?? 0}
              rank={!query && !hasActiveFilters ? i + 1 : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
