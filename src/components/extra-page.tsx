import { useEffect, useMemo, useState, type CSSProperties } from "react"
import PerspectiveTunnel from "@/components/ui/perspective-tunnel"
import { EXTRAS, type ExtraCategory, type ExtraItem } from "@/data/extras"
import { STATUS } from "@/data/projects"
import { CONTACT, MEDIA } from "@/data/site"
import { eyebrow, h2, pill, wrap } from "@/lib/ui"
import { applyCatalog, asSort, asStatus, cleanQuery, countByStatus, MAX_QUERY, resultLabel, SORT_LABELS, type SortMode, type StatusFilter } from "@/lib/catalog"

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

// ---------------------------------------------------------------------------------------------
// Barra do catálogo: busca por texto, filtro por estado e ordenação.
// Estado e ordenação ficam salvos no navegador (localStorage) por aba; a busca não é salva.
// ---------------------------------------------------------------------------------------------
const FILTERS: [StatusFilter, string][] = [["all", "Todos"], ["concept", STATUS.concept], ["dev", STATUS.dev], ["on", STATUS.on]]
const keyOf = (slug: string) => `kairos:catalogo:${slug}`

function load(slug: string): { status: StatusFilter; sort: SortMode } {
  try {
    const saved = JSON.parse(localStorage.getItem(keyOf(slug)) ?? "{}")
    return { status: asStatus(saved.status), sort: asSort(saved.sort) }
  } catch { return { status: "all", sort: "saga" } }
}

function useCatalog(cat: ExtraCategory) {
  const [query, setQuery] = useState("")
  const [{ status, sort }, setPrefs] = useState(() => load(cat.slug))
  useEffect(() => { try { localStorage.setItem(keyOf(cat.slug), JSON.stringify({ status, sort })) } catch { /* navegação privada: segue sem salvar */ } }, [cat.slug, status, sort])
  const counts = useMemo(() => countByStatus(cat.items), [cat.items])
  // Se o filtro salvo não tem itens nesta aba (ex.: "Disponível" com 0), volta para "Todos".
  const active: StatusFilter = counts[status] ? status : "all"
  const list = useMemo(() => applyCatalog(cat.items, { query, status: active, sort }), [cat.items, query, active, sort])
  return {
    query, status: active, sort, counts, list,
    setQuery: (v: string) => setQuery(cleanQuery(v)),
    setStatus: (v: StatusFilter) => setPrefs((o) => ({ ...o, status: v })),
    setSort: (v: SortMode) => setPrefs((o) => ({ ...o, sort: v })),
    reset: () => { setQuery(""); setPrefs({ status: "all", sort: "saga" }) },
    filtered: query.trim() !== "" || active !== "all",
  }
}

const field = "h-11 rounded-full border-[1.5px] border-line bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 hover:border-muted-foreground focus-visible:border-accent"

function Toolbar({ c, cat }: { c: ReturnType<typeof useCatalog>; cat: ExtraCategory }) {
  return (
    <form role="search" aria-label={`Buscar em ${cat.label}`} onSubmit={(e) => e.preventDefault()} className="mt-10 grid gap-4 border-y border-line py-5 lg:grid-cols-[minmax(220px,1fr)_auto_auto] lg:items-center">
      <div className="relative">
        <label htmlFor="busca" className="sr-only">Buscar por nome, descrição ou gênero</label>
        <input id="busca" type="search" value={c.query} maxLength={MAX_QUERY} autoComplete="off" spellCheck={false}
          onChange={(e) => c.setQuery(e.target.value)} onKeyDown={(e) => e.key === "Escape" && c.setQuery("")}
          placeholder="Buscar por nome, descrição ou gênero" className={field + " w-full pl-10"} />
        <span aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">⌕</span>
      </div>
      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">Filtrar por estado</legend>
        {FILTERS.map(([v, label]) => {
          const n = c.counts[v], on = c.status === v
          return (
            <button key={v} type="button" aria-pressed={on} disabled={!n} onClick={() => c.setStatus(v)}
              className={"inline-flex h-11 items-center gap-2 rounded-full border-[1.5px] px-4 font-head text-[11px] font-extrabold uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-35 " + (on ? "border-accent bg-accent text-black" : "border-line text-muted-foreground enabled:hover:border-foreground enabled:hover:text-foreground")}>
              {label}<span className="tabular-nums opacity-70">{n}</span>
            </button>
          )
        })}
      </fieldset>
      <div className="flex items-center gap-3">
        <label htmlFor="ordem" className="text-[11px] uppercase tracking-[.16em] text-muted-foreground">Ordenar</label>
        <select id="ordem" value={c.sort} onChange={(e) => c.setSort(asSort(e.target.value))} className={field + " pr-8"}>
          {(Object.keys(SORT_LABELS) as SortMode[]).map((k) => <option key={k} value={k}>{k === "saga" && cat.numerals === "roman" ? "Ordem da saga" : SORT_LABELS[k]}</option>)}
        </select>
      </div>
    </form>
  )
}

function NoResults({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <div className="grid max-w-[720px] gap-5 rounded-2xl border border-dashed border-line p-8 sm:p-10">
      <p className="font-serif text-[clamp(24px,2.6vw,34px)] italic text-accent">Nada encontrado.</p>
      <p className="max-w-[52ch] text-muted-foreground">{query.trim() ? <>Nenhum item corresponde a “{query.trim()}” com os filtros atuais.</> : "Nenhum item corresponde aos filtros atuais."} Tente outra palavra ou limpe os filtros.</p>
      <div><button type="button" onClick={onReset} className={pill}>Limpar filtros</button></div>
    </div>
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
  const c = useCatalog(cat), tools = cat.items.length > 1
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

          {tools && <Toolbar c={c} cat={cat} />}

          <div className="mb-0 mt-14 flex flex-wrap items-baseline justify-between gap-3">
            <p className={eyebrow + " mb-0 !text-muted-foreground"}>02 / {cat.items.length > 1 ? (c.filtered ? "Resultado da busca" : "A linha completa") : "Em destaque"}</p>
            {tools && <p role="status" aria-live="polite" className="text-[11px] uppercase tracking-[.16em] text-muted-foreground">{resultLabel(c.list.length, cat.items.length)}</p>}
          </div>
        </div>

        <div className={wrap + " mt-5"}>
          {!cat.items.length ? <Empty text={cat.empty} />
            : c.list.length
              ? <ul className={"grid border-l border-t border-line " + cols(c.list.length)}>{c.list.map((it) => <Cell key={it.id} it={it} n={it.pos} cat={cat} />)}</ul>
              : <NoResults query={c.query} onReset={c.reset} />}
        </div>
      </section>
      {cat.showcase && shots.length >= 3 && <PerspectiveTunnel items={shots} {...cat.showcase} />}
    </div>
  )
}
