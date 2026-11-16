import { useEffect, useState } from "react"
import SculptureHero from "@/components/ui/liquid-sculpture-hero"
import Chapters from "@/components/chapters"
import ExtraPage from "@/components/extra-page"
import EntryPage from "@/components/entry-page"
import { start, to, jump, remeasure } from "@/lib/smooth"
import { parseRoute, useRoute } from "@/lib/router"
import { eyebrow, h2, pill, wrap } from "@/lib/ui"
import { EXTRAS, findExtra } from "@/data/extras"
import art from "@/assets/edenfall-full.jpg"
import Timeline from "@/components/ui/timeline"
import ContactForm from "@/components/contact-form"
import { CONTACT, CONTACT_LABELS, contactHref, HERO_VIDEO, MEDIA, NAV, STAGES } from "@/data/site"

const contacts = Object.entries(CONTACT).filter(([, v]) => v) as [keyof typeof CONTACT, string][]

const WORDS = ["ORIGIN", "EDENFALL", "AFTERTIME", "THE HOLLOW", "REQUIEM"]
function Marquee() {
  const row = WORDS.map((w) => <span key={w} className="flex items-center gap-10">{w}<i className="not-italic text-accent [-webkit-text-stroke:0]">✦</i></span>)
  return (
    <div aria-hidden className="overflow-hidden border-y border-line bg-background py-6">
      <div className="marquee flex w-max gap-10 font-head text-[clamp(40px,7vw,104px)] font-extrabold uppercase leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(241,239,234,.5)]">{row}{row}{row}{row}</div>
    </div>
  )
}

const tab = "block border-b-2 border-transparent py-2 font-head text-xs font-extrabold uppercase tracking-[.12em] text-[#d8d6d0] transition hover:border-accent hover:text-white max-lg:border-line max-lg:py-4 max-lg:text-base"

function Header({ route }: { route: string }) {
  const slug = parseRoute(route).slug
  const [open, setOpen] = useState(false), [solid, setSolid] = useState(false)
  useEffect(() => {
    const f = () => setSolid(scrollY > 24), k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    f(); addEventListener("scroll", f, { passive: true }); addEventListener("keydown", k)
    return () => { removeEventListener("scroll", f); removeEventListener("keydown", k) }
  }, [])
  return (
    <header style={{ viewTransitionName: "site-header" }} className={"fixed inset-x-0 top-0 z-50 transition-colors " + (solid || open ? "border-b border-line bg-background/90 backdrop-blur-md" : "")}>
      <div className={wrap + " flex h-[72px] items-center justify-between gap-5"}>
        <a href="#inicio" aria-label="Kairós Interactive, início" className="flex items-center gap-3 font-head text-[15px] font-extrabold tracking-[.22em]"><img src={MEDIA.logo} alt="" className="h-8 w-auto animate-[flip_1.6s_.5s_cubic-bezier(.6,0,.2,1)_both]" />KAIRÓS</a>
        <nav id="menu" aria-label="Principal" className={"max-lg:absolute max-lg:inset-x-0 max-lg:top-full max-lg:border-b max-lg:border-line max-lg:bg-background max-lg:shadow-[0_24px_48px_rgba(0,0,0,.6)] " + (open ? "" : "max-lg:hidden")}>
          <ul className="flex items-center gap-7 max-lg:flex-col max-lg:items-stretch max-lg:gap-0 max-lg:px-5 max-lg:pb-4 xl:gap-9">
            {NAV.slice(0, 3).map(([id, t]) => (<li key={id}><a href={"#" + id} onClick={() => setOpen(false)} className={tab}>{t}</a></li>))}
            {!!EXTRAS.length && <li aria-hidden className="mx-1 h-6 w-px bg-line max-lg:mx-0 max-lg:mt-4 max-lg:h-px max-lg:w-full" />}
            {EXTRAS.map((c) => (<li key={c.slug}><a href={"#/" + c.slug} aria-current={slug === c.slug ? "page" : undefined} onClick={() => setOpen(false)} className={tab + (slug === c.slug ? " !border-accent !text-white" : " !text-muted-foreground")}>{c.label}</a></li>))}
          </ul>
        </nav>
        <a href="#contato" className={pill + " max-lg:hidden"}>Contato</a>
        <button aria-expanded={open} aria-controls="menu" aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen(!open)} className="grid size-11 place-content-center gap-[5px] rounded-full border-[1.5px] border-foreground lg:hidden"><i className="block h-px w-4 bg-current" /><i className="block h-px w-4 bg-current" /></button>
      </div>
    </header>
  )
}

function Home() {
  return (
    <>
        <SculptureHero src={MEDIA.logo} imageAlt="Logo da Kairós Interactive formada por partículas" artSrc={art} videoSrc={HERO_VIDEO || undefined} backdropText="kairós"
          eyebrow="Iniciativa independente · Jogos e soluções digitais" headline="Cada ideia tem o seu momento." headlineAccent="momento."
          body="A Kairós Interactive cria jogos autorais e soluções de software. Estamos no começo, e este site registra o caminho: o que já pensamos, o que estamos construindo e o que ainda é só ideia."
          primaryCta={{ label: "Ver projetos", href: "#projetos" }} secondaryCta={{ label: "Conhecer a iniciativa", href: "#sobre" }} />

        <Marquee />
        <Chapters />

        <section id="sobre" aria-labelledby="sobre-t" className="bg-[#f3f1ea] py-32 text-center text-[#0a0a0b]">
          <div className={wrap}><p className={eyebrow + " justify-center !text-[#8a5f00]"}>02 / Sobre a Kairós</p>
            <h2 id="sobre-t" className={h2 + " mx-auto mb-8 max-w-[14ch]"}>Começar pequeno, de verdade.</h2>
            <div className="mx-auto grid max-w-[60ch] gap-5 text-[#3b3a37]">
              <p><strong className="font-medium text-black">A Kairós Interactive é uma iniciativa independente</strong> dedicada a criar produtos digitais próprios, em duas frentes: jogos autorais e experimentais, e aplicações web que tentam resolver problemas reais.</p>
              <p>O nome vem do grego <em>kairós</em>, o momento certo para agir. Existimos porque há ideias que merecem sair do papel.</p>
              <p>Estamos em fase inicial: temos conceitos e planejamento, e ainda construímos a capacidade de levar projetos até o fim. Por isso mostramos o estado real de cada coisa.</p></div>
            <a href="#projetos" className="mt-8 inline-flex h-11 items-center rounded-full border-[1.5px] border-black px-5 font-head text-xs font-extrabold uppercase tracking-widest transition hover:bg-black hover:text-white">Ver projetos</a></div>
        </section>

        <Timeline eyebrow="03 / Filosofia" title="Como trabalhamos" items={STAGES} />

        <section id="contato" aria-labelledby="contato-t" className="border-t border-line py-28">
          <div className={wrap}><p className={eyebrow}>04 / Contato</p><h2 id="contato-t" className={h2}>Fale com a Kairós</h2>
            <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:items-start">
              <div className="grid gap-4 border border-line p-8">
                <p className="text-[12px] uppercase tracking-[.14em] text-muted-foreground">Canais oficiais</p>
                {contacts.length ? contacts.map(([k, v]) => (
                <a key={k} href={contactHref(k, v)} rel="noopener" target={k === "email" ? undefined : "_blank"} className="w-max border-b-2 border-accent font-head text-[clamp(20px,2.6vw,32px)] font-extrabold uppercase">{CONTACT_LABELS[k]}</a>))
                : <p className="text-muted-foreground">Os canais oficiais de contato ainda estão sendo definidos.</p>}
                {CONTACT.email && <p className="text-sm text-muted-foreground">{CONTACT.email}</p>}
              </div>
              <ContactForm />
            </div></div>
        </section>
        <div aria-hidden className="h-[19vw] select-none overflow-hidden">
          <p className="mt-[3.2vw] bg-cover bg-center bg-clip-text font-head text-[27vw] font-extrabold uppercase leading-[.85] tracking-tighter text-transparent [-webkit-text-fill-color:transparent]" style={{ backgroundImage: `url(${art})`, WebkitBackgroundClip: "text" }}>Kairós</p>
        </div>
    </>
  )
}

export default function App() {
  useEffect(() => start(), [])
  const route = useRoute(), { slug, id } = parseRoute(route), cat = findExtra(slug), item = cat?.items.find((i) => i.id === id)
  useEffect(() => {
    document.title = cat ? `${item ? item.name : cat.label} — Kairós Interactive` : "Kairós Interactive — Jogos e soluções digitais"
    // Troca de página: topo. Voltando à home por uma âncora (#projetos, #contato...): rola até a seção depois de montar.
    const id = decodeURIComponent(location.hash.slice(1)), t = setTimeout(() => {
      const el = !cat && id && !id.startsWith("/") ? document.getElementById(id) : null
      remeasure()
      if (el) to(el.getBoundingClientRect().top + scrollY); else jump(0)
    }, 60)
    return () => clearTimeout(t)
  }, [route])
  return (
    <>
      {/* Pula para o conteúdo sem mexer no hash: "#main" seria lido como rota vazia e levaria de volta à Home. */}
      <a href="#main" onClick={(e) => { e.preventDefault(); const m = document.getElementById("main"); m?.focus(); if (m) jump(m.getBoundingClientRect().top + scrollY - 72) }}
        className="absolute -left-[999px] z-[99] bg-accent px-4 py-2 text-black focus:left-2 focus:top-2">Ir para o conteúdo</a>
      <Header route={route} />
      <main id="main" tabIndex={-1} className="outline-none">
        {cat && item ? <EntryPage key={cat.slug + "/" + item.id} cat={cat} item={item} /> : cat ? <ExtraPage key={cat.slug} cat={cat} /> : <Home />}
      </main>
      <footer className="border-t border-line py-12 text-sm text-muted-foreground">
        <div className={wrap + " grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]"}>
          <div><a href="#inicio" className="flex items-center gap-3 font-head font-extrabold tracking-[.22em] text-foreground"><img src={MEDIA.logo} alt="" className="h-7" />KAIRÓS</a><p className="mt-3 max-w-[34ch]">Iniciativa independente de jogos e soluções digitais. Em fase inicial de desenvolvimento.</p></div>
          <ul className="grid content-start gap-2">{NAV.slice(1, 3).map(([id, t]) => <li key={id}><a href={"#" + id} className="hover:text-foreground">{t}</a></li>)}</ul>
          {!!EXTRAS.length && <ul className="grid content-start gap-2">{EXTRAS.map((c) => <li key={c.slug}><a href={"#/" + c.slug} className="hover:text-foreground">{c.label}</a></li>)}</ul>}
          <ul className="grid content-start gap-2"><li><a href="#contato" className="hover:text-foreground">Contato</a></li>{contacts.map(([k, v]) => <li key={k}><a href={contactHref(k, v)} rel="noopener" className="hover:text-foreground">{CONTACT_LABELS[k]}</a></li>)}</ul>
          <p className="border-t border-line pt-5 text-xs md:col-span-4">© {new Date().getFullYear()} Kairós Interactive. Todos os direitos reservados. Os visuais dos projetos são ilustrações conceituais, não capturas de produtos.</p>
        </div>
      </footer>
    </>
  )
}
