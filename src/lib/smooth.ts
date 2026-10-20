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
