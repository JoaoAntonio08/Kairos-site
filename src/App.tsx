import { useEffect, useState } from "react"
import SculptureHero from "@/components/ui/liquid-sculpture-hero"
import Chapters from "@/components/chapters"
import { start } from "@/lib/smooth"
import art from "@/assets/edenfall-full.jpg"
import Timeline from "@/components/ui/timeline"
import { CONTACT, CONTACT_LABELS, contactHref, HERO_VIDEO, MEDIA, NAV, STAGES } from "@/data/site"

const pill = "inline-flex h-11 items-center rounded-full border-[1.5px] border-foreground px-5 font-head text-xs font-extrabold uppercase tracking-widest transition hover:bg-foreground hover:text-black"
const eyebrow = "mb-4 flex items-center gap-3 text-xs uppercase tracking-[.18em] text-accent before:h-px before:w-7 before:bg-current"
const h2 = "font-head text-[clamp(36px,6vw,84px)] font-extrabold uppercase leading-[.95] tracking-tight"
const wrap = "mx-auto w-full max-w-[1440px] px-5 sm:px-10 lg:px-[72px]"
const contacts = Object.entries(CONTACT).filter(([, v]) => v) as [keyof typeof CONTACT, string][]

function Header() {
  const [open, setOpen] = useState(false), [solid, setSolid] = useState(false)
  useEffect(() => {
    const f = () => setSolid(scrollY > 24), k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    f(); addEventListener("scroll", f, { passive: true }); addEventListener("keydown", k)
    return () => { removeEventListener("scroll", f); removeEventListener("keydown", k) }
  }, [])
  return (
    <header className={"fixed inset-x-0 top-0 z-50 transition-colors " + (solid || open ? "border-b border-line bg-background/90 backdrop-blur-md" : "")}>
      <div className={wrap + " flex h-[72px] items-center justify-between gap-5"}>
        <a href="#inicio" aria-label="Kairós Interactive, início" className="flex items-center gap-3 font-head text-[15px] font-extrabold tracking-[.22em]"><img src={MEDIA.logo} alt="" className="h-8 w-auto animate-[flip_1.6s_.5s_cubic-bezier(.6,0,.2,1)_both]" />KAIRÓS</a>
        <nav id="menu" aria-label="Principal" className={"max-md:absolute max-md:inset-x-0 max-md:top-full max-md:border-b max-md:border-line max-md:bg-background/95 " + (open ? "" : "max-md:hidden")}>
          <ul className="flex gap-9 max-md:flex-col max-md:gap-0 max-md:px-5 max-md:pb-4">
            {NAV.slice(0, 3).map(([id, t]) => (<li key={id}><a href={"#" + id} onClick={() => setOpen(false)} className="block border-b-2 border-transparent py-2 font-head text-xs font-extrabold uppercase tracking-[.12em] text-[#d8d6d0] transition hover:border-accent hover:text-white max-md:border-line max-md:py-4 max-md:text-base">{t}</a></li>))}
          </ul>
        </nav>
        <a href="#contato" className={pill + " max-md:hidden"}>Contato</a>
        <button aria-expanded={open} aria-controls="menu" aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen(!open)} className="grid size-11 place-content-center gap-[5px] rounded-full border-[1.5px] border-foreground md:hidden"><i className="block h-px w-4 bg-current" /><i className="block h-px w-4 bg-current" /></button>
      </div>
    </header>
  )
}

export default function App() {
  useEffect(() => {
    const stop = start(), fine = matchMedia("(pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches
    const mv = (e: PointerEvent) => { document.documentElement.style.setProperty("--gx", e.clientX + "px"); document.documentElement.style.setProperty("--gy", e.clientY + "px") }
    if (fine) addEventListener("pointermove", mv, { passive: true })
    return () => { stop(); removeEventListener("pointermove", mv) }
  }, [])
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[58] bg-[radial-gradient(520px_circle_at_var(--gx,-999px)_var(--gy,-999px),rgba(242,181,68,.08),transparent_60%)]" />
      <a href="#main" className="absolute -left-[999px] z-[99] bg-accent px-4 py-2 text-black focus:left-2 focus:top-2">Ir para o conteúdo</a>
      <Header />
      <main id="main">
        <SculptureHero src={MEDIA.logo} imageAlt="Logo da Kairós Interactive formada por partículas" artSrc={art} videoSrc={HERO_VIDEO || undefined} backdropText="kairós"
          eyebrow="Iniciativa independente · Jogos e soluções digitais" headline="Cada ideia tem o seu momento." headlineAccent="momento."
          body="A Kairós Interactive cria jogos autorais e soluções de software. Estamos no começo, e este site registra o caminho: o que já pensamos, o que estamos construindo e o que ainda é só ideia."
          primaryCta={{ label: "Ver projetos", href: "#projetos" }} secondaryCta={{ label: "Conhecer a iniciativa", href: "#sobre" }} />

        <Chapters />

        <section id="sobre" aria-labelledby="sobre-t" className="bg-[#f3f1ea] py-32 text-center text-[#0a0a0b]">
          <div className={wrap}><p className={eyebrow + " justify-center !text-[#8a5f00]"}>Sobre a Kairós</p>
            <h2 id="sobre-t" className={h2 + " mx-auto mb-8 max-w-[14ch]"}>Começar pequeno, de verdade.</h2>
            <div className="mx-auto grid max-w-[60ch] gap-5 text-[#3b3a37]">
              <p><strong className="font-medium text-black">A Kairós Interactive é uma iniciativa independente</strong> dedicada a criar produtos digitais próprios, em duas frentes: jogos autorais e experimentais, e aplicações web que tentam resolver problemas reais.</p>
              <p>O nome vem do grego <em>kairós</em>, o momento certo para agir. Existimos porque há ideias que merecem sair do papel.</p>
              <p>Estamos em fase inicial: temos conceitos e planejamento, e ainda construímos a capacidade de levar projetos até o fim. Por isso mostramos o estado real de cada coisa.</p></div>
            <a href="#projetos" className="mt-8 inline-flex h-11 items-center rounded-full border-[1.5px] border-black px-5 font-head text-xs font-extrabold uppercase tracking-widest transition hover:bg-black hover:text-white">Ver projetos</a></div>
        </section>

        <Timeline eyebrow="Filosofia" title="Como trabalhamos" items={STAGES} />

        <section id="contato" aria-labelledby="contato-t" className="border-t border-line py-28">
          <div className={wrap}><p className={eyebrow}>Contato</p><h2 id="contato-t" className={h2}>Fale com a Kairós</h2>
            <div className="mt-10 grid max-w-[720px] gap-4 border border-line p-8">{contacts.length ? contacts.map(([k, v]) => (
              <a key={k} href={contactHref(k, v)} rel="noopener" target={k === "email" ? undefined : "_blank"} className="w-max border-b-2 border-accent font-head text-[clamp(20px,2.6vw,32px)] font-extrabold uppercase">{CONTACT_LABELS[k]}</a>))
              : <p className="text-muted-foreground">Os canais oficiais de contato ainda estão sendo definidos.</p>}
              {CONTACT.email && <p className="text-sm text-muted-foreground">{CONTACT.email}</p>}</div></div>
        </section>
      </main>
      <footer className="border-t border-line py-12 text-sm text-muted-foreground">
        <div className={wrap + " grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]"}>
          <div><a href="#inicio" className="flex items-center gap-3 font-head font-extrabold tracking-[.22em] text-foreground"><img src={MEDIA.logo} alt="" className="h-7" />KAIRÓS</a><p className="mt-3 max-w-[34ch]">Iniciativa independente de jogos e soluções digitais. Em fase inicial de desenvolvimento.</p></div>
          <ul className="grid gap-2">{NAV.slice(1, 3).map(([id, t]) => <li key={id}><a href={"#" + id} className="hover:text-foreground">{t}</a></li>)}</ul>
          <ul className="grid gap-2"><li><a href="#contato" className="hover:text-foreground">Contato</a></li>{contacts.map(([k, v]) => <li key={k}><a href={contactHref(k, v)} rel="noopener" className="hover:text-foreground">{CONTACT_LABELS[k]}</a></li>)}</ul>
          <p className="border-t border-line pt-5 text-xs md:col-span-3">© {new Date().getFullYear()} Kairós Interactive. Todos os direitos reservados. Os visuais dos projetos são ilustrações conceituais, não capturas de produtos.</p>
        </div>
      </footer>
    </>
  )
}
