// "use client";

// import Image from "next/image";
// import star1 from "@/components/canva/star1.png";
// import star3 from "@/components/canva/star3.png";
// import star4 from "@/components/canva/star4.png";
// import star5 from "@/components/canva/star5.png";
// import star6 from "@/components/canva/star6.png";

// const starImages = [star1, star3, star4, star5, star6];

// /** 16 twinkling stars: position [left%, top%], size (px), delay (s), duration (s) */
// const STAR_PLACES: Array<{ left: number; top: number; size: number; delay: number; duration: number }> = [
//   { left: 8, top: 12, size: 24, delay: 0, duration: 3 },
//   { left: 22, top: 8, size: 18, delay: 0.4, duration: 4 },
//   { left: 45, top: 15, size: 28, delay: 0.8, duration: 3.5 },
//   { left: 68, top: 10, size: 20, delay: 0.2, duration: 5 },
//   { left: 85, top: 18, size: 22, delay: 0.6, duration: 3.2 },
//   { left: 12, top: 35, size: 16, delay: 0.3, duration: 4.5 },
//   { left: 78, top: 32, size: 26, delay: 0.7, duration: 3.8 },
//   { left: 35, top: 48, size: 20, delay: 0.1, duration: 4 },
//   { left: 92, top: 45, size: 18, delay: 0.5, duration: 3.6 },
//   { left: 5, top: 62, size: 22, delay: 0.9, duration: 4.2 },
//   { left: 55, top: 58, size: 24, delay: 0.25, duration: 3.3 },
//   { left: 28, top: 72, size: 18, delay: 0.55, duration: 4.8 },
//   { left: 72, top: 78, size: 20, delay: 0.15, duration: 3.4 },
//   { left: 15, top: 88, size: 26, delay: 0.65, duration: 4.1 },
//   { left: 88, top: 85, size: 18, delay: 0.35, duration: 3.9 },
//   { left: 50, top: 92, size: 22, delay: 0.75, duration: 4.4 },
// ];

// export function GalaxyBackground({
//   scanlines = true,
// }: {
//   /** Show subtle scanlines overlay (default true) */
//   scanlines?: boolean;
// }) {
//   return (
//     <div
//       className="y2k-galaxy-root"
//       aria-hidden
//       style={{
//         position: "fixed",
//         inset: 0,
//         zIndex: -1,
//         pointerEvents: "none",
//         overflow: "hidden",
//       }}
//     >
//       {/* Base + vignette */}
//       <div
//         className="y2k-galaxy-base"
//         style={{
//           position: "absolute",
//           inset: 0,
//           background: "#05040a",
//         }}
//       />
//       <div
//         className="y2k-galaxy-vignette"
//         style={{
//           position: "absolute",
//           inset: 0,
//           background: `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(88, 28, 135, 0.25) 100%),
//             radial-gradient(ellipse 100% 100% at 0% 0%, transparent 50%, rgba(49, 0, 82, 0.2) 100%),
//             radial-gradient(ellipse 100% 100% at 100% 0%, transparent 50%, rgba(49, 0, 82, 0.2) 100%),
//             radial-gradient(ellipse 100% 100% at 0% 100%, transparent 50%, rgba(49, 0, 82, 0.2) 100%),
//             radial-gradient(ellipse 100% 100% at 100% 100%, transparent 50%, rgba(49, 0, 82, 0.2) 100%)`,
//         }}
//       />

//       {/* Starfield layers (CSS radial-gradients, moving slightly) */}
//       <div
//         className="y2k-galaxy-starfield y2k-galaxy-starfield-1"
//         style={{
//           position: "absolute",
//           inset: 0,
//           backgroundImage: `
//             radial-gradient(1.5px 1.5px at 15% 20%, rgba(255,255,255,0.6) 0%, transparent 100%),
//             radial-gradient(1px 1px at 40% 35%, rgba(255,255,255,0.5) 0%, transparent 100%),
//             radial-gradient(2px 2px at 70% 15%, rgba(255,255,255,0.45) 0%, transparent 100%),
//             radial-gradient(1px 1px at 85% 50%, rgba(255,255,255,0.55) 0%, transparent 100%),
//             radial-gradient(1.5px 1.5px at 25% 70%, rgba(255,255,255,0.4) 0%, transparent 100%),
//             radial-gradient(1px 1px at 55% 85%, rgba(255,255,255,0.5) 0%, transparent 100%),
//             radial-gradient(1px 1px at 10% 45%, rgba(255,255,255,0.45) 0%, transparent 100%),
//             radial-gradient(1.5px 1.5px at 90% 75%, rgba(255,255,255,0.4) 0%, transparent 100%)
//           `,
//           backgroundSize: "100% 100%",
//         }}
//       />
//       <div
//         className="y2k-galaxy-starfield y2k-galaxy-starfield-2"
//         style={{
//           position: "absolute",
//           inset: 0,
//           backgroundImage: `
//             radial-gradient(1px 1px at 30% 10%, rgba(255,255,255,0.35) 0%, transparent 100%),
//             radial-gradient(1.5px 1.5px at 60% 40%, rgba(255,255,255,0.3) 0%, transparent 100%),
//             radial-gradient(1px 1px at 18% 60%, rgba(255,255,255,0.4) 0%, transparent 100%),
//             radial-gradient(1px 1px at 75% 25%, rgba(255,255,255,0.35) 0%, transparent 100%),
//             radial-gradient(1.5px 1.5px at 95% 65%, rgba(255,255,255,0.3) 0%, transparent 100%),
//             radial-gradient(1px 1px at 50% 95%, rgba(255,255,255,0.35) 0%, transparent 100%)
//           `,
//           backgroundSize: "120% 120%",
//           backgroundPosition: "0% 0%",
//         }}
//       />
//       <div
//         className="y2k-galaxy-starfield y2k-galaxy-starfield-3"
//         style={{
//           position: "absolute",
//           inset: 0,
//           backgroundImage: `
//             radial-gradient(1px 1px at 5% 80%, rgba(255,255,255,0.25) 0%, transparent 100%),
//             radial-gradient(1px 1px at 80% 5%, rgba(255,255,255,0.25) 0%, transparent 100%),
//             radial-gradient(1px 1px at 42% 52%, rgba(255,255,255,0.2) 0%, transparent 100%),
//             radial-gradient(1px 1px at 65% 88%, rgba(255,255,255,0.22) 0%, transparent 100%),
//             radial-gradient(1px 1px at 12% 28%, rgba(255,255,255,0.2) 0%, transparent 100%)
//           `,
//           backgroundSize: "110% 110%",
//           backgroundPosition: "50% 50%",
//         }}
//       />

//       {/* Grain overlay */}
//       <div
//         className="y2k-galaxy-grain"
//         style={{
//           position: "absolute",
//           inset: 0,
//           backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
//           backgroundRepeat: "repeat",
//           backgroundSize: "256px 256px",
//           opacity: 0.06,
//         }}
//       />

//       {/* Optional scanlines */}
//       {scanlines && <div className="y2k-galaxy-scanlines" />}

//       {/* Twinkling PNG stars */}
//       {STAR_PLACES.map((place, i) => {
//         const src = starImages[i % starImages.length];
//         return (
//           <div
//             key={i}
//             className="y2k-galaxy-twinkle-star"
//             style={{
//               position: "absolute",
//               left: `${place.left}%`,
//               top: `${place.top}%`,
//               width: place.size,
//               height: place.size,
//               animationDelay: `${place.delay}s`,
//               animationDuration: `${place.duration}s`,
//             }}
//           >
//             <Image
//               src={src}
//               alt=""
//               width={place.size}
//               height={place.size}
//               className="y2k-galaxy-star-img"
//               unoptimized
//             />
//           </div>
//         );
//       })}
//     </div>
//   );
// }

"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import star1 from "@/components/canva/star1.png";
import star3 from "@/components/canva/star3.png";
import star4 from "@/components/canva/star4.png";
import star5 from "@/components/canva/star5.png";
import star6 from "@/components/canva/star6.png";

const starImages = [star1, star3, star4, star5, star6];

/** 30 twinkling stars with varied positions, sizes, and timings */
const STAR_PLACES: Array<{
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
}> = [
  { left: 8, top: 12, size: 24, delay: 0, duration: 3 },
  { left: 22, top: 8, size: 18, delay: 0.4, duration: 4 },
  { left: 45, top: 15, size: 28, delay: 0.8, duration: 3.5 },
  { left: 68, top: 10, size: 20, delay: 0.2, duration: 5 },
  { left: 85, top: 18, size: 22, delay: 0.6, duration: 3.2 },
  { left: 12, top: 35, size: 16, delay: 0.3, duration: 4.5 },
  { left: 78, top: 32, size: 26, delay: 0.7, duration: 3.8 },
  { left: 35, top: 48, size: 20, delay: 0.1, duration: 4 },
  { left: 92, top: 45, size: 18, delay: 0.5, duration: 3.6 },
  { left: 5, top: 62, size: 22, delay: 0.9, duration: 4.2 },
  { left: 55, top: 58, size: 24, delay: 0.25, duration: 3.3 },
  { left: 28, top: 72, size: 18, delay: 0.55, duration: 4.8 },
  { left: 72, top: 78, size: 20, delay: 0.15, duration: 3.4 },
  { left: 15, top: 88, size: 26, delay: 0.65, duration: 4.1 },
  { left: 88, top: 85, size: 18, delay: 0.35, duration: 3.9 },
  { left: 50, top: 92, size: 22, delay: 0.75, duration: 4.4 },
  { left: 18, top: 25, size: 20, delay: 1.0, duration: 3.7 },
  { left: 63, top: 22, size: 16, delay: 0.45, duration: 4.3 },
  { left: 40, top: 5, size: 24, delay: 0.85, duration: 3.1 },
  { left: 95, top: 28, size: 18, delay: 0.35, duration: 4.6 },
  { left: 10, top: 50, size: 22, delay: 0.6, duration: 3.9 },
  { left: 75, top: 55, size: 20, delay: 0.2, duration: 4.2 },
  { left: 32, top: 68, size: 26, delay: 0.8, duration: 3.5 },
  { left: 58, top: 78, size: 18, delay: 0.4, duration: 4.7 },
  { left: 82, top: 65, size: 24, delay: 0.95, duration: 3.3 },
  { left: 25, top: 42, size: 16, delay: 0.15, duration: 4.9 },
  { left: 48, top: 32, size: 20, delay: 0.7, duration: 3.8 },
  { left: 70, top: 8, size: 22, delay: 0.5, duration: 4.1 },
  { left: 3, top: 75, size: 18, delay: 0.3, duration: 3.6 },
  { left: 90, top: 95, size: 24, delay: 0.9, duration: 4.4 },
];

export function GalaxyBackground({
  scanlines = true,
}: {
  scanlines?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouse = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      container.style.setProperty("--mx", `${x * 15}px`);
      container.style.setProperty("--my", `${y * 15}px`);
    };

    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div
      ref={containerRef}
      className="y2k-galaxy-root"
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        overflow: "hidden",
        "--mx": "0px",
        "--my": "0px",
      } as React.CSSProperties}
    >
      {/* Deep purple base */}
      <div
        className="y2k-galaxy-base"
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(165deg, #0a0410 0%, #1a0a2e 25%, #16213e 50%, #1a0a2e 75%, #0d0221 100%)",
        }}
      />

      {/* Purple vignette (no greens) */}
      <div
        className="y2k-galaxy-vignette"
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(88, 28, 135, 0.3) 100%),
            radial-gradient(ellipse 100% 100% at 0% 0%, transparent 50%, rgba(49, 0, 82, 0.25) 100%),
            radial-gradient(ellipse 100% 100% at 100% 0%, transparent 50%, rgba(49, 0, 82, 0.25) 100%),
            radial-gradient(ellipse 100% 100% at 0% 100%, transparent 50%, rgba(49, 0, 82, 0.25) 100%),
            radial-gradient(ellipse 100% 100% at 100% 100%, transparent 50%, rgba(49, 0, 82, 0.25) 100%)`,
        }}
      />

      {/* Starfield layers with parallax */}
      <div
        className="y2k-galaxy-starfield y2k-galaxy-starfield-1"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(1.5px 1.5px at 15% 20%, rgba(255,255,255,0.7) 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 35%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(2px 2px at 70% 15%, rgba(255,255,255,0.55) 0%, transparent 100%),
            radial-gradient(1px 1px at 85% 50%, rgba(255,255,255,0.65) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 25% 70%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 85%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 10% 45%, rgba(255,255,255,0.55) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 90% 75%, rgba(255,255,255,0.5) 0%, transparent 100%)
          `,
          backgroundSize: "100% 100%",
          transform: `translate(calc(var(--mx) * 0.5), calc(var(--my) * 0.5))`,
          transition: "transform 0.3s ease-out",
        }}
      />
      <div
        className="y2k-galaxy-starfield y2k-galaxy-starfield-2"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(1px 1px at 30% 10%, rgba(255,255,255,0.45) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 60% 40%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 18% 60%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 75% 25%, rgba(255,255,255,0.45) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 95% 65%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 95%, rgba(255,255,255,0.45) 0%, transparent 100%)
          `,
          backgroundSize: "120% 120%",
          backgroundPosition: "0% 0%",
          transform: `translate(calc(var(--mx) * 0.8), calc(var(--my) * 0.8))`,
          transition: "transform 0.3s ease-out",
        }}
      />
      <div
        className="y2k-galaxy-starfield y2k-galaxy-starfield-3"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(1px 1px at 5% 80%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 5%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 42% 52%, rgba(255,255,255,0.25) 0%, transparent 100%),
            radial-gradient(1px 1px at 65% 88%, rgba(255,255,255,0.28) 0%, transparent 100%),
            radial-gradient(1px 1px at 12% 28%, rgba(255,255,255,0.25) 0%, transparent 100%)
          `,
          backgroundSize: "110% 110%",
          backgroundPosition: "50% 50%",
          transform: `translate(var(--mx), var(--my))`,
          transition: "transform 0.3s ease-out",
        }}
      />

      {/* Grain overlay */}
      <div
        className="y2k-galaxy-grain"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
          opacity: 0.08,
        }}
      />

      {/* Scanlines */}
      {scanlines && <div className="y2k-galaxy-scanlines" />}

      {/* Twinkling PNG stars with parallax */}
      {STAR_PLACES.map((place, i) => {
        const src = starImages[i % starImages.length];
        return (
          <div
            key={i}
            className="y2k-galaxy-twinkle-star"
            style={{
              position: "absolute",
              left: `${place.left}%`,
              top: `${place.top}%`,
              width: place.size,
              height: place.size,
              animationDelay: `${place.delay}s`,
              animationDuration: `${place.duration}s`,
              transform: `translate(calc(var(--mx) * ${0.3 + (i % 3) * 0.2}), calc(var(--my) * ${0.3 + (i % 3) * 0.2}))`,
              transition: "transform 0.3s ease-out",
            }}
          >
            <Image
              src={src}
              alt=""
              width={place.size}
              height={place.size}
              className="y2k-galaxy-star-img"
              unoptimized
            />
          </div>
        );
      })}
    </div>
  );
}