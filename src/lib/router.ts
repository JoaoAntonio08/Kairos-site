import { useEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"
import { jump, remeasure } from "@/lib/smooth"

// A troca de página já cuida do scroll; sem isso o navegador restaura uma posição antiga no "voltar".
if (typeof history !== "undefined") history.scrollRestoration = "manual"

// Roteamento por hash: "#/jogos" abre a página "jogos"; "#projetos" (sem barra) continua sendo âncora da home.
// Funciona em qualquer hospedagem e no build de arquivo único, sem configurar servidor.
export const routeOf = (h: string = location.hash) => (h.startsWith("#/") ? decodeURIComponent(h.slice(2).split(/[?#]/)[0]) : "")

// Troca de página com transição suave (View Transitions API). O scroll volta ao topo DENTRO da transição,
// para a página nova já aparecer no topo em vez de surgir na posição antiga e pular. Sem suporte: troca direta.
export function useRoute() {
  const [route, setRoute] = useState(() => routeOf()), cur = useRef(route)
  useEffect(() => {
    const f = () => {
      const next = routeOf(); if (next === cur.current) return
      cur.current = next
      const calm = matchMedia("(prefers-reduced-motion: reduce)").matches, vt = (document as any).startViewTransition?.bind(document)
      if (calm || !vt) return setRoute(next)
      vt(() => { flushSync(() => setRoute(next)); remeasure(); jump(0) })
    }
    addEventListener("hashchange", f)
    return () => removeEventListener("hashchange", f)
  }, [])
  return route
}

// "jogos" -> { slug: "jogos", id: "" } · "jogos/origin" -> { slug: "jogos", id: "origin" }
export const parseRoute = (r: string) => { const [slug = "", id = ""] = r.split("/"); return { slug, id } }
