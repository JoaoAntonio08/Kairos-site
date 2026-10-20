"use client"
import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

export interface CoverflowSlide { src: string; alt: string; title?: string; subtitle?: string; meta?: { label: string; value: string }[] }
export interface CoverflowCarouselProps {
  slides: CoverflowSlide[]; rotate?: number; depth?: number; perspective?: number; falloff?: number; fade?: number
  cardWidth?: string; gap?: number; loop?: boolean; showCaption?: boolean; showPagination?: boolean; showNavigation?: boolean
  label?: string; className?: string; cardClassName?: string
  /** Adição: avisa o componente pai quando o slide central muda. */
  onSelect?: (index: number) => void
  /** Adição: proporção do cartão (largura/altura). 1 = quadrado. */
  aspectRatio?: number
  /** Adição: "contain" mostra a imagem inteira, sem cortes. */
  imageFit?: "cover" | "contain"
}

export function CoverflowCarousel({
  slides, rotate = 44, depth = 0.6, perspective = 3, falloff = 0.56, fade = 0.1, cardWidth = "clamp(148px, 22vw, 260px)",
  gap = 0.05, loop = true, showCaption = false, showPagination = false, showNavigation = false, label = "Cover carousel",
  className, cardClassName, onSelect, aspectRatio = 1, imageFit = "cover",
}: CoverflowCarouselProps) {
  const count = slides.length
  const frameRef = React.useRef<HTMLDivElement>(null)
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const posRef = React.useRef(0), targetRef = React.useRef(0), widthRef = React.useRef(0)
  const rafRef = React.useRef<number | null>(null)
  const dragRef = React.useRef<{ id: number; x: number; pos: number; v: number; t: number } | null>(null)
  const [selected, setSelected] = React.useState(0)
  const indexAt = React.useCallback((pos: number) => ((Math.round(pos) % count) + count) % count, [count])
  React.useEffect(() => { onSelect?.(selected) }, [selected]) // eslint-disable-line react-hooks/exhaustive-deps

  const paint = React.useCallback(() => {
    const width = widthRef.current
    if (!width) return
    const pitch = width * (1 + gap), pos = posRef.current
    cardRefs.current.forEach((card, index) => {
      if (!card) return
      let offset = index - pos
      if (loop) { offset = ((offset % count) + count) % count; if (offset > count / 2) offset -= count }
      const distance = Math.abs(offset), ramp = Math.pow(distance, falloff)
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset)
      card.style.transform = `translateX(calc(-50% + ${offset * pitch}px)) translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`
      const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge)
      card.style.zIndex = String(100 - Math.round(distance))
    })
  }, [count, depth, fade, falloff, gap, loop, rotate])

  const settle = React.useCallback((target: number) => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    targetRef.current = target
    setSelected(indexAt(target))
    const step = () => {
      const remaining = target - posRef.current
      if (Math.abs(remaining) < 0.0004) { posRef.current = target; paint(); rafRef.current = null; return }
      posRef.current += remaining * 0.16
      paint()
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  }, [indexAt, paint])

  const clamp = React.useCallback((pos: number) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))), [count, loop])
  const goTo = React.useCallback((index: number) => {
    const target = loop ? index + Math.round((targetRef.current - index) / count) * count : index
    settle(clamp(target))
  }, [clamp, count, loop, settle])
  const nudge = React.useCallback((by: number) => settle(clamp(Math.round(targetRef.current) + by)), [clamp, settle])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    e.currentTarget.setPointerCapture(e.pointerId)
    targetRef.current = posRef.current
    dragRef.current = { id: e.pointerId, x: e.clientX, pos: posRef.current, v: 0, t: performance.now() }
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.id !== e.pointerId) return
    const pitch = widthRef.current * (1 + gap)
    if (!pitch) return
    const now = performance.now(), previous = posRef.current
    posRef.current = clamp(drag.pos - (e.clientX - drag.x) / pitch)
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000
    drag.t = now
    const index = indexAt(posRef.current)
    if (index !== selected) setSelected(index)
    paint()
  }
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.id !== e.pointerId) return
    dragRef.current = null
    settle(clamp(Math.round(posRef.current + Math.max(-2, Math.min(2, drag.v * 0.18)))))
  }

  useIsoLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const measure = () => { const card = cardRefs.current[0]; if (!card) return; widthRef.current = card.offsetWidth; paint() }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [paint])
  React.useEffect(() => () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }, [])

  const active = slides[selected]
  return (
    <div className={cn("w-full", className)} style={{ ["--cf-card" as string]: cardWidth }} role="region" aria-roledescription="carousel" aria-label={label}>
      <div className="relative">
        <div ref={frameRef} tabIndex={0} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}
          onKeyDown={(e) => { if (e.key === "ArrowLeft") { e.preventDefault(); nudge(-1) } else if (e.key === "ArrowRight") { e.preventDefault(); nudge(1) } }}
          className="cursor-grab overflow-hidden py-10 outline-none ring-ring focus-visible:ring-2 active:cursor-grabbing"
          style={{ perspective: `calc(var(--cf-card) * ${perspective})`, touchAction: "pan-y" }}>
          <div className="relative select-none" style={{ height: `calc(var(--cf-card) / ${aspectRatio})`, transformStyle: "preserve-3d" }}>
            {slides.map((slide, index) => (
              <div key={index} ref={(node) => { cardRefs.current[index] = node }} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${count}`}
                className={cn("absolute left-1/2 top-0 overflow-hidden rounded-2xl bg-muted shadow-xl will-change-transform", cardClassName)} style={{ width: "var(--cf-card)", aspectRatio }}>
                <img src={slide.src} alt={slide.alt} draggable={false} className={cn("h-full w-full select-none", imageFit === "contain" ? "object-contain" : "object-cover")} />
              </div>
            ))}
          </div>
        </div>
        {showNavigation && (<>
          <button type="button" aria-label="Slide anterior" onClick={() => nudge(-1)} className="absolute left-3 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-background/70 p-2 text-foreground backdrop-blur transition hover:bg-background"><ChevronLeft className="size-5" /></button>
          <button type="button" aria-label="Próximo slide" onClick={() => nudge(1)} className="absolute right-3 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-background/70 p-2 text-foreground backdrop-blur transition hover:bg-background"><ChevronRight className="size-5" /></button>
        </>)}
      </div>
      {showCaption && active?.title && (
        <div key={selected} className="mt-2 flex flex-col items-center px-6">
          <p className="text-[15px] font-semibold tracking-tight text-foreground">{active.title}</p>
          {active.subtitle && <p className="mt-1 text-[13px] text-muted-foreground">{active.subtitle}</p>}
        </div>
      )}
      {showPagination && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {slides.map((_, index) => (<button key={index} type="button" aria-label={`Ir para o slide ${index + 1}`} aria-current={index === selected} onClick={() => goTo(index)} className={cn("size-2 rounded-full bg-foreground transition-opacity", index === selected ? "opacity-100" : "opacity-30")} />))}
        </div>
      )}
    </div>
  )
}
export default CoverflowCarousel
