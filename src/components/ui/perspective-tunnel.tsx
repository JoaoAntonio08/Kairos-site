"use client"
// Túnel em perspectiva: os cards voam em direção à câmera conforme a página rola.
// Adaptado do "perspective-tunnel-hero": o progresso vem do scroll da página (useScroll), sem capturar a roda do mouse.
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react"
import { useEffect, useRef, useState } from "react"

export interface TunnelItem { src: string; title: string; href: string; mark?: string; role?: string }
export interface TunnelProps { items: TunnelItem[]; kicker: string; lines: [string, string]; hint: string }

interface Card { item: TunnelItem; cos: number; sin: number; rx: number; ry: number; rot: number; index: number }
const SPRING = { stiffness: 60, damping: 25, mass: 0.5 }
// Cada card vive SPAN do scroll; FRONT é o ponto em que ele está mais perto da câmera (capítulo "ativo").
const SPAN = 0.55, FRONT = 0.6
const layout = (items: TunnelItem[]): Card[] => items.map((item, i) => {
  const a = i * 137.5 * (Math.PI / 180)
  return { item, cos: Math.cos(a), sin: Math.sin(a), rx: 0.28 + (i % 3) * 0.08, ry: 0.26 + (i % 2) * 0.09, rot: (i % 2 ? -1 : 1) * (3 + (i % 5) * 2), index: i }
})

function useParallax(enabled: boolean) {
  const rx = useMotionValue(0), ry = useMotionValue(0), x = useSpring(rx, SPRING), y = useSpring(ry, SPRING)
  useEffect(() => {
    if (!enabled) return
    const f = (e: PointerEvent) => { rx.set((e.clientX / innerWidth - 0.5) * 2); ry.set((e.clientY / innerHeight - 0.5) * 2) }
    addEventListener("pointermove", f, { passive: true })
    return () => removeEventListener("pointermove", f)
  }, [enabled, rx, ry])
  return { x, y }
}



// Cor vívida dominante da imagem (por faixas de matiz), usada como a "luz" que o card emite.
type Hsl = { h: number; s: number; l: number }
const cache = new Map<string, Hsl>()
function useGlow(src: string): Hsl | null {
  const [c, setC] = useState<Hsl | null>(cache.get(src) ?? null)
  useEffect(() => {
    if (cache.has(src)) return
    const img = new Image()
    img.onload = () => {
      try {
        const N = 48, cv = document.createElement("canvas"); cv.width = cv.height = N
        const ctx = cv.getContext("2d", { willReadFrequently: true })!; ctx.drawImage(img, 0, 0, N, N)
        const d = ctx.getImageData(0, 0, N, N).data, bins = Array.from({ length: 12 }, () => ({ w: 0, r: 0, g: 0, b: 0 }))
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), df = mx - mn
          if (mx < 0.25 || df / mx < 0.25) continue
          const h = df === 0 ? 0 : mx === r ? ((g - b) / df + 6) % 6 : mx === g ? (b - r) / df + 2 : (r - g) / df + 4
          const w = (df / mx) * mx, k = bins[Math.min(11, Math.floor(h * 2))]
          k.w += w; k.r += r * w; k.g += g * w; k.b += b * w
        }
        const top = bins.reduce((a, k) => (k.w > a.w ? k : a))
        if (!top.w) return
        const r = top.r / top.w, g = top.g / top.w, b = top.b / top.w, mx = Math.max(r, g, b), mn = Math.min(r, g, b), df = mx - mn
        const h = df === 0 ? 0 : mx === r ? ((g - b) / df + 6) % 6 : mx === g ? (b - r) / df + 2 : (r - g) / df + 4
        const v = { h: Math.round(h * 60), s: 85, l: 58 }
        cache.set(src, v); setC(v)
      } catch { /* imagem bloqueada: fica sem cor própria */ }
    }
    img.src = src
  }, [src])
  return c
}
const hsl = (c: Hsl, a: number) => `hsl(${c.h} ${c.s}% ${c.l}% / ${a})`

type Stage = { w: number; h: number; mobile: boolean }
function TunnelCard({ card, progress, pointer, total, stage }: { card: Card; progress: MotionValue<number>; pointer: { x: MotionValue<number>; y: MotionValue<number> }; total: number; stage: Stage }) {
  const span = SPAN, start = (card.index / total) * (1 - span)
  const local = useTransform(progress, [start, start + span], [0, 1])
  const z = useTransform(local, [0, 1], [stage.mobile ? -1200 : -1700, stage.mobile ? 350 : 500])
  const opacity = useTransform(local, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0])
  const events = useTransform(opacity, (o) => (o > 0.6 ? "auto" : "none"))
  const width = stage.mobile ? Math.max(130, Math.min(180, stage.w * 0.38)) : Math.max(180, Math.min(270, stage.w * 0.18))
  const bx = card.cos * stage.w * card.rx, by = card.sin * stage.h * card.ry, pan = stage.mobile ? 20 : 45
  const glow = useGlow(card.item.src)
  const transform = useTransform([z, pointer.x, pointer.y], ([cz, px, py]: number[]) => `translate3d(calc(-50% + ${bx - px * pan}px), calc(-50% + ${by - py * pan}px), ${cz}px) rotateZ(${card.rot}deg)`)
  return (
    <motion.a href={card.item.href} aria-label={card.item.title} style={{ width, transform, opacity, pointerEvents: events, zIndex: card.index + 1 }} className="group absolute left-1/2 top-1/2 block aspect-[4/5] select-none will-change-transform">
      {glow && <span aria-hidden className="absolute -inset-4 rounded-[2rem] opacity-70 blur-2xl transition-opacity duration-500 group-hover:opacity-100" style={{ background: hsl(glow, 0.55) }} />}
      <span className="relative block size-full overflow-hidden rounded-2xl bg-muted shadow-2xl shadow-black/90 ring-1 ring-white/15 transition-all duration-500 group-hover:ring-accent" style={glow ? { boxShadow: `0 0 36px -4px ${hsl(glow, 0.55)}, 0 0 0 1px ${hsl(glow, 0.5)}` } : undefined}>
        <img src={card.item.src} alt="" draggable={false} className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
        <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/85 via-black/10 to-transparent p-4 sm:p-5">
          <span className="font-head text-xs font-extrabold uppercase tracking-[.18em] text-white/95 sm:text-sm">{card.item.title}</span>
        </span>
      </span>
    </motion.a>
  )
}

export default function PerspectiveTunnel({ items, kicker, lines, hint }: TunnelProps) {
  const ref = useRef<HTMLElement>(null), reduce = useReducedMotion()
  const [stage, setStage] = useState<Stage>({ w: 1440, h: 900, mobile: false }), [active, setActive] = useState(0)
  useEffect(() => {
    const f = () => setStage({ w: innerWidth, h: innerHeight, mobile: innerWidth < 768 })
    f(); addEventListener("resize", f)
    return () => removeEventListener("resize", f)
  }, [])
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 30, restDelta: 0.0001 })
  const pointer = useParallax(!reduce)
  const cards = layout(items), n = cards.length
  // Capítulo ativo = o card mais perto da câmera.
  const fronts = cards.map((c) => (c.index / n) * (1 - SPAN) + FRONT * SPAN)
  useMotionValueEvent(progress, "change", (p) => {
    let k = 0
    fronts.forEach((f, i) => { if (Math.abs(p - f) < Math.abs(p - fronts[k])) k = i })
    setActive(k)
  })
  const titleScale = useTransform(progress, [0, 0.5, 1], [0.7, 1, 1.35])
  const titleOpacity = useTransform(progress, [0, 0.12, 0.85, 1], [0.25, 1, 1, 0])
  const hintOpacity = useTransform(progress, [0, 0.12], [1, 0])
  const capOpacity = useTransform(progress, [0.06, 0.14, 0.88, 0.97], [0, 1, 1, 0])
  if (reduce) return null // quem prefere menos movimento já tem a lista completa logo acima
  const cur = cards[active]?.item
  return (
    <section ref={ref} aria-label={kicker} className="relative h-[420svh] border-t border-line">
      <div className="sticky top-0 grid h-svh place-items-center overflow-hidden" style={{ perspective: stage.mobile ? "900px" : "1200px" }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(rgba(242,181,68,.14)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--color-accent)_14%,transparent)_0%,transparent_70%)]" />
        <div aria-hidden className="pointer-events-none absolute size-[48vmin] rounded-full border border-accent/20" />
        <div aria-hidden className="pointer-events-none absolute size-[76vmin] rounded-full border border-dashed border-accent/10" />

        <motion.div style={{ scale: titleScale, opacity: titleOpacity }} className="pointer-events-none z-0 flex flex-col items-center px-6 text-center">
          <p className="mb-4 text-xs uppercase tracking-[.4em] text-accent">{kicker}</p>
          <h2 className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text whitespace-nowrap font-head text-[clamp(40px,8vw,104px)] font-extrabold uppercase leading-[.92] tracking-tighter text-transparent">{lines[0]}<br />{lines[1]}</h2>
        </motion.div>

        <motion.p aria-hidden style={{ opacity: hintOpacity }} className="pointer-events-none absolute bottom-8 z-20 flex flex-col items-center gap-2 text-xs uppercase tracking-[.3em] text-muted-foreground">
          <span>{hint}</span><i className="h-6 w-px bg-gradient-to-b from-accent to-transparent" />
        </motion.p>

        <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {cards.map((c) => <TunnelCard key={c.item.href} card={c} progress={progress} pointer={pointer} total={n} stage={stage} />)}
        </div>

        {/* Capítulo atual e o papel dele na saga */}
        {cur && (
          <motion.div style={{ opacity: capOpacity }} className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/80 to-transparent px-5 pb-8 pt-24 sm:px-10 sm:pb-12 lg:px-[72px]">
            <div key={cur.href} className="mx-auto flex w-full max-w-[1440px] items-end gap-5 animate-[fadeup_.5s_ease_both] sm:gap-8">
              {cur.mark && <span className="font-head text-[clamp(48px,8vw,112px)] font-extrabold leading-[.8] text-accent">{cur.mark}</span>}
              <div className="min-w-0 max-w-[58ch]">
                <p className="font-head text-sm font-extrabold uppercase tracking-[.18em] text-white sm:text-base">{cur.title}</p>
                {cur.role && <p className="mt-2 font-serif text-[clamp(18px,1.9vw,26px)] italic leading-snug text-white/80">{cur.role}</p>}
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </section>
  )
}
