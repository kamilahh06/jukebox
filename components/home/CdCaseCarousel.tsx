// // // "use client";

// // // import { useState } from "react";

// // // const SLIDES = [
// // //   { title: "What is Jukebox?", body: "A social platform to rate, review, and discuss music—like Letterboxd for your ears." },
// // //   { title: "Rate + Review", body: "Give stars, write reviews, and build your listening history." },
// // //   { title: "Annotate Lyrics", body: "Add line-by-line notes and interpretations to any track." },
// // //   { title: "Community Discussions", body: "Join conversations, share playlists, and discover what others love." },
// // //   { title: "Discover New Music", body: "Find tracks through ratings, trends, and curated collections." },
// // // ];

// // // export function CdCaseCarousel() {
// // //   const [index, setIndex] = useState(0);

// // //   const go = (delta: number) => {
// // //     setIndex((i) => Math.max(0, Math.min(SLIDES.length - 1, i + delta)));
// // //   };

// // //   return (
// // //     <div className="cd-case-carousel y2k-widget-frame">
// // //       <div className="cd-case-inner">
// // //         {/* Left panel (spine of open case) */}
// // //         <div className="cd-case-left" aria-hidden>
// // //           <div className="cd-case-spine" />
// // //         </div>

// // //         {/* Right panel: CD tray + disc + label */}
// // //         <div className="cd-case-right">
// // //           <div className="cd-case-disc-wrap">
// // //             <div className="cd-case-disc">
// // //               <div className="cd-case-disc-shine" />
// // //             </div>
// // //             <div className="cd-case-label-wrap">
// // //               <div
// // //                 className="cd-case-slides"
// // //                 style={{ transform: `translateX(-${index * 100}%)` }}
// // //               >
// // //                 {SLIDES.map((slide, i) => (
// // //                   <div key={i} className="cd-case-slide">
// // //                     <div className="cd-case-label y2k-widget-frame">
// // //                       <h3 className="cd-case-label-title">{slide.title}</h3>
// // //                       <p className="cd-case-label-body">{slide.body}</p>
// // //                     </div>
// // //                   </div>
// // //                 ))}
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* Navigation */}
// // //       <div className="cd-case-nav">
// // //         <button
// // //           type="button"
// // //           onClick={() => go(-1)}
// // //           disabled={index === 0}
// // //           className="cd-case-arrow"
// // //           aria-label="Previous"
// // //         >
// // //           ‹
// // //         </button>
// // //         <div className="cd-case-dots">
// // //           {SLIDES.map((_, i) => (
// // //             <button
// // //               key={i}
// // //               type="button"
// // //               onClick={() => setIndex(i)}
// // //               className={`cd-case-dot ${i === index ? "active" : ""}`}
// // //               aria-label={`Go to slide ${i + 1}`}
// // //               aria-current={i === index ? "true" : undefined}
// // //             />
// // //           ))}
// // //         </div>
// // //         <button
// // //           type="button"
// // //           onClick={() => go(1)}
// // //           disabled={index === SLIDES.length - 1}
// // //           className="cd-case-arrow"
// // //           aria-label="Next"
// // //         >
// // //           ›
// // //         </button>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // "use client";

// // import { useState } from "react";

// // const SLIDES = [
// //   {
// //     title: "Annotate lyrics like Genius",
// //     body: "Drop line-by-line notes, theories, and references.",
// //   },
// //   {
// //     title: "Rate tracks like Letterboxd",
// //     body: "Quick ratings + longer reviews, all in one profile.",
// //   },
// //   {
// //     title: "Build playlists & share",
// //     body: "Make public playlists and collect your favorite finds.",
// //   },
// //   {
// //     title: "Community-first discovery",
// //     body: "Find songs through what people wrote—not just algorithms.",
// //   },
// // ];

// // export function CdCaseCarousel() {
// //   const [index, setIndex] = useState(0);

// //   const go = (delta: number) => {
// //     setIndex((i) => Math.max(0, Math.min(SLIDES.length - 1, i + delta)));
// //   };

// //   return (
// //     <div className="cd-case-carousel y2k-widget-frame">
// //       <div className="cd-case-inner">
// //         {/* Left panel (spine of open case) */}
// //         <div className="cd-case-left" aria-hidden>
// //           <div className="cd-case-spine" />
// //         </div>

// //         {/* Right panel: CD tray + disc + label */}
// //         <div className="cd-case-right">
// //           <div className="cd-case-disc-wrap">
// //             <div className="cd-case-disc">
// //               <div className="cd-case-disc-shine" />
// //             </div>
// //             <div className="cd-case-label-wrap">
// //               <div
// //                 className="cd-case-slides"
// //                 style={{ transform: `translateX(-${index * 100}%)` }}
// //               >
// //                 {SLIDES.map((slide, i) => (
// //                   <div key={i} className="cd-case-slide">
// //                     <div className="cd-case-label y2k-widget-frame">
// //                       <h3 className="cd-case-label-title">{slide.title}</h3>
// //                       <p className="cd-case-label-body">{slide.body}</p>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Navigation */}
// //       <div className="cd-case-nav">
// //         <button
// //           type="button"
// //           onClick={() => go(-1)}
// //           disabled={index === 0}
// //           className="cd-case-arrow"
// //           aria-label="Previous"
// //         >
// //           ‹
// //         </button>
// //         <div className="cd-case-dots">
// //           {SLIDES.map((_, i) => (
// //             <button
// //               key={i}
// //               type="button"
// //               onClick={() => setIndex(i)}
// //               className={`cd-case-dot ${i === index ? "active" : ""}`}
// //               aria-label={`Go to slide ${i + 1}`}
// //               aria-current={i === index ? "true" : undefined}
// //             />
// //           ))}
// //         </div>
// //         <button
// //           type="button"
// //           onClick={() => go(1)}
// //           disabled={index === SLIDES.length - 1}
// //           className="cd-case-arrow"
// //           aria-label="Next"
// //         >
// //           ›
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { useState } from "react";

// const SLIDES = [
//   {
//     title: "Annotate lyrics\nlike Genius",
//     body: "Drop line-by-line notes,\ntheories, and references.",
//     accent: "#00FFFF",
//   },
//   {
//     title: "Rate tracks\nlike Letterboxd",
//     body: "Quick ratings + longer reviews,\nall in one profile.",
//     accent: "#FF00FF",
//   },
//   {
//     title: "Build playlists\n& share",
//     body: "Make public playlists and\ncollect your favorite finds.",
//     accent: "#FF6B9D",
//   },
//   {
//     title: "Community-first\ndiscovery",
//     body: "Find songs through what people\nwrote—not just algorithms.",
//     accent: "#39FF14",
//   },
// ];

// export function CdCaseCarousel() {
//   const [index, setIndex] = useState(0);
//   const [isAnimating, setIsAnimating] = useState(false);

//   const go = (delta: number) => {
//     if (isAnimating) return;
//     const newIndex = Math.max(0, Math.min(SLIDES.length - 1, index + delta));
//     if (newIndex !== index) {
//       setIsAnimating(true);
//       setIndex(newIndex);
//       setTimeout(() => setIsAnimating(false), 600);
//     }
//   };

//   return (
//     <div className="w-full max-w-6xl mx-auto px-4">
//       {/* Outer plastic case shell */}
//       <div 
//         className="relative"
//         style={{
//           perspective: '2000px',
//         }}
//       >
//         <div 
//           className="relative rounded-lg overflow-visible"
//           style={{
//             background: 'linear-gradient(145deg, rgba(25, 20, 40, 0.6), rgba(15, 10, 30, 0.9))',
//             boxShadow: `
//               0 25px 50px rgba(0, 0, 0, 0.5),
//               0 10px 20px rgba(0, 0, 0, 0.3),
//               inset 0 1px 0 rgba(255, 255, 255, 0.03),
//               inset 0 0 100px rgba(0, 0, 0, 0.4)
//             `,
//             border: '1px solid rgba(255, 255, 255, 0.05)',
//           }}
//         >
//           <div className="p-6 md:p-10">
            
//             {/* Main CD case view */}
//             <div className="flex items-center justify-center gap-4 md:gap-8">
              
//               {/* Left plastic hinge/spine */}
//               <div 
//                 className="hidden md:flex flex-col items-center justify-between h-[400px] w-4 shrink-0 rounded-sm relative"
//                 style={{
//                   background: 'linear-gradient(90deg, rgba(40, 35, 60, 0.6), rgba(20, 15, 35, 0.95), rgba(40, 35, 60, 0.6))',
//                   boxShadow: 'inset 3px 0 6px rgba(0, 0, 0, 0.6), inset -2px 0 6px rgba(0, 0, 0, 0.5)',
//                 }}
//               >
//                 {/* Hinge pins */}
//                 {[0, 1, 2].map((i) => (
//                   <div 
//                     key={i}
//                     className="w-2 h-2 rounded-full"
//                     style={{
//                       background: 'radial-gradient(circle at 30% 30%, rgba(200, 200, 200, 0.4), rgba(80, 80, 80, 0.6))',
//                       boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.5)',
//                     }}
//                   />
//                 ))}
//               </div>

//               {/* CD tray area */}
//               <div 
//                 className="relative flex-1 max-w-3xl"
//                 style={{
//                   background: 'radial-gradient(ellipse at center, rgba(20, 15, 35, 0.3), rgba(10, 8, 20, 0.6))',
//                   borderRadius: '12px',
//                   padding: '2rem',
//                 }}
//               >
                
//                 {/* The actual CD disc */}
//                 <div className="relative w-full max-w-md mx-auto aspect-square">
                  
//                   {/* CD surface with holographic effect */}
//                   <div 
//                     className="absolute inset-0 rounded-full group cursor-pointer"
//                     style={{
//                       background: `
//                         radial-gradient(circle at 35% 35%, 
//                           rgba(255, 255, 255, 0.15) 0%,
//                           rgba(180, 180, 200, 0.25) 20%,
//                           rgba(100, 100, 140, 0.35) 40%,
//                           rgba(60, 60, 100, 0.45) 60%,
//                           rgba(30, 30, 50, 0.7) 80%,
//                           rgba(15, 15, 30, 0.85) 100%
//                         )
//                       `,
//                       boxShadow: `
//                         inset 0 0 80px rgba(255, 255, 255, 0.08),
//                         inset 0 0 40px rgba(0, 0, 0, 0.6),
//                         0 15px 50px rgba(0, 0, 0, 0.7),
//                         0 5px 20px rgba(0, 0, 0, 0.5),
//                         0 0 0 1px rgba(255, 255, 255, 0.05)
//                       `,
//                       transition: 'transform 0.3s ease',
//                     }}
//                   >
                    
//                     {/* Holographic rainbow shimmer */}
//                     <div 
//                       className="absolute inset-0 rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-300"
//                       style={{
//                         background: `
//                           conic-gradient(from 45deg,
//                             rgba(255, 0, 150, 0.2) 0deg,
//                             rgba(0, 200, 255, 0.25) 60deg,
//                             rgba(150, 255, 0, 0.2) 120deg,
//                             rgba(255, 200, 0, 0.25) 180deg,
//                             rgba(255, 0, 200, 0.2) 240deg,
//                             rgba(0, 150, 255, 0.25) 300deg,
//                             rgba(255, 0, 150, 0.2) 360deg
//                           )
//                         `,
//                         mixBlendMode: 'screen',
//                       }}
//                     />

//                     {/* CD data grooves */}
//                     {[...Array(12)].map((_, i) => (
//                       <div
//                         key={i}
//                         className="absolute rounded-full pointer-events-none"
//                         style={{
//                           inset: `${8 + i * 7}px`,
//                           border: '1px solid rgba(0, 0, 0, 0.15)',
//                           boxShadow: 'inset 0 0 1px rgba(255, 255, 255, 0.03)',
//                         }}
//                       />
//                     ))}

//                     {/* Reflective light streak */}
//                     <div 
//                       className="absolute inset-0 rounded-full opacity-20 pointer-events-none group-hover:opacity-35 transition-opacity"
//                       style={{
//                         background: 'linear-gradient(125deg, transparent 0%, rgba(255, 255, 255, 0.6) 45%, rgba(255, 255, 255, 0.9) 50%, rgba(255, 255, 255, 0.6) 55%, transparent 100%)',
//                       }}
//                     />
//                   </div>

//                   {/* Center label area */}
//                   <div 
//                     className="absolute inset-[22%] rounded-full overflow-hidden"
//                     style={{
//                       background: 'linear-gradient(145deg, rgba(15, 12, 25, 0.95), rgba(25, 20, 40, 0.9))',
//                       boxShadow: `
//                         inset 0 0 30px rgba(0, 0, 0, 0.8),
//                         inset 0 2px 4px rgba(0, 0, 0, 0.6),
//                         0 0 20px ${SLIDES[index].accent}40
//                       `,
//                       border: '1px solid rgba(255, 255, 255, 0.03)',
//                     }}
//                   >
//                     {/* Sliding label content */}
//                     <div 
//                       className="flex h-full transition-transform duration-600 ease-out"
//                       style={{ 
//                         transform: `translateX(-${index * 100}%)`,
//                         width: `${SLIDES.length * 100}%`,
//                       }}
//                     >
//                       {SLIDES.map((slide, i) => (
//                         <div 
//                           key={i}
//                           className="flex items-center justify-center text-center px-8"
//                           style={{ 
//                             width: `${100 / SLIDES.length}%`,
//                           }}
//                         >
//                           <div className="space-y-3">
//                             {/* Logo badge */}
//                             <div 
//                               className="inline-flex items-center justify-center px-4 py-1.5 rounded-full mb-2"
//                               style={{
//                                 background: `linear-gradient(135deg, ${slide.accent}40, ${slide.accent}20)`,
//                                 boxShadow: `0 0 20px ${slide.accent}60, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
//                                 border: `1px solid ${slide.accent}60`,
//                               }}
//                             >
//                               <span 
//                                 className="text-xs font-black tracking-widest"
//                                 style={{
//                                   color: slide.accent,
//                                   textShadow: `0 0 10px ${slide.accent}80`,
//                                 }}
//                               >
//                                 JUKEBOX
//                               </span>
//                             </div>
                            
//                             {/* Title */}
//                             <h3 
//                               className="text-sm md:text-base font-bold leading-tight whitespace-pre-line"
//                               style={{
//                                 color: '#FFFFFF',
//                                 textShadow: `0 0 20px ${slide.accent}60, 0 2px 4px rgba(0, 0, 0, 0.8)`,
//                               }}
//                             >
//                               {slide.title}
//                             </h3>
                            
//                             {/* Body text */}
//                             <p 
//                               className="text-[10px] md:text-xs leading-snug whitespace-pre-line"
//                               style={{
//                                 color: 'rgba(255, 255, 255, 0.6)',
//                                 textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
//                               }}
//                             >
//                               {slide.body}
//                             </p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Center spindle hole */}
//                   <div 
//                     className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full"
//                     style={{
//                       background: 'radial-gradient(circle, rgba(0, 0, 0, 0.95) 30%, rgba(40, 35, 60, 0.7) 100%)',
//                       boxShadow: `
//                         inset 0 0 15px rgba(0, 0, 0, 0.95),
//                         inset 0 2px 4px rgba(0, 0, 0, 0.9),
//                         0 0 10px rgba(0, 0, 0, 0.6)
//                       `,
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Controls */}
//             <div 
//               className="mt-8 flex items-center justify-center gap-6 py-4 px-6 rounded-xl"
//               style={{
//                 background: 'linear-gradient(180deg, rgba(20, 15, 35, 0.4), rgba(10, 8, 20, 0.7))',
//                 boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.05), inset 0 -1px 2px rgba(0, 0, 0, 0.5)',
//               }}
//             >
//               {/* Previous button */}
//               <button
//                 type="button"
//                 onClick={() => go(-1)}
//                 disabled={index === 0}
//                 className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl font-bold transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
//                 style={{
//                   background: index === 0 
//                     ? 'rgba(100, 80, 140, 0.1)' 
//                     : 'linear-gradient(145deg, rgba(139, 92, 246, 0.25), rgba(100, 70, 180, 0.15))',
//                   boxShadow: index === 0 
//                     ? 'none' 
//                     : 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 6px 20px rgba(139, 92, 246, 0.4), 0 0 30px rgba(139, 92, 246, 0.2)',
//                   color: index === 0 ? 'rgba(255, 255, 255, 0.15)' : '#FFFFFF',
//                   textShadow: index === 0 ? 'none' : '0 0 10px rgba(185, 128, 255, 0.8)',
//                   border: index === 0 ? '1px solid rgba(100, 80, 140, 0.1)' : '1px solid rgba(185, 128, 255, 0.3)',
//                 }}
//                 aria-label="Previous"
//               >
//                 ‹
//               </button>

//               {/* Dot indicators */}
//               <div className="flex items-center gap-4">
//                 {SLIDES.map((slide, i) => (
//                   <button
//                     key={i}
//                     type="button"
//                     onClick={() => {
//                       if (!isAnimating && i !== index) {
//                         setIsAnimating(true);
//                         setIndex(i);
//                         setTimeout(() => setIsAnimating(false), 600);
//                       }
//                     }}
//                     className={`transition-all duration-300 ${
//                       i === index 
//                         ? 'w-10 h-2.5 rounded-full' 
//                         : 'w-2.5 h-2.5 rounded-full hover:scale-150'
//                     }`}
//                     style={{
//                       background: i === index
//                         ? `linear-gradient(90deg, ${slide.accent}CC, ${slide.accent}80)`
//                         : 'rgba(139, 92, 246, 0.25)',
//                       boxShadow: i === index 
//                         ? `0 0 15px ${slide.accent}90, inset 0 1px 0 rgba(255, 255, 255, 0.3)` 
//                         : 'none',
//                       border: i === index ? `1px solid ${slide.accent}40` : '1px solid rgba(139, 92, 246, 0.2)',
//                     }}
//                     aria-label={`Go to slide ${i + 1}`}
//                     aria-current={i === index ? "true" : undefined}
//                   />
//                 ))}
//               </div>

//               {/* Next button */}
//               <button
//                 type="button"
//                 onClick={() => go(1)}
//                 disabled={index === SLIDES.length - 1}
//                 className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl font-bold transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
//                 style={{
//                   background: index === SLIDES.length - 1
//                     ? 'rgba(100, 80, 140, 0.1)' 
//                     : 'linear-gradient(145deg, rgba(139, 92, 246, 0.25), rgba(100, 70, 180, 0.15))',
//                   boxShadow: index === SLIDES.length - 1
//                     ? 'none' 
//                     : 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 6px 20px rgba(139, 92, 246, 0.4), 0 0 30px rgba(139, 92, 246, 0.2)',
//                   color: index === SLIDES.length - 1 ? 'rgba(255, 255, 255, 0.15)' : '#FFFFFF',
//                   textShadow: index === SLIDES.length - 1 ? 'none' : '0 0 10px rgba(185, 128, 255, 0.8)',
//                   border: index === SLIDES.length - 1 ? '1px solid rgba(100, 80, 140, 0.1)' : '1px solid rgba(185, 128, 255, 0.3)',
//                 }}
//                 aria-label="Next"
//               >
//                 ›
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client"

import { useMemo, useState } from "react"

const SLIDES = [
  {
    title: "Annotate lyrics\nlike Genius",
    body: "Drop line-by-line notes,\ntheories, and references.",
    accent: "#00FFFF",
  },
  {
    title: "Rate tracks\nlike Letterboxd",
    body: "Quick ratings + longer reviews,\nall in one profile.",
    accent: "#FF00FF",
  },
  {
    title: "Build playlists\n& share",
    body: "Make public playlists and\ncollect your favorite finds.",
    accent: "#FF6B9D",
  },
  {
    title: "Community-first\ndiscovery",
    body: "Find songs through what people\nwrote—not just algorithms.",
    accent: "#39FF14",
  },
]

export function CdCaseCarousel() {
  const [index, setIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const current = useMemo(() => SLIDES[index], [index])

  const go = (delta: number) => {
    if (isAnimating) return
    const next = Math.max(0, Math.min(SLIDES.length - 1, index + delta))
    if (next === index) return
    setIsAnimating(true)
    setIndex(next)
    window.setTimeout(() => setIsAnimating(false), 450)
  }

  const jumpTo = (i: number) => {
    if (isAnimating || i === index) return
    setIsAnimating(true)
    setIndex(i)
    window.setTimeout(() => setIsAnimating(false), 450)
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="relative" style={{ perspective: "2000px" }}>
        <div
          className="relative rounded-lg overflow-visible"
          style={{
            background:
              "linear-gradient(145deg, rgba(25, 20, 40, 0.6), rgba(15, 10, 30, 0.9))",
            boxShadow: `
              0 25px 50px rgba(0, 0, 0, 0.5),
              0 10px 20px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.03),
              inset 0 0 100px rgba(0, 0, 0, 0.4)
            `,
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <div className="p-6 md:p-10">
            <div className="flex items-center justify-center gap-4 md:gap-8">
              {/* Left plastic hinge/spine */}
              <div
                className="hidden md:flex flex-col items-center justify-between h-[400px] w-4 shrink-0 rounded-sm relative"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(40, 35, 60, 0.6), rgba(20, 15, 35, 0.95), rgba(40, 35, 60, 0.6))",
                  boxShadow:
                    "inset 3px 0 6px rgba(0, 0, 0, 0.6), inset -2px 0 6px rgba(0, 0, 0, 0.5)",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 30%, rgba(200, 200, 200, 0.4), rgba(80, 80, 80, 0.6))",
                      boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.5)",
                    }}
                  />
                ))}
              </div>

              {/* CD tray area */}
              <div
                className="relative flex-1 max-w-3xl"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(20, 15, 35, 0.3), rgba(10, 8, 20, 0.6))",
                  borderRadius: "12px",
                  padding: "2rem",
                }}
              >
                <div className="relative w-full max-w-md mx-auto aspect-square">
                  {/* CD surface */}
                  <div
                    className="absolute inset-0 rounded-full group cursor-pointer"
                    style={{
                      background: `
                        radial-gradient(circle at 35% 35%, 
                          rgba(255, 255, 255, 0.15) 0%,
                          rgba(180, 180, 200, 0.25) 20%,
                          rgba(100, 100, 140, 0.35) 40%,
                          rgba(60, 60, 100, 0.45) 60%,
                          rgba(30, 30, 50, 0.7) 80%,
                          rgba(15, 15, 30, 0.85) 100%
                        )
                      `,
                      boxShadow: `
                        inset 0 0 80px rgba(255, 255, 255, 0.08),
                        inset 0 0 40px rgba(0, 0, 0, 0.6),
                        0 15px 50px rgba(0, 0, 0, 0.7),
                        0 5px 20px rgba(0, 0, 0, 0.5),
                        0 0 0 1px rgba(255, 255, 255, 0.05)
                      `,
                    }}
                  >
                    {/* shimmer */}
                    <div
                      className="absolute inset-0 rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-300"
                      style={{
                        background: `
                          conic-gradient(from 45deg,
                            rgba(255, 0, 150, 0.2) 0deg,
                            rgba(0, 200, 255, 0.25) 60deg,
                            rgba(150, 255, 0, 0.2) 120deg,
                            rgba(255, 200, 0, 0.25) 180deg,
                            rgba(255, 0, 200, 0.2) 240deg,
                            rgba(0, 150, 255, 0.25) 300deg,
                            rgba(255, 0, 150, 0.2) 360deg
                          )
                        `,
                        mixBlendMode: "screen",
                      }}
                    />

                    {/* grooves */}
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          inset: `${8 + i * 7}px`,
                          border: "1px solid rgba(0, 0, 0, 0.15)",
                          boxShadow:
                            "inset 0 0 1px rgba(255, 255, 255, 0.03)",
                        }}
                      />
                    ))}

                    {/* light streak */}
                    <div
                      className="absolute inset-0 rounded-full opacity-20 pointer-events-none group-hover:opacity-35 transition-opacity"
                      style={{
                        background:
                          "linear-gradient(125deg, transparent 0%, rgba(255, 255, 255, 0.6) 45%, rgba(255, 255, 255, 0.9) 50%, rgba(255, 255, 255, 0.6) 55%, transparent 100%)",
                      }}
                    />
                  </div>

                  {/* ✅ spindle hole BEHIND text */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full pointer-events-none"
                    style={{
                      zIndex: 1,
                      background:
                        "radial-gradient(circle, rgba(0, 0, 0, 0.95) 30%, rgba(40, 35, 60, 0.7) 100%)",
                      boxShadow: `
                        inset 0 0 15px rgba(0, 0, 0, 0.95),
                        inset 0 2px 4px rgba(0, 0, 0, 0.9),
                        0 0 10px rgba(0, 0, 0, 0.6)
                      `,
                    }}
                  />

                  {/* ✅ Center label ABOVE spindle + proper carousel track */}
                  <div
                    className="absolute inset-[22%] rounded-full overflow-hidden"
                    style={{
                      zIndex: 5,
                      background:
                        "linear-gradient(145deg, rgba(15, 12, 25, 0.95), rgba(25, 20, 40, 0.9))",
                      boxShadow: `
                        inset 0 0 30px rgba(0, 0, 0, 0.8),
                        inset 0 2px 4px rgba(0, 0, 0, 0.6),
                        0 0 20px ${current.accent}40
                      `,
                      border: "1px solid rgba(255, 255, 255, 0.03)",
                    }}
                  >
                    {/* TRACK
                    <div
                      className="flex h-full"
                      style={{
                        width: `${SLIDES.length * 100}%`,
                        transform: `translateX(-${index * (100 / SLIDES.length)}%)`,
                        transition: "transform 450ms ease-out",
                      }}
                    >
                      {SLIDES.map((slide, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-center text-center px-8"
                          style={{
                            flex: "0 0 100%",
                            width: "100%",
                          }}
                        >
                          <div className="space-y-3">
                            <div
                              className="inline-flex items-center justify-center px-4 py-1.5 rounded-full mb-2"
                              style={{
                                background: `linear-gradient(135deg, ${slide.accent}40, ${slide.accent}20)`,
                                boxShadow: `0 0 20px ${slide.accent}60, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                                border: `1px solid ${slide.accent}60`,
                              }}
                            >
                              <span
                                className="text-xs font-black tracking-widest"
                                style={{
                                  color: slide.accent,
                                  textShadow: `0 0 10px ${slide.accent}80`,
                                }}
                              >
                                JUKEBOX
                              </span>
                            </div>

                            <h3
                              className="text-sm md:text-base font-bold leading-tight whitespace-pre-line"
                              style={{
                                color: "#FFFFFF",
                                textShadow: `0 0 20px ${slide.accent}60, 0 2px 4px rgba(0, 0, 0, 0.8)`,
                              }}
                            >
                              {slide.title}
                            </h3>

                            <p
                              className="text-[10px] md:text-xs leading-snug whitespace-pre-line"
                              style={{
                                color: "rgba(255, 255, 255, 0.6)",
                                textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)",
                              }}
                            >
                              {slide.body}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div> */}
                    {/* TRACK */}
                    <div
                      className="flex h-full"
                      style={{
                        width: `${SLIDES.length * 100}%`,
                        transform: `translateX(-${index * (100 / SLIDES.length)}%)`,
                        transition: "transform 450ms ease-out",
                      }}
                    >
                      {SLIDES.map((slide, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-center text-center px-8"
                          style={{
                            flex: `0 0 ${100 / SLIDES.length}%`,
                            width: `${100 / SLIDES.length}%`,
                          }}
                        >
                          <div className="space-y-3">
                            <div
                              className="inline-flex items-center justify-center px-4 py-1.5 rounded-full mb-2"
                              style={{
                                background: `linear-gradient(135deg, ${slide.accent}40, ${slide.accent}20)`,
                                boxShadow: `0 0 20px ${slide.accent}60, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                                border: `1px solid ${slide.accent}60`,
                              }}
                            >
                              <span
                                className="text-xs font-black tracking-widest"
                                style={{
                                  color: slide.accent,
                                  textShadow: `0 0 10px ${slide.accent}80`,
                                }}
                              >
                                JUKEBOX
                              </span>
                            </div>

                            <h3
                              className="text-sm md:text-base font-bold leading-tight whitespace-pre-line"
                              style={{
                                color: "#FFFFFF",
                                textShadow: `0 0 20px ${slide.accent}60, 0 2px 4px rgba(0, 0, 0, 0.8)`,
                              }}
                            >
                              {slide.title}
                            </h3>

                            <p
                              className="text-[10px] md:text-xs leading-snug whitespace-pre-line"
                              style={{
                                color: "rgba(255, 255, 255, 0.7)",
                                textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)",
                              }}
                            >
                              {slide.body}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div
              className="mt-8 flex items-center justify-center gap-6 py-4 px-6 rounded-xl"
              style={{
                background:
                  "linear-gradient(180deg, rgba(20, 15, 35, 0.4), rgba(10, 8, 20, 0.7))",
                boxShadow:
                  "inset 0 1px 2px rgba(255, 255, 255, 0.05), inset 0 -1px 2px rgba(0, 0, 0, 0.5)",
              }}
            >
              <button
                type="button"
                onClick={() => go(-1)}
                disabled={index === 0}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl font-bold transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
                style={{
                  background:
                    index === 0
                      ? "rgba(100, 80, 140, 0.1)"
                      : "linear-gradient(145deg, rgba(139, 92, 246, 0.25), rgba(100, 70, 180, 0.15))",
                  boxShadow:
                    index === 0
                      ? "none"
                      : "inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 6px 20px rgba(139, 92, 246, 0.4), 0 0 30px rgba(139, 92, 246, 0.2)",
                  color:
                    index === 0
                      ? "rgba(255, 255, 255, 0.15)"
                      : "#FFFFFF",
                  textShadow:
                    index === 0
                      ? "none"
                      : "0 0 10px rgba(185, 128, 255, 0.8)",
                  border:
                    index === 0
                      ? "1px solid rgba(100, 80, 140, 0.1)"
                      : "1px solid rgba(185, 128, 255, 0.3)",
                }}
                aria-label="Previous"
              >
                ‹
              </button>

              <div className="flex items-center gap-4">
                {SLIDES.map((slide, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => jumpTo(i)}
                    className={`transition-all duration-300 ${
                      i === index
                        ? "w-10 h-2.5 rounded-full"
                        : "w-2.5 h-2.5 rounded-full hover:scale-150"
                    }`}
                    style={{
                      background:
                        i === index
                          ? `linear-gradient(90deg, ${slide.accent}CC, ${slide.accent}80)`
                          : "rgba(139, 92, 246, 0.25)",
                      boxShadow:
                        i === index
                          ? `0 0 15px ${slide.accent}90, inset 0 1px 0 rgba(255, 255, 255, 0.3)`
                          : "none",
                      border:
                        i === index
                          ? `1px solid ${slide.accent}40`
                          : "1px solid rgba(139, 92, 246, 0.2)",
                    }}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={i === index ? "true" : undefined}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => go(1)}
                disabled={index === SLIDES.length - 1}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl font-bold transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
                style={{
                  background:
                    index === SLIDES.length - 1
                      ? "rgba(100, 80, 140, 0.1)"
                      : "linear-gradient(145deg, rgba(139, 92, 246, 0.25), rgba(100, 70, 180, 0.15))",
                  boxShadow:
                    index === SLIDES.length - 1
                      ? "none"
                      : "inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 6px 20px rgba(139, 92, 246, 0.4), 0 0 30px rgba(139, 92, 246, 0.2)",
                  color:
                    index === SLIDES.length - 1
                      ? "rgba(255, 255, 255, 0.15)"
                      : "#FFFFFF",
                  textShadow:
                    index === SLIDES.length - 1
                      ? "none"
                      : "0 0 10px rgba(185, 128, 255, 0.8)",
                  border:
                    index === SLIDES.length - 1
                      ? "1px solid rgba(100, 80, 140, 0.1)"
                      : "1px solid rgba(185, 128, 255, 0.3)",
                }}
                aria-label="Next"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}