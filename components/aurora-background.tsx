"use client";

import React from "react"

import { useEffect, useRef } from "react";

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.003 + 0.001,
    }));

    let raf: number;
    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        const alpha = 0.2 + 0.5 * Math.sin(t * s.speed + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}

export function AuroraBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouse = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      container.style.setProperty("--mx", `${x * 20}px`);
      container.style.setProperty("--my", `${y * 15}px`);
    };

    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <>
      <StarField />
      <div
        ref={containerRef}
        className="fixed inset-0 overflow-hidden pointer-events-none z-0"
        aria-hidden="true"
        style={{
          "--mx": "0px",
          "--my": "0px",
        } as React.CSSProperties}
      >
        {/* Blob 1: Teal - top left */}
        <div
          className="aurora-blob animate-aurora-1"
          style={{
            width: "700px",
            height: "700px",
            top: "-250px",
            left: "-200px",
            background: "radial-gradient(circle, rgba(91,234,214,0.25) 0%, transparent 70%)",
            transform: `translate(var(--mx), var(--my))`,
          }}
        />
        {/* Blob 2: Violet - bottom right */}
        <div
          className="aurora-blob animate-aurora-2"
          style={{
            width: "600px",
            height: "600px",
            bottom: "-200px",
            right: "-150px",
            background: "radial-gradient(circle, rgba(168,85,247,0.22) 0%, transparent 70%)",
            transform: `translate(calc(var(--mx) * -0.7), calc(var(--my) * -0.7))`,
          }}
        />
        {/* Blob 3: Magenta - center right */}
        <div
          className="aurora-blob animate-aurora-3"
          style={{
            width: "500px",
            height: "500px",
            top: "35%",
            right: "15%",
            background: "radial-gradient(circle, rgba(255,45,155,0.15) 0%, transparent 70%)",
            transform: `translate(calc(var(--mx) * 0.5), calc(var(--my) * 0.5))`,
          }}
        />
        {/* Blob 4: Deep teal - bottom left */}
        <div
          className="aurora-blob animate-aurora-1"
          style={{
            width: "450px",
            height: "450px",
            bottom: "10%",
            left: "10%",
            background: "radial-gradient(circle, rgba(45,212,191,0.12) 0%, transparent 70%)",
            animationDelay: "5s",
            transform: `translate(calc(var(--mx) * -0.3), calc(var(--my) * -0.3))`,
          }}
        />
      </div>
    </>
  );
}
