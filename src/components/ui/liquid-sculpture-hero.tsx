"use client"
// Sculpture Hero — a imagem (com transparência) vira um campo de partículas que fluem como líquido
// perto do cursor e voltam ao lugar. API compatível com o componente original "liquid-sculpture-hero".
import * as React from "react"
import { cn } from "@/lib/utils"

export interface HeroLink { label: string; href: string }
export interface SculptureHeroProps {
  src: string; imageAlt?: string; eyebrow?: string; headline: string; headlineAccent?: string; body?: string
  primaryCta?: HeroLink; secondaryCta?: HeroLink; hint?: string; backdropText?: string; videoSrc?: string
  interactive?: boolean; strength?: number; radius?: number; particleDensity?: number; intro?: boolean
  height?: string; className?: string
}
type Pt = { hx: number; hy: number; x: number; y: number; vx: number; vy: number; k: number }
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

export default function SculptureHero({
  src, imageAlt = "", eyebrow, headline, headlineAccent, body, primaryCta, secondaryCta,
  hint = "Mova o cursor sobre a forma", backdropText, videoSrc, interactive = true, strength = 1,
  radius = 1, particleDensity = 1, intro = true, height = "100svh", className,
}: SculptureHeroProps) {
  const cv = React.useRef<HTMLCanvasElement>(null)
  React.useEffect(() => {
    const c = cv.current
    if (!c) return
    const ctx = c.getContext("2d")!
    const rm = matchMedia("(prefers-reduced-motion: reduce)").matches
    let P: Pt[] = [], raf = 0, vis = true, R = 120, size = 2, t = 0, born = performance.now()
    const m = { x: -9999, y: -9999, on: false }
    const img = new Image()
    const build = () => {
      const r = c.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2)
      c.width = r.width * d; c.height = r.height * d
      const wide = r.width > 760
      const lh = Math.min(c.height * (wide ? 0.66 : 0.5), c.width * 0.8), lw = lh * img.width / img.height
      const ox = (wide ? c.width * 0.7 : c.width * 0.5) - lw / 2, oy = c.height * (wide ? 0.5 : 0.36) - lh / 2
      const o = document.createElement("canvas"); o.width = Math.round(lw); o.height = Math.round(lh)
      const g = o.getContext("2d")!; g.drawImage(img, 0, 0, o.width, o.height)
      const dt = g.getImageData(0, 0, o.width, o.height).data
      const s = Math.max(2, Math.round(lw / (95 * Math.sqrt(particleDensity))))
      R = lh * 0.32 * radius; size = s * 0.62; P = []
      for (let j = 0; j < o.height; j += s) for (let i = 0; i < o.width; i += s) {
        if (dt[(j * o.width + i) * 4 + 3] < 110) continue
        const hx = ox + i, hy = oy + j, sc = intro && !rm
        P.push({ hx, hy, x: sc ? hx + (Math.random() - 0.5) * c.width * 0.5 : hx, y: sc ? hy + (Math.random() - 0.5) * c.height * 0.5 : hy, vx: 0, vy: 0, k: Math.random() })
      }
      born = performance.now(); draw(false, born)
    }
    const draw = (step: boolean, now: number) => {
      ctx.clearRect(0, 0, c.width, c.height); t += 0.01
      const it = rm || !intro ? 1 : clamp((now - born) / 2800, 0, 1)
      for (const p of P) {
        if (step) {
          const dx = p.x - m.x, dy = p.y - m.y, q = Math.hypot(dx, dy) || 1
          if (m.on && q < R) { const f = (1 - q / R) * strength; p.vx += dx / q * f * 2.4 - dy / q * f * 1.3; p.vy += dy / q * f * 2.4 + dx / q * f * 1.3 }
          const ks = 0.035 * (0.2 + 0.8 * it * it)
          p.vx += (p.hx - p.x) * ks + Math.sin(t * 2 + p.k * 40) * (1 - it) * 0.6 + Math.sin(t + p.k * 9) * 0.01
          p.vy += (p.hy - p.y) * ks + Math.cos(t * 2 + p.k * 30) * (1 - it) * 0.6 + Math.cos(t + p.k * 7) * 0.01
          p.vx *= 0.9; p.vy *= 0.9; p.x += p.vx; p.y += p.vy
        }
        const sp = Math.hypot(p.vx, p.vy), e = Math.min(1, Math.hypot(p.x - p.hx, p.y - p.hy) / (R * 0.25))
        if (sp > 2) { ctx.strokeStyle = `rgba(242,200,110,${Math.min(0.9, sp / 10)})`; ctx.lineWidth = size; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2); ctx.stroke() }
        ctx.fillStyle = e > 0.12 ? `rgba(242,${181 + e * 30 | 0},68,${0.55 + e * 0.45})` : `rgba(241,239,234,${(0.5 + p.k * 0.35) * (0.25 + 0.75 * it)})`
        ctx.fillRect(p.x, p.y, size, size)
      }
    }
    const loop = (now: number) => { raf = requestAnimationFrame(loop); if (vis) draw(true, now) }
    const mv = (e: PointerEvent) => {
      const r = c.getBoundingClientRect(), d = c.width / r.width
      m.x = (e.clientX - r.left) * d; m.y = (e.clientY - r.top) * d
      m.on = interactive && e.clientY >= r.top && e.clientY <= r.bottom
    }
    img.onload = () => { build(); if (!rm) { raf = requestAnimationFrame(loop); addEventListener("pointermove", mv, { passive: true }) } }
    img.src = src
    const ro = new ResizeObserver(() => img.complete && img.naturalWidth && build()); ro.observe(c)
    const io = new IntersectionObserver((e) => { vis = e[0].isIntersecting }); io.observe(c)
    return () => { cancelAnimationFrame(raf); removeEventListener("pointermove", mv); ro.disconnect(); io.disconnect() }
  }, [src, interactive, strength, radius, particleDensity, intro])

  const [pre, post] = headlineAccent && headline.includes(headlineAccent) ? headline.split(headlineAccent) : [headline, ""]
  return (
    <section id="inicio" aria-labelledby="hero-title" style={{ minHeight: height }} className={cn("relative flex items-end overflow-hidden bg-[#08080a] pt-32 pb-12 sm:pb-20", className)}>
      {videoSrc && <video src={videoSrc} autoPlay muted loop playsInline aria-hidden className="absolute inset-0 size-full object-cover" />}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_55%_at_72%_45%,rgba(242,181,68,.13),transparent_70%)]" />
      {backdropText && <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[18%] select-none text-center font-head text-[22vw] font-extrabold uppercase leading-none tracking-tighter text-white/[0.035]">{backdropText}</div>}
      <canvas ref={cv} role="img" aria-label={imageAlt} className="absolute inset-0 size-full" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08080a]/90 via-transparent to-transparent" />
      <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-10 lg:px-[72px]">
        {eyebrow && <p className="mb-5 flex items-center gap-3 text-xs uppercase tracking-[.18em] text-accent before:h-px before:w-7 before:bg-current">{eyebrow}</p>}
        <h1 id="hero-title" className="max-w-[10ch] font-head text-[clamp(46px,9.4vw,150px)] font-extrabold uppercase leading-[.92] tracking-tight text-balance">
          {pre}{headlineAccent && <em className="not-italic text-accent">{headlineAccent}</em>}{post}
        </h1>
        <div className="mt-7 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            {body && <p className="mb-8 text-[clamp(16px,1.3vw,19px)] text-white/75">{body}</p>}
            <div className="flex flex-wrap gap-3">
              {primaryCta && <a href={primaryCta.href} className="inline-flex h-12 items-center rounded-full bg-accent px-6 font-head text-xs font-extrabold uppercase tracking-widest text-black transition hover:-translate-y-0.5 hover:bg-[#ffc85f]">{primaryCta.label}</a>}
              {secondaryCta && <a href={secondaryCta.href} className="inline-flex h-12 items-center rounded-full border-[1.5px] border-foreground px-6 font-head text-xs font-extrabold uppercase tracking-widest transition hover:bg-foreground hover:text-black">{secondaryCta.label}</a>}
            </div>
          </div>
          {interactive && <p aria-hidden className="hidden items-center gap-3 text-[11px] uppercase tracking-[.14em] text-muted-foreground before:size-1.5 before:animate-pulse before:rounded-full before:bg-current md:flex">{hint}</p>}
        </div>
      </div>
    </section>
  )
}
