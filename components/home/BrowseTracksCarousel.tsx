"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";

export type BrowseTrack = {
  id: string;
  title: string;
  artist: string;
  cover_url?: string | null;
  average_rating?: number | null;
  total_ratings?: number | null;
};

const GAP = 12;

function safeNum(value: unknown): string {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return String(n);
}
function safeRating(value: unknown): string {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return n.toFixed(1);
}

export function BrowseTracksCarousel({ tracks }: { tracks: BrowseTrack[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(200);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateCardWidth = () => {
    const el = scrollRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const totalGap = GAP * (5 - 1);
    setCardWidth(Math.max(140, (w - totalGap) / 5));
  };

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  };

  useEffect(() => {
    updateCardWidth();
    const ro = new ResizeObserver(updateCardWidth);
    if (scrollRef.current) ro.observe(scrollRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [tracks.length]);

  const scrollByOne = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const step = cardWidth + GAP;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const list = tracks?.length ? tracks : [];

  return (
    <div className="browse-carousel">
      <div className="browse-carousel-header">
        <h2 className="browse-carousel-title">BROWSE TRACKS</h2>
        <div className="browse-carousel-barcode" aria-hidden />
      </div>

      <div className="browse-carousel-nav-wrap">
        <button
          type="button"
          onClick={() => scrollByOne(-1)}
          disabled={!canScrollLeft}
          className="browse-carousel-arrow"
          aria-label="Scroll left"
        >
          ‹
        </button>
        <div
          ref={scrollRef}
          className="browse-carousel-scroll"
          onScroll={updateScrollState}
        >
          <div
            className="browse-carousel-inner"
            style={{ ["--browse-card-w" as string]: `${cardWidth}px` }}
          >
            {list.length === 0 ? (
              <p className="browse-carousel-empty">No tracks to show</p>
            ) : (
            list.map((track) => (
              <Link
                key={track.id}
                href={`/track/${track.id}`}
                className="browse-carousel-card"
              >
                <div className="browse-carousel-cover">
                  {track.cover_url && String(track.cover_url).trim() ? (
                    <img
                      src={String(track.cover_url)}
                      alt=""
                      width={cardWidth - 2}
                      height={cardWidth - 2}
                      className="browse-carousel-cover-img"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="browse-carousel-cover-placeholder" />
                  )}
                </div>
                <p className="browse-carousel-song truncate" title={track.title ?? ""}>
                  {track.title && String(track.title).trim() ? track.title : "—"}
                </p>
                <p className="browse-carousel-artist truncate" title={track.artist ?? ""}>
                  {track.artist && String(track.artist).trim() ? track.artist : "—"}
                </p>
                <div className="browse-carousel-meta">
                  <span className="browse-carousel-rating">
                    ★ {safeRating(track.average_rating)}
                  </span>
                  <span className="browse-carousel-reviews">
                    {safeNum(track.total_ratings)} reviews
                  </span>
                </div>
              </Link>
            )))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => scrollByOne(1)}
          disabled={!canScrollRight}
          className="browse-carousel-arrow"
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </div>
  );
}
