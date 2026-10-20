"use client"
// Linha do tempo horizontal fixada na tela, guiada pela rolagem (GSAP + ScrollTrigger).
import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export interface TimelineItem { id: string; label: string; title: string; text: string }
export interface TimelineProps { eyebrow?: string; title: string; items: TimelineItem[] }

export default function Timeline({ eyebrow, title, items }: TimelineProps) {
  const sec = useRef<HTMLElement>(null), track = useRef<HTMLDivElement>(null), line = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      const st = { trigger: sec.current, start: "top top", end: "bottom bottom", scrub: true }
      gsap.to(track.current, { x: () => -Math.max(0, track.current!.scrollWidth - window.innerWidth), ease: "none", scrollTrigger: { ...st, invalidateOnRefresh: true } })
      gsap.fromTo(line.current, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: st })
      gsap.utils.toArray<HTMLElement>("[data-item]").forEach((el, i) => {
        const trig = { trigger: sec.current, start: `${i * 14}% top`, end: `${i * 14 + 16}% top`, scrub: true }
        gsap.fromTo(el.querySelector("[data-dot]"), { scale: 0 }, { scale: 1, ease: "none", scrollTrigger: trig })
        gsap.fromTo(el.querySelectorAll("[data-rv]"), { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, ease: "power2.out", scrollTrigger: trig })
      })
    }, sec)
    return () => ctx.revert()
  }, [items.length])
  return (
    <section ref={sec} aria-labelledby="timeline-title" className="relative h-[320vh] motion-reduce:h-auto">
      <div className="sticky top-0 flex h-svh flex-col justify-center gap-12 overflow-hidden motion-reduce:static motion-reduce:h-auto motion-reduce:py-24">
        <div className="px-5 sm:px-10 lg:px-[72px]">
          {eyebrow && <p className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[.18em] text-accent before:h-px before:w-7 before:bg-current">{eyebrow}</p>}
          <h2 id="timeline-title" className="font-head text-[clamp(36px,6vw,84px)] font-extrabold uppercase leading-[.95] tracking-tight">{title}</h2>
        </div>
        <div ref={track} className="flex w-max gap-[6vw] px-5 will-change-transform motion-reduce:w-auto motion-reduce:flex-wrap sm:px-10 lg:px-[72px]">
          {items.map((it) => (
            <div key={it.id} data-item className="relative w-[min(78vw,460px)] border-t border-line pt-7">
              <span data-dot className="absolute -top-[5px] left-0 size-[9px] rounded-full bg-accent" />
              <span data-rv className="text-[13px] tracking-[.14em] text-muted-foreground">{it.label}</span>
              <h3 data-rv className="mb-2 font-head text-[clamp(34px,4vw,56px)] font-extrabold uppercase leading-none">{it.title}</h3>
              <p data-rv className="text-muted-foreground">{it.text}</p>
            </div>
          ))}
        </div>
        <div aria-hidden className="mx-5 h-0.5 bg-line sm:mx-10 lg:mx-[72px] motion-reduce:hidden"><div ref={line} className="h-full origin-left scale-x-0 bg-accent" /></div>
      </div>
    </section>
  )
}
