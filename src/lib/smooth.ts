import Lenis from "lenis"
export let lenis: Lenis | null = null
export const start = () => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {}
  const l = (lenis = new Lenis({ lerp: 0.1, anchors: true })); let id = 0
  const r = (t: number) => { l.raf(t); id = requestAnimationFrame(r) }
  id = requestAnimationFrame(r)
  return () => { cancelAnimationFrame(id); l.destroy(); lenis = null }
}
export const to = (y: number) => (lenis ? lenis.scrollTo(y) : scrollTo({ top: y, behavior: "smooth" }))
// Chamar depois de trocar o conteúdo da página: o Lenis guarda o tamanho antigo e limitaria a rolagem.
export const remeasure = () => lenis?.resize()
// Vai ao topo sem animação (troca de página).
export const jump = (y = 0) => (lenis ? lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y))
