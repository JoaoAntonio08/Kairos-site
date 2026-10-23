import type { CSSProperties } from "react"
import PerspectiveTunnel from "@/components/ui/perspective-tunnel"
import { EXTRAS, type ExtraCategory, type ExtraItem } from "@/data/extras"
import { STATUS } from "@/data/projects"
import { CONTACT, MEDIA } from "@/data/site"
import { eyebrow, h2, pill, wrap } from "@/lib/ui"

// Classes completas (o Tailwind só gera o que enxerga escrito): colunas conforme a quantidade de itens.
const cols = (n: number) => (n <= 2 ? "sm:grid-cols-2" : n === 4 || n === 8 ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3")
const pad = (v: number) => String(v).padStart(2, "0")
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]
const num = (cat: ExtraCategory, n: number) => (cat.numerals === "roman" ? ROMAN[n - 1] ?? String(n) : pad(n))
const chip = "inline-flex items-center border px-2 py-1 text-[10.5px] uppercase tracking-[.12em]"

// "ORIGIN: Breath of Light" → título ORIGIN + subtítulo. Nomes com 2+ palavras ganham a última em cor de destaque.
function Title({ name }: { name: string }) {
  const [main, sub] = name.split(/:\s+/), w = main.split(" ")
  return (
    <>
      <h3 className="font-head text-[clamp(28px,2.8vw,42px)] font-extrabold leading-[1.02] tracking-tight">
        {w.length > 1 ? <>{w.slice(0, -1).join(" ")} <span className="text-accent">{w.at(-1)}</span></> : main}
      </h3>
      {sub && <p className="mt-1 text-[11px] uppercase tracking-[.16em] text-muted-foreground">{sub}</p>}
    </>
  )
}

function Cell({ it, n, cat }: { it: ExtraItem; n: number; cat: ExtraCategory }) {
  const accent = cat.unify ? cat.accent : it.accent ?? cat.accent
  return (
    <li className="border-b border-r border-line">
      <a href={`#/${cat.slug}/${it.id}`} style={accent ? ({ "--color-accent": accent } as CSSProperties) : undefined}
        className="group flex h-full flex-col transition-colors duration-300 hover:bg-white/[.025]">
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <span className="bg-accent px-2 py-1 font-head text-[11px] font-extrabold tracking-widest text-black">{num(cat, n)}</span>
          {it.tags?.[0] && <span className="truncate text-[11px] uppercase tracking-[.16em] text-muted-foreground">{it.tags[0]}</span>}
        </div>
        <div className={"relative overflow-hidden border-y border-line bg-[#0e0e10] " + (cat.portrait ? "aspect-[3/4]" : "aspect-[16/10]")}>
          {it.image
            ? <img src={it.image} alt="" loading="lazy" className="size-full object-cover opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
            : <div aria-hidden className="grid size-full place-content-center bg-[radial-gradient(70%_70%_at_50%_40%,color-mix(in_oklab,var(--color-accent)_22%,transparent),transparent)]"><img src={MEDIA.logo} alt="" className="h-14 w-auto opacity-30" /></div>}
        </div>
        <div className="flex flex-1 flex-col px-5 pb-6 pt-6">
          <Title name={it.name} />
          <p className="mt-4 line-clamp-4 text-[15px] text-muted-foreground">{it.description}</p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            <span className={chip + " border-accent/60 bg-accent/10 text-accent"}>{STATUS[it.status]}</span>
            {it.tags?.slice(1).map((t) => <span key={t} className={chip + " border-line text-muted-foreground"}>{t}</span>)}
            {it.price && <span className={chip + " border-line text-foreground"}>{it.price}</span>}
          </div>
          <span className="mt-auto pt-7 text-[11.5px] uppercase tracking-[.16em] text-muted-foreground transition-colors group-hover:text-foreground">
            Explorar {it.name.split(/:\s+/)[0]} <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5">↗</span>
          </span>
        </div>
      </a>
    </li>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="grid max-w-[720px] gap-5 rounded-2xl border border-dashed border-line p-8 sm:p-10">
      <p className="font-serif text-[clamp(24px,2.6vw,34px)] italic text-accent">Em breve, no momento certo.</p>
      <p className="max-w-[52ch] text-muted-foreground">{text}</p>
      <div className="flex flex-wrap gap-3">
        <a href="#projetos" className={pill}>Ver projetos</a>
        {CONTACT.instagram && <a href={CONTACT.instagram} target="_blank" rel="noopener" className={pill + " border-line text-muted-foreground"}>Acompanhar no Instagram ↗</a>}
      </div>
    </div>
  )
}

export default function ExtraPage({ cat }: { cat: ExtraCategory }) {
  const shots = cat.items.filter((i) => i.image).map((i, k) => ({ src: i.image!, title: i.name.split(/:\s+/)[0], href: `#/${cat.slug}/${i.id}`, mark: cat.numerals ? num(cat, k + 1) : undefined, role: cat.numerals ? i.saga : undefined }))
  return (
    <div style={cat.accent ? ({ "--color-accent": cat.accent } as CSSProperties) : undefined}>
      <section aria-labelledby="extra-t" className="min-h-[85svh] pb-28 pt-36">
        <div className={wrap + " animate-[fadeup_.6s_ease_both]"}>
          <p className={eyebrow}>Extras / {cat.label}</p>
          <h1 id="extra-t" className={h2}>{cat.title}</h1>
          <p className="mt-6 max-w-[60ch] text-muted-foreground">{cat.intro}</p>

          <nav aria-label="Extras" className="mt-10 flex flex-wrap gap-2.5">
            {EXTRAS.map((c) => (
              <a key={c.slug} href={"#/" + c.slug} aria-current={c.slug === cat.slug ? "page" : undefined}
                className={"inline-flex h-10 items-center rounded-full border-[1.5px] px-4 font-head text-[11px] font-extrabold uppercase tracking-widest transition " + (c.slug === cat.slug ? "border-accent bg-accent text-black" : "border-line text-muted-foreground hover:border-foreground hover:text-foreground")}>
                {c.label}{!!c.items.length && <span className="ml-2 opacity-60">{c.items.length}</span>}
              </a>
            ))}
          </nav>

          <p className={eyebrow + " mb-0 mt-14 !text-muted-foreground"}>02 / {cat.items.length > 1 ? "A linha completa" : "Em destaque"}</p>
        </div>

        <div className={wrap + " mt-5"}>
          {cat.items.length
            ? <ul className={"grid border-l border-t border-line " + cols(cat.items.length)}>{cat.items.map((it, k) => <Cell key={it.id} it={it} n={k + 1} cat={cat} />)}</ul>
            : <Empty text={cat.empty} />}
        </div>
      </section>
      {cat.showcase && shots.length >= 3 && <PerspectiveTunnel items={shots} {...cat.showcase} />}
    </div>
  )
}
