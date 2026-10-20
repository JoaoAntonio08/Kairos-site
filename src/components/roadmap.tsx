import { useMemo, useState } from "react"
import Backdrop from "@/components/backdrop"
import GlassCard from "@/components/ui/glass-card"
import { CoverflowCarousel } from "@/components/ui/coverflow-carousel"
import { ROADMAP, STATUS } from "@/data/projects"

export default function Roadmap() {
  const [i, setI] = useState(0)
  const p = ROADMAP[i]
  const slides = useMemo(() => ROADMAP.map((r) => ({ src: r.wide, alt: `${r.name} — arte ilustrativa` })), [])
  return (
    <section id="roadmap" aria-labelledby="road-t" className="relative min-h-svh overflow-hidden border-t border-line py-24">
      <Backdrop items={ROADMAP} active={i} />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/55 to-background" />
      <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-10 lg:px-[72px]">
        <p className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[.18em] text-accent before:h-px before:w-7 before:bg-current">Roadmap</p>
        <h2 id="road-t" className="max-w-[16ch] font-head text-[clamp(36px,6vw,84px)] font-extrabold uppercase leading-[.95] tracking-tight">Do primeiro produto ao último capítulo</h2>

        <CoverflowCarousel className="mt-6" slides={slides} onSelect={setI} aspectRatio={16 / 9} imageFit="contain" cardWidth="clamp(240px, 32vw, 440px)" showNavigation showPagination label="Roadmap da Kairós Interactive" />
        <GlassCard className="mx-auto mt-2 max-w-[760px]">
          <div key={p.id} aria-live="polite" className="min-h-[480px] animate-[fadeup_.5s_ease]">
            <span className="text-[11px] uppercase tracking-[.16em] text-white/70">Etapa {i + 1} de {ROADMAP.length} · {STATUS[p.status]}</span>
            <h3 className="mb-1 mt-3 font-head text-[clamp(28px,3.6vw,52px)] font-extrabold uppercase leading-none tracking-tight text-white">{p.name}</h3>
            <p className="mb-4 text-[13px] tracking-wide text-accent">{p.category}</p>
            {p.tagline && <p className="mb-3 italic text-white/80">“{p.tagline}”</p>}
            <div className="grid gap-3 text-[#d9d7d1]">{p.summary.map((s) => <p key={s}>{s}</p>)}</div>
            {p.points && <ul className="mt-4 grid gap-2">{p.points.map((x) => <li key={x} className="relative pl-5 text-[15px] text-[#cfcdc7] before:absolute before:left-0 before:top-[.8em] before:h-px before:w-2.5 before:bg-accent">{x}</li>)}</ul>}
            {p.saga && <p className="mt-4 text-[15px] text-[#cfcdc7]"><b className="font-medium text-accent">Papel na saga: </b>{p.saga}</p>}
            {p.shot && <figure className="mt-5"><img src={p.shot} alt={p.shotCap} loading="lazy" className="w-full rounded-xl border border-white/15" /><figcaption className="mt-2 text-xs text-white/60">{p.shotCap}</figcaption></figure>}
            <p className="mt-4 border-l-2 border-accent bg-black/30 px-3.5 py-3 text-[13.5px] text-[#cfcdc7]">{p.note}</p>
            {p.site && <a href={p.site} target="_blank" rel="noopener" className="mt-4 inline-flex h-11 items-center rounded-full border-[1.5px] border-white px-5 font-head text-xs font-extrabold uppercase tracking-widest text-white transition hover:bg-white hover:text-black">Ver página do projeto ↗</a>}
          </div>
        </GlassCard>
      </div>
    </section>
  )
}
