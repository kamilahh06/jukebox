"use client";

import { useMemo, useState } from "react";

const LYRICS: string[] = [
  "You could be my favorite night.",
  "Neon lights and blurry goodbyes.",
  "I fell in love with the feedback.",
  "We’re dancing on a dead channel.",
  "Static kisses in a midnight car.",
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function Y2KStarfield() {
  const [collected, setCollected] = useState<Set<string>>(() => new Set());
  const [lyric, setLyric] = useState<string | null>(null);

  // Fewer stars + cheaper styles (no per-star filters)
  const twinkles = useMemo(() => {
    return Array.from({ length: 140 }).map((_, i) => {
      const bright = Math.random() < 0.22;
      return {
        id: `tw-${i}`,
        left: rand(0, 100),
        top: rand(0, 100),
        size: bright ? rand(1.8, 3.0) : rand(1.1, 2.2),
        dur: bright ? rand(1.6, 2.8) : rand(2.2, 4.2),
        delay: rand(0, 3),
        opacity: bright ? rand(0.6, 0.95) : rand(0.25, 0.7),
        glow: bright ? rand(8, 16) : rand(4, 10),
      };
    });
  }, []);

  // Smaller clickable twinkles
  const clickable = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => ({
      id: `click-${i}-${Math.random().toString(16).slice(2)}`,
      left: rand(10, 90),
      top: rand(14, 86),
      size: rand(12, 18),     // ✅ much smaller
      drift: rand(6, 10),     // slower = less CPU churn
      delay: rand(0, 2),
    }));
  }, []);

  const pickLyric = () => LYRICS[Math.floor(Math.random() * LYRICS.length)];

  const handleClick = (id: string) => {
    setCollected((prev) => new Set(prev).add(id));
    setLyric(pickLyric());
  };

  const closeLyric = () => setLyric(null);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* dark y2k bg */}
      <div className="absolute inset-0 pointer-events-none y2k-space-bg-lite" />

      {/* background twinkles */}
      <div className="absolute inset-0 pointer-events-none">
        {twinkles.map((t) => (
          <span
            key={t.id}
            className="y2k-twinkle-lite"
            style={{
              left: `${t.left}%`,
              top: `${t.top}%`,
              width: `${t.size}px`,
              height: `${t.size}px`,
              opacity: t.opacity as any,
              boxShadow: `0 0 ${t.glow}px rgba(220,180,255,0.55)`,
              animationDuration: `${t.dur}s`,
              animationDelay: `${t.delay}s`,
            }}
          />
        ))}
      </div>

      {/* clickable stars */}
      {/* <div className="absolute inset-0">
        {clickable.map((s) => {
          const gone = collected.has(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleClick(s.id)}
              aria-label="Reveal a lyric"
              className={`absolute y2k-click-twinkle ${gone ? "is-gone" : ""}`}
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                transform: "translate(-50%, -50%)",
                animation: `click-float ${s.drift}s ease-in-out ${s.delay}s infinite`,
              }}
            />
          );
        })}
      </div> */}

      {/* Lyric modal: close with X or outside click */}
      {lyric ? (
        <div className="fixed inset-0 z-20 pointer-events-auto" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/55" onClick={closeLyric} />

          <div className="absolute left-1/2 top-10 w-[min(92vw,560px)] -translate-x-1/2">
            <div className="y2k-lyric-pop" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm md:text-base text-foreground/95 leading-relaxed">{lyric}</p>

                <button
                  type="button"
                  onClick={closeLyric}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground/80 hover:text-foreground hover:bg-white/10"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3 groove-line" />
              <p className="mt-2 text-[10px] tracking-[0.25em] text-muted-foreground">
                FIND MORE STARS
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}