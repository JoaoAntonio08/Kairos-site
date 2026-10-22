import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import type { ExtraCategory, ExtraItem } from "@/data/extras"
import { STATUS, type Status } from "@/data/projects"
import { CONTACT } from "@/data/site"
import { to } from "@/lib/smooth"
import { eyebrow, pill, wrap } from "@/lib/ui"

const DOT: Record<Status, string> = { concept: "#a3a29d", dev: "#f2b544", on: "#4ade80" }
const pad = (v: number) => String(v).padStart(2, "0")
const gutter = " xl:pr-[360px]" // espaço da régua fixa à direita
const sec = "relative border-t border-line py-24 sm:py-28"
const h = "font-head text-[clamp(32px,5vw,68px)] font-extrabold uppercase leading-[.95] tracking-tight"

// ---------------------------------------------------------------------------------------------
// Régua lateral (xl+): título da seção atual, próximas seções e régua de 0–100% com marcador.
// Abaixo de xl vira só uma barra fina de progresso no topo. Tem estado próprio, então só ela re-renderiza ao rolar.
// ---------------------------------------------------------------------------------------------
interface Sec { id: string; label: string }
function Rail({ list, kicker }: { list: Sec[]; kicker: string }) {
  const [st, setSt] = useState({ p: 0, i: 0 })
  useEffect(() => {
    let raf = 0
    const calc = () => {
      raf = 0
      const y = scrollY, max = Math.max(1, document.documentElement.scrollHeight - innerHeight)
      let i = 0
      list.forEach((s, k) => { const el = document.getElementById(s.id); if (el && el.getBoundingClientRect().top <= innerHeight * 0.45) i = k })
      setSt((o) => { const p = Math.min(1, Math.max(0, y / max)); return o.i === i && Math.abs(o.p - p) < 0.002 ? o : { p, i } })
    }
    const on = () => { raf ||= requestAnimationFrame(calc) }
    calc(); addEventListener("scroll", on, { passive: true }); addEventListener("resize", on)
    return () => { removeEventListener("scroll", on); removeEventListener("resize", on); cancelAnimationFrame(raf) }
  }, [list])
  const go = (id: string) => { const el = document.getElementById(id); if (el) to(el.getBoundingClientRect().top + scrollY - 40) }
  const pct = Math.round(st.p * 100), next = list.slice(st.i + 1)
  return (
    <>
      <div aria-hidden className="fixed inset-x-0 top-0 z-[55] h-0.5 xl:hidden"><div className="h-full origin-left bg-accent" style={{ transform: `scaleX(${st.p})` }} /></div>
      <aside aria-label="Progresso da página" className="pointer-events-none fixed inset-y-0 right-0 z-40 hidden xl:block">
        {/* título fixo: muda conforme a seção */}
        <div className="absolute right-[112px] top-[104px] w-[240px] text-right">
          <p className="text-[11px] uppercase tracking-[.2em] text-muted-foreground">{kicker}</p>
          <p key={list[st.i].id} className="mt-1 font-head text-[34px] font-extrabold uppercase leading-none tracking-tight animate-[fadeup_.5s_ease_both]">{list[st.i].label}</p>
        </div>
        {/* próximas seções */}
        <ul className="pointer-events-auto absolute bottom-8 right-[112px] grid w-[240px] gap-1.5 text-right">
          {next.map((s) => <li key={s.id}><button type="button" onClick={() => go(s.id)} className="font-head text-[13px] font-extrabold uppercase tracking-[.12em] text-muted-foreground transition-colors hover:text-foreground">{s.label}</button></li>)}
        </ul>
        {/* régua 0–100 */}
        <div className="absolute bottom-6 right-0 top-[88px] w-[64px] border-l border-line">
          {Array.from({ length: 21 }, (_, k) => (
            <span key={k} className="absolute right-0 flex items-center gap-1.5" style={{ top: `${k * 5}%` }}>
              {k % 2 === 0 && <i className="not-italic text-[10px] tabular-nums text-muted-foreground/70">{k * 5}</i>}
              <b aria-hidden className={"block h-px bg-white/30 " + (k % 2 === 0 ? "w-4" : "w-2.5")} />
            </span>
          ))}
          <div className="absolute inset-x-0 flex items-center transition-[top] duration-150 ease-out" style={{ top: `${st.p * 100}%` }}>
            <span className="absolute right-full mr-1.5 whitespace-nowrap text-[10px] tabular-nums tracking-widest text-accent">{String(pct).padStart(3, "0")} %</span>
            <i aria-hidden className="block h-px flex-1 bg-accent" />
          </div>
        </div>
      </aside>
    </>
  )
}

// ---------------------------------------------------------------------------------------------
export default function EntryPage({ cat, item }: { cat: ExtraCategory; item: ExtraItem }) {
  const root = useRef<HTMLDivElement>(null)
  const idx = cat.items.findIndex((i) => i.id === item.id), next = cat.items.length > 1 ? cat.items[(idx + 1) % cat.items.length] : null
  const accent = item.accent ?? cat.accent
  const summary = item.summary?.length ? item.summary : [item.description]
  const short = item.name.split(/:\s+/)[0]
  const list = useMemo<Sec[]>(() => [
    { id: "topo", label: "Início" }, { id: "visao", label: "Visão geral" },
    ...(item.points?.length || item.saga ? [{ id: "destaques", label: item.points?.length ? "Destaques" : "Na saga" }] : []),
    ...(item.gallery?.length ? [{ id: "galeria", label: "Galeria" }] : []),
    { id: "estado", label: "Estado real" }, { id: "continue", label: "Continue" },
  ], [item])
  const facts: [string, string][] = [["Categoria", item.tags?.length ? item.tags.join(" · ") : cat.label], ["Estado", STATUS[item.status]], ...(item.price ? [["Preço", item.price] as [string, string]] : [])]

  // Efeitos ligados ao scroll (GSAP + ScrollTrigger): parallax do topo, entrada dos blocos e painéis da galeria.
  useLayoutEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.timeline({ scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: true } })
        .to("[data-layer='1']", { yPercent: 38, ease: "none" }, 0)
        .to("[data-layer='2']", { yPercent: 22, opacity: 0.15, ease: "none" }, 0)
      gsap.utils.toArray<HTMLElement>("[data-rv]").forEach((el) =>
        gsap.from(el, { y: 48, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } }))
      gsap.utils.toArray<HTMLElement>("[data-panel]").forEach((el) => {
        gsap.fromTo(el, { clipPath: "inset(12% 8% 12% 8%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: el, start: "top 96%", end: "top 45%", scrub: true } })
        gsap.fromTo(el.querySelector("[data-pimg]"), { yPercent: -7, scale: 1.04 }, { yPercent: 7, scale: 1.04, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } })
      })
    }, root)
    const imgs = Array.from(root.current!.querySelectorAll("img")), r = () => ScrollTrigger.refresh()
    imgs.forEach((im) => im.addEventListener("load", r)); const t = setTimeout(r, 400)
    return () => { clearTimeout(t); imgs.forEach((im) => im.removeEventListener("load", r)); ctx.revert() }
  }, [item.id])

  return (
    <div ref={root} style={accent ? ({ "--color-accent": accent } as CSSProperties) : undefined}>
      <Rail list={list} kicker={short} />

      {/* TOPO: camadas com velocidades diferentes (parallax) */}
      <section id="topo" data-hero aria-labelledby="entry-t" className="relative h-svh min-h-[600px] overflow-hidden bg-black">
        <div data-layer="1" aria-hidden className="absolute inset-x-0 -top-[8%] h-[116%]">
          {item.video
            ? <video src={item.video} poster={item.image} muted loop playsInline autoPlay preload="metadata" className="size-full object-cover" />
            : item.image && <img src={item.image} alt="" className="size-full object-cover" />}
          <div className="absolute inset-0 bg-black/45" />
        </div>
        <div data-layer="2" aria-hidden className="absolute inset-0 opacity-35 mix-blend-soft-light" style={{ background: "var(--color-accent)" }} />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className={wrap + " relative flex h-full flex-col justify-end pb-20 pt-28"}>
          <nav aria-label="Trilha" className="mb-6 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[.18em] text-white/70">
            <a href={`#/${cat.slug}`} className="transition-colors hover:text-white">← {cat.label}</a><span aria-hidden>/</span><span className="text-accent">{short}</span>
          </nav>
          <span className="mb-5 inline-flex w-max items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3.5 py-2 text-[11px] uppercase tracking-[.14em] text-white/90 backdrop-blur-md">
            <i aria-hidden className="size-1.5 rounded-full" style={{ background: DOT[item.status] }} />{STATUS[item.status]}
          </span>
          <h1 id="entry-t" className="max-w-[16ch] font-head text-[clamp(44px,8vw,128px)] font-extrabold uppercase leading-[.88] tracking-tighter animate-[fadeup_.8s_ease_both]">{short}</h1>
          {item.name !== short && <p className="mt-3 text-sm uppercase tracking-[.2em] text-white/70">{item.name.slice(short.length + 1).trim()}</p>}
          {item.tagline && <p className="mt-5 font-serif text-[clamp(22px,2.6vw,38px)] italic text-accent">“{item.tagline}”</p>}
          {!item.tagline && <p className="mt-5 max-w-[48ch] text-lg text-white/80">{item.description}</p>}
          <p aria-hidden className="mt-10 flex items-center gap-3 text-[11px] uppercase tracking-[.3em] text-white/60"><i className="h-8 w-px bg-gradient-to-b from-accent to-transparent" />Role para explorar</p>
        </div>
      </section>

      <div className="bg-background">
        {/* 01 VISÃO GERAL */}
        <section id="visao" aria-labelledby="visao-t" className={sec}>
          <div className={wrap + gutter}>
            <p data-rv className={eyebrow}>01 / Visão geral</p>
            <div className="grid gap-14 lg:grid-cols-[1.5fr_1fr]">
              <div className="grid content-start gap-5">
                <h2 data-rv id="visao-t" className={h + " mb-3"}>{item.tagline ? "Sobre o projeto" : item.name}</h2>
                {summary.map((s) => <p data-rv key={s} className="max-w-[58ch] text-[clamp(17px,1.5vw,21px)] leading-relaxed text-[#d4d2cc]">{s}</p>)}
              </div>
              <dl data-rv className="grid content-start self-start border-t border-line">
                {facts.map(([k, v]) => (<div key={k} className="grid grid-cols-[110px_1fr] gap-4 border-b border-line py-4 text-sm"><dt className="uppercase tracking-[.16em] text-muted-foreground">{k}</dt><dd>{v}</dd></div>))}
              </dl>
            </div>
          </div>
        </section>

        {/* 02 DESTAQUES / PAPEL NA SAGA */}
        {(item.points?.length || item.saga) && (
          <section id="destaques" aria-labelledby="dest-t" className={sec}>
            <div className={wrap + gutter}>
              <p data-rv className={eyebrow}>02 / {item.points?.length ? "Destaques" : "Papel na saga"}</p>
              <h2 data-rv id="dest-t" className={h + " mb-12"}>{item.points?.length ? "O que a proposta prevê" : "Um capítulo da história"}</h2>
              {!!item.points?.length && (
                <ol className="border-t border-line">
                  {item.points.map((p, k) => (
                    <li data-rv key={p} className="grid grid-cols-[auto_1fr] items-baseline gap-6 border-b border-line py-6 sm:gap-10">
                      <span aria-hidden className="font-head text-[clamp(32px,4vw,56px)] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_var(--color-accent)]">{pad(k + 1)}</span>
                      <p className="max-w-[48ch] text-[clamp(18px,1.7vw,24px)] leading-snug">{p}</p>
                    </li>
                  ))}
                </ol>
              )}
              {item.saga && <p data-rv className={"max-w-[40ch] border-l-2 border-accent pl-6 font-serif text-[clamp(26px,3vw,44px)] italic leading-tight" + (item.points?.length ? " mt-14" : "")}>{item.saga}</p>}
            </div>
          </section>
        )}

        {/* 03 GALERIA: painéis que se abrem e deslizam com o scroll */}
        {!!item.gallery?.length && (
          <section id="galeria" aria-labelledby="gal-t" className={sec}>
            <div className={wrap + gutter}>
              <p data-rv className={eyebrow}>{pad(list.findIndex((s) => s.id === "galeria"))} / Galeria</p>
              <h2 data-rv id="gal-t" className={h + " mb-12"}>Imagens</h2>
              <div className="grid gap-16">
                {item.gallery.map((g, k) => (
                  <figure key={g.src}>
                    <figcaption className="flex items-center justify-between gap-4 border-t border-line pb-4 pt-4 text-[11px] uppercase tracking-[.16em] text-muted-foreground"><span>{g.caption}</span><span aria-hidden>{pad(k + 1)}</span></figcaption>
                    <div data-panel className="relative aspect-video overflow-hidden rounded-xl border border-line bg-muted">
                      <img data-pimg src={g.src} alt={g.caption} loading="lazy" className="absolute inset-x-0 -top-[8%] h-[116%] w-full object-cover" />
                    </div>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ESTADO REAL */}
        <section id="estado" aria-labelledby="est-t" className={sec}>
          <div className={wrap + gutter}>
            <p data-rv className={eyebrow}>{pad(list.findIndex((s) => s.id === "estado"))} / Estado real</p>
            <h2 data-rv id="est-t" className={h + " mb-10 flex items-center gap-5"}><i aria-hidden className="size-4 shrink-0 rounded-full" style={{ background: DOT[item.status] }} />{STATUS[item.status]}</h2>
            <p data-rv className="max-w-[56ch] border-l-2 border-accent bg-white/[.03] px-5 py-4 text-[15px] text-[#cfcdc7]">{item.note ?? "Mostramos o estado real de cada coisa. Quando isso mudar, esta página muda junto."}</p>
            <div data-rv className="mt-8 flex flex-wrap gap-3">
              {item.link && <a href={item.link.href} {...(/^https?:/.test(item.link.href) ? { target: "_blank", rel: "noopener" } : {})} className={pill}>{item.link.label}{/^https?:/.test(item.link.href) && " ↗"}</a>}
              {CONTACT.instagram && <a href={CONTACT.instagram} target="_blank" rel="noopener" className={pill + " border-line text-muted-foreground"}>Acompanhar no Instagram ↗</a>}
            </div>
          </div>
        </section>

        {/* CONTINUE */}
        <section id="continue" aria-label="Continue explorando" className={sec + " pb-32"}>
          <div className={wrap + gutter}>
            <p data-rv className={eyebrow}>{pad(list.length - 1)} / Continue</p>
            {next
              ? <a data-rv href={`#/${cat.slug}/${next.id}`} className="group block border-y border-line py-10">
                  <span className="text-[11px] uppercase tracking-[.2em] text-muted-foreground">Próximo em {cat.label}</span>
                  <span className="mt-3 flex items-center justify-between gap-6 font-head text-[clamp(32px,5.5vw,84px)] font-extrabold uppercase leading-[.95] tracking-tight transition-colors group-hover:text-accent">{next.name.split(/:\s+/)[0]}<span aria-hidden className="transition-transform duration-300 group-hover:translate-x-2">→</span></span>
                </a>
              : <p data-rv className="text-muted-foreground">Este é, por enquanto, o único item de {cat.label}.</p>}
            <a data-rv href={`#/${cat.slug}`} className={pill + " mt-8"}>Ver todos em {cat.label}</a>
          </div>
        </section>
      </div>
    </div>
  )
}
