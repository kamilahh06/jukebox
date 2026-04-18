"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"

type Gem = {
  id: string
  src: any
  x: number
  y: number
  scale: number
  rot: number
}

type Props = {
  /** A ref to the container we should clamp within */
  containerRef: React.RefObject<HTMLElement>
  /** Optional localStorage key override */
  storageKey?: string
}

/**
 * Draggable gem stickers that persist positions in localStorage.
 * - Pointer events (mouse + touch)
 * - Clamped within the container
 * - Reset button supported via window event (optional)
 */
export default function DraggableGems({
  containerRef,
  storageKey = "jukebox.profile.gems.v1",
}: Props) {
  // ✅ Use your existing gem PNGs (these were visible in your file tree)
  // Adjust paths if your folder name differs.
  const gemSources = useMemo(
    () => [
      require("@/components/canva/gem1.png"),
      require("@/components/canva/gem2.png"),
      require("@/components/canva/gem3.png"),
      require("@/components/canva/gem4.png"),
      require("@/components/canva/gem5.png"),
      require("@/components/canva/gem6.png"),
      require("@/components/canva/gem7.png"),
      require("@/components/canva/gem8.png"),
    ],
    []
  )

  const defaultGems: Gem[] = useMemo(() => {
    // Scatter along sides (x near edges), y down the page.
    // These are relative-ish to a typical desktop width; clamping handles smaller screens.
    const leftX = 14
    const rightX = 14 // we place on right using CSS "right" mode by converting later; simplest: store x and clamp

    return [
      { id: "g1", src: gemSources[0], x: leftX, y: 120, scale: 0.9, rot: -12 },
      { id: "g2", src: gemSources[1], x: leftX, y: 260, scale: 0.75, rot: 8 },
      { id: "g3", src: gemSources[2], x: leftX, y: 420, scale: 0.85, rot: 18 },
      { id: "g4", src: gemSources[3], x: leftX, y: 620, scale: 0.7, rot: -6 },

      // right side initial positions start “near” the right edge; we'll set them later once we know container width
      { id: "g5", src: gemSources[4], x: 99999, y: 160, scale: 0.85, rot: 10 },
      { id: "g6", src: gemSources[5], x: 99999, y: 330, scale: 0.7, rot: -16 },
      { id: "g7", src: gemSources[6], x: 99999, y: 520, scale: 0.8, rot: 6 },
      { id: "g8", src: gemSources[7], x: 99999, y: 700, scale: 0.72, rot: -10 },
    ]
  }, [gemSources])

  const [gems, setGems] = useState<Gem[]>(defaultGems)
  const draggingRef = useRef<{
    id: string
    pointerId: number
    offsetX: number
    offsetY: number
  } | null>(null)

  const clamp = (val: number, min: number, max: number) =>
    Math.min(max, Math.max(min, val))

  const measureContainer = () => {
    const el = containerRef.current
    if (!el) return null
    return el.getBoundingClientRect()
  }

  // Load from localStorage; also compute right-side x defaults once we know container width.
  useEffect(() => {
    const rect = measureContainer()
    if (!rect) return

    const raw = localStorage.getItem(storageKey)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Gem[]
        if (Array.isArray(parsed) && parsed.length) {
          setGems(parsed)
          return
        }
      } catch {
        // ignore
      }
    }

    // No saved state: set defaults, but replace right-side x=99999 with (containerWidth - margin - size)
    const margin = 14
    const approxSize = 64 // approximate gem box before scale
    const rightXComputed = rect.width - margin - approxSize

    setGems(
      defaultGems.map((g) =>
        g.x === 99999 ? { ...g, x: rightXComputed } : g
      )
    )
  }, [containerRef, defaultGems, storageKey])

  // Persist on change (debounced lightly via requestAnimationFrame)
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      localStorage.setItem(storageKey, JSON.stringify(gems))
    })
    return () => window.cancelAnimationFrame(id)
  }, [gems, storageKey])

  // Re-clamp on resize
  useEffect(() => {
    const onResize = () => {
      const rect = measureContainer()
      if (!rect) return
      setGems((prev) =>
        prev.map((g) => {
          const size = 64 * g.scale
          const x = clamp(g.x, 0, rect.width - size)
          const y = clamp(g.y, 0, rect.height - size)
          return { ...g, x, y }
        })
      )
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [containerRef])

  // Optional: allow parent to trigger a reset by dispatching a CustomEvent
  useEffect(() => {
    const handler = () => {
      const rect = measureContainer()
      if (!rect) return
      const margin = 14
      const approxSize = 64
      const rightXComputed = rect.width - margin - approxSize
      setGems(
        defaultGems.map((g) =>
          g.x === 99999 ? { ...g, x: rightXComputed } : g
        )
      )
      localStorage.removeItem(storageKey)
    }
    window.addEventListener("jukebox:gems:reset", handler as any)
    return () => window.removeEventListener("jukebox:gems:reset", handler as any)
  }, [defaultGems, storageKey])

  const onPointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    gemId: string
  ) => {
    const rect = measureContainer()
    if (!rect) return

    const gem = gems.find((g) => g.id === gemId)
    if (!gem) return

    // Capture pointer so dragging continues even if you move fast
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)

    const pointerX = e.clientX - rect.left
    const pointerY = e.clientY - rect.top

    draggingRef.current = {
      id: gemId,
      pointerId: e.pointerId,
      offsetX: pointerX - gem.x,
      offsetY: pointerY - gem.y,
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = draggingRef.current
    if (!drag) return

    const rect = measureContainer()
    if (!rect) return

    // Find gem
    const gem = gems.find((g) => g.id === drag.id)
    if (!gem) return

    const pointerX = e.clientX - rect.left
    const pointerY = e.clientY - rect.top

    const size = 64 * gem.scale
    const nextX = clamp(pointerX - drag.offsetX, 0, rect.width - size)
    const nextY = clamp(pointerY - drag.offsetY, 0, rect.height - size)

    setGems((prev) =>
      prev.map((g) => (g.id === drag.id ? { ...g, x: nextX, y: nextY } : g))
    )
  }

  const onPointerUp = () => {
    draggingRef.current = null
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2]"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {gems.map((g) => (
        <button
          key={g.id}
          type="button"
          className="pointer-events-auto absolute select-none"
          style={{
            left: g.x,
            top: g.y,
            width: 64 * g.scale,
            height: 64 * g.scale,
            transform: `rotate(${g.rot}deg)`,
          }}
          aria-label="Gem sticker"
          onPointerDown={(e) => onPointerDown(e, g.id)}
        >
          <div className="gem-sticker">
            <Image
              src={g.src}
              alt=""
              draggable={false}
              className="h-full w-full"
            />
          </div>
        </button>
      ))}
    </div>
  )
}