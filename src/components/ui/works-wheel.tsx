"use client"
// Roda 3D de projetos: anel em repouso, tambor vertical ao rolar. Uma única variável `turn` guia tudo.
import * as React from "react"
import { cn } from "@/lib/utils"

export interface WorksWheelItem { title: string; image: string; meta?: string; href?: string }
export interface WorksWheelProps extends Omit<React.ComponentPropsWithoutRef<"section">, "children"> { items: WorksWheelItem[]; label?: string; /** Avisa qual item está em foco (-1 = anel, nada selecionado). */ onFocusItem?: (index: number) => void
  /** Modo guiado pela rolagem da página: 0..1 = progresso do anel até o último item. Sem isso, a roda captura o scroll. */
  progress?: number
  /** No modo guiado, pedidos de navegação (setas, lista) viram rolagem da página. */
  onRequest?: (value: number) => void }

const CARD_H = 0.38, CARD_MAX_W = 0.34, RATIO = 1.45, STEP = 40, DRUM = 2.22, LENS = 2.7, RING_R = 1.14, BOW = 1.82, CULL = 1.6
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const rad = (d: number) => (d * Math.PI) / 180
const place = (ringDeg: number, drumDeg: number, ringR: number, drumR: number, bow: number, m: number) =>
  `translateX(${m * -bow * (1 - Math.cos(rad(drumDeg)))}px) rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px) rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`

export function WorksWheel({ items, label = "Projetos", className, onFocusItem, progress, onRequest, ...props }: WorksWheelProps) {
  const stageRef = React.useRef<HTMLDivElement>(null), wheelRef = React.useRef<HTMLDivElement>(null)
  const cards = React.useRef<(HTMLDivElement | null)[]>([]), labelRef = React.useRef<HTMLDivElement>(null), titleRef = React.useRef<HTMLDivElement>(null)
  const lastFocus = React.useRef(-2), onFocusRef = React.useRef(onFocusItem); onFocusRef.current = onFocusItem
  const turn = React.useRef(0), target = React.useRef(0), settle = React.useRef(0), drag = React.useRef<number | null>(null)
  const [active, setActive] = React.useState(0), [stage, setStage] = React.useState({ w: 0, h: 0 }), [reduced, setReduced] = React.useState(false)
  const n = items.length, last = Math.max(n - 1, 0)
  const coarse = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches
  const driven = progress !== undefined
  const to = React.useCallback((v: number) => { target.current = clamp(v, 0, last + 1) }, [last])
  const go = (v: number) => (driven ? onRequest?.(clamp(v, 0, last + 1)) : to(v))
  React.useEffect(() => { if (progress !== undefined) target.current = clamp(progress * (last + 1), 0, last + 1) }, [progress, last])

  React.useEffect(() => { const q = matchMedia("(prefers-reduced-motion: reduce)"); const r = () => setReduced(q.matches); r(); q.addEventListener("change", r); return () => q.removeEventListener("change", r) }, [])
  React.useEffect(() => { const el = stageRef.current!; const r = () => setStage({ w: el.clientWidth, h: el.clientHeight }); r(); const ro = new ResizeObserver(r); ro.observe(el); return () => ro.disconnect() }, [])
  const M = React.useMemo(() => {
    const cw = Math.min(stage.h * CARD_H * RATIO, stage.w * CARD_MAX_W), ch = cw / RATIO, rr = ch * RING_R
    return { cw, ch, rr, rs: n ? clamp(((2 * Math.PI * rr) / n * 0.82) / (cw || 1), 0.16, 1) : 1, dr: ch * DRUM, bow: ch * BOW, depth: ch * LENS, title: ch * 0.124, idx: ch * 0.04 }
  }, [stage, n])

  React.useEffect(() => {
    if (!stage.h) return
    let f = 0; const { rr, rs, dr, bow } = M
    const draw = () => {
      f = requestAnimationFrame(draw)
      const g = target.current - turn.current
      if (Math.abs(g) < 0.0005) turn.current = target.current; else turn.current += g * (reduced ? 1 : 0.12)
      const t = turn.current, m = clamp(t, 0, 1), pos = Math.max(0, t - 1)
      if (wheelRef.current) wheelRef.current.style.transform = `translateZ(${-m * dr}px)`
      for (let i = 0; i < n; i++) {
        const d = i - pos, c = cards.current[i]; if (!c) continue
        c.style.transform = place(d * (360 / n), d * STEP, rr, dr, bow, m)
        c.style.opacity = m > 0.5 && Math.abs(d) > CULL ? "0" : "1"
        c.style.zIndex = String(Math.round(100 - Math.abs(d) * 2))
        ;(c.firstElementChild as HTMLElement).style.transform = `scale(${rs + (1 - rs) * m})`
      }
      if (labelRef.current) labelRef.current.style.opacity = String(1 - m)
      if (titleRef.current) titleRef.current.style.opacity = String(m)
      const near = clamp(Math.round(pos), 0, last)
      const fo = m > 0.7 ? near : -1; if (fo !== lastFocus.current) { lastFocus.current = fo; onFocusRef.current?.(fo) }
      setActive((p) => (p === near ? p : near))
    }
    f = requestAnimationFrame(draw); return () => cancelAnimationFrame(f)
  }, [M, stage.h, n, last, reduced])

  React.useEffect(() => {
    const el = stageRef.current!
    if (driven) return
    const onWheel = (e: WheelEvent) => {
      const nx = target.current + e.deltaY / 900
      if (nx > 0 && nx < last + 1) e.preventDefault()
      to(nx); window.clearTimeout(settle.current); settle.current = window.setTimeout(() => to(Math.round(target.current)), 140)
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => { el.removeEventListener("wheel", onWheel); window.clearTimeout(settle.current) }
  }, [to, last, driven])

  const cur = items[active]
  return (
    <section aria-label={label} className={cn("relative h-full min-h-[24rem] w-full select-none overflow-hidden bg-background text-foreground", className)} {...props}>
      <div ref={stageRef} tabIndex={0} role="listbox" aria-label={label} aria-activedescendant={`works-wheel-${active}`}
        className="absolute inset-0 cursor-grab outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent active:cursor-grabbing"
        style={{ perspective: `${M.depth}px`, touchAction: driven || coarse ? "pan-y" : "pan-x" }}
        onPointerDown={(e) => { if (coarse || driven) return; drag.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId) }}
        onPointerMove={(e) => { if (drag.current === null) return; to(target.current + (drag.current - e.clientY) / 420); drag.current = e.clientY }}
        onPointerUp={() => { drag.current = null; if (target.current > 1) to(Math.round(target.current)) }}
        onKeyDown={(e) => { if (e.key === "ArrowDown") go(Math.round(target.current) + 1); else if (e.key === "ArrowUp") go(Math.round(target.current) - 1); else return; e.preventDefault() }}>
        <div ref={wheelRef} className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]">
          {items.map((it, i) => (
            <div key={it.title} id={`works-wheel-${i}`} role="option" aria-selected={i === active} ref={(nd) => { cards.current[i] = nd }}
              className="absolute [backface-visibility:hidden]" style={{ width: M.cw, height: M.ch, marginLeft: -M.cw / 2, marginTop: -M.ch / 2 }}>
              <span className="block size-full overflow-hidden rounded-lg border border-line bg-muted shadow-[0_18px_40px_-18px_#000]">
                <img src={it.image} alt={it.title} draggable={false} className="size-full object-cover" />
              </span>
            </div>
          ))}
        </div>
      </div>
      <div ref={labelRef} className="pointer-events-none absolute inset-0 grid place-items-center font-head font-extrabold uppercase tracking-tight" style={{ fontSize: M.title }}>{label}</div>
      <div ref={titleRef} className="pointer-events-none absolute left-[5%] top-1/2 max-w-[30%] -translate-y-1/2 font-head font-extrabold uppercase leading-none tracking-tight opacity-0 max-md:bottom-24 max-md:top-auto max-md:max-w-[60%] max-md:translate-y-0" style={{ fontSize: M.title }}>
        {cur?.title}{cur?.meta && <small className="mt-3 block font-sans text-xs font-medium normal-case tracking-[.12em] text-accent">{cur.meta}</small>}
      </div>
      <ol className="absolute right-[2.5%] top-24 hidden text-right leading-[1.75] text-muted-foreground md:block" style={{ fontSize: M.idx }}>
        {items.map((it, i) => (<li key={it.title}><button type="button" onClick={() => go(i + 1)} className={cn("cursor-pointer outline-none transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent", i === active && "font-medium text-foreground")}>{it.title}</button></li>))}
      </ol>
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 text-xs uppercase tracking-[.12em] text-muted-foreground">
        <button aria-label="Anterior" onClick={() => go(Math.round(target.current) - 1)} className="size-11 rounded-full border-[1.5px] border-foreground text-foreground">↑</button>
        <span className="hidden sm:inline">Role a página para girar</span>
        <button aria-label="Próximo" onClick={() => go(Math.round(target.current) + 1)} className="size-11 rounded-full border-[1.5px] border-foreground text-foreground">↓</button>
      </div>
    </section>
  )
}
export default WorksWheel
