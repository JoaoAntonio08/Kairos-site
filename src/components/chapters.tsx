import { useEffect, useRef, useState } from "react"
import Backdrop from "@/components/backdrop"
import { PROJECTS, STATUS } from "@/data/projects"
import { to } from "@/lib/smooth"

// Cor de destaque por projeto: muda a atmosfera do capítulo inteiro.
const ACC: Record<string, string> = { origin: "#f2b544", edenfall: "#a78bfa", aftertime: "#60a5fa", hollow: "#a8b0a0", requiem: "#fb7185", econ: "#4ade80", lixeira: "#2dd4bf" }
const LIST = [...PROJECTS.filter((p) => p.kind === "game"), ...PROJECTS.filter((p) => p.kind !== "game")]
const n = LIST.length, pad = (v: number) => String(v).padStart(2, "0")

export default function Chapters() {
  const ref = useRef<HTMLElement>(null), [i, setI] = useState(0)
  const range = () => Math.max(1, ref.current!.offsetHeight - innerHeight)
  const top = () => ref.current!.getBoundingClientRect().top + scrollY
  useEffect(() => {
    const f = () => { const p = Math.min(0.999, Math.max(0, -ref.current!.getBoundingClientRect().top / range())); setI(Math.floor(p * n)) }
    f(); addEventListener("scroll", f, { passive: true }); addEventListener("resize", f)
    return () => { removeEventListener("scroll", f); removeEventListener("resize", f) }
  }, [])
  const p = LIST[i], c = ACC[p.id] ?? "#f2b544"
  return (
    <section id="projetos" ref={ref} aria-label="Projetos" className="relative border-t border-line" style={{ height: `calc(100svh + ${n * 70}vh)` }}>
      <div className="sticky top-0 h-svh min-h-[560px] overflow-hidden">
        <Backdrop items={LIST} active={i} />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/10" />
        <div aria-hidden className="absolute inset-0 opacity-40 mix-blend-soft-light transition-colors duration-700" style={{ background: c }} />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/50" />
        <h2 className="sr-only">Projetos</h2>
        <p className="absolute left-5 top-24 z-10 flex items-center gap-3 text-xs uppercase tracking-[.18em] text-white/70 before:h-px before:w-7 before:bg-current sm:left-10 lg:left-[72px]">Projetos · estágios honestos</p>
        <div className="relative mx-auto flex h-full w-full max-w-[1440px] flex-col justify-end px-5 pb-20 pt-28 sm:px-10 lg:px-[72px]">
          <p className="mb-3 flex items-center gap-3 text-xs uppercase tracking-[.18em] transition-colors duration-700 before:h-px before:w-7 before:bg-current" style={{ color: c }}>Capítulo {pad(i + 1)} / {pad(n)} · {STATUS[p.status]}</p>
          <div key={p.id}>
            <h3 className="max-w-[18ch] font-head text-[clamp(38px,6.2vw,96px)] font-extrabold uppercase leading-[.9] tracking-tight animate-[fadeup_.7s_ease_both]">{p.name}</h3>
            {p.tagline && <p className="mt-4 font-serif text-[clamp(22px,2.6vw,38px)] italic animate-[fadeup_.7s_.12s_ease_both]" style={{ color: c }}>“{p.tagline}”</p>}
            <p className="mt-5 max-w-[56ch] text-white/80 animate-[fadeup_.7s_.24s_ease_both]">{p.summary[0]}</p>
            <p className="mt-4 max-w-[56ch] border-l-2 pl-3 text-[13px] text-white/60 animate-[fadeup_.7s_.36s_ease_both]" style={{ borderColor: c }}>{p.note}</p>
            {p.site && <a href={p.site} target="_blank" rel="noopener" className="mt-5 inline-flex h-11 items-center rounded-full border-[1.5px] border-white px-5 font-head text-xs font-extrabold uppercase tracking-widest transition hover:bg-white hover:text-black">Ver página do projeto ↗</a>}
          </div>
        </div>
        <ol className="absolute right-4 top-1/2 z-10 grid -translate-y-1/2 gap-3 sm:right-8">
          {LIST.map((q, k) => <li key={q.id}><button type="button" aria-label={q.short} aria-current={k === i} onClick={() => to(top() + ((k + 0.5) / n) * range())} className="block size-3 rounded-full border border-white/70 transition-all duration-500" style={{ background: k === i ? c : "transparent", transform: k === i ? "scale(1.4)" : undefined }} /></li>)}
        </ol>
      </div>
    </section>
  )
}
