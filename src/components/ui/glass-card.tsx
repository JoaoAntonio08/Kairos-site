"use client"
import { motion, useReducedMotion, useSpring } from "motion/react"
import { useEffect, useId, useState, type CSSProperties, type PointerEvent as RPE, type ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface GlassCardProps {
  blur?: number; radius?: number; refraction?: number; rimWidth?: number; tint?: string
  interactive?: boolean; className?: string; children: ReactNode
}
const SPRING = { damping: 34, mass: 0.5, stiffness: 250 } as const
const ringMask = (w: number): CSSProperties => ({
  boxSizing: "border-box", padding: w, maskClip: "content-box, border-box", maskComposite: "exclude",
  maskImage: "linear-gradient(#000,#000),linear-gradient(#000,#000)", WebkitMaskClip: "content-box, border-box",
  WebkitMaskComposite: "xor", WebkitMaskImage: "linear-gradient(#000,#000),linear-gradient(#000,#000)",
})

export default function GlassCard({ blur = 11, radius = 26, refraction = 24, rimWidth = 12, tint = "oklch(1 0 0 / 0.1)", interactive = true, className, children }: GlassCardProps) {
  const reduce = useReducedMotion()
  const id = "glass" + useId().replace(/:/g, "")
  const [hover, setHover] = useState(false), [disp, setDisp] = useState(false)
  const sx = useSpring(0, SPRING), sy = useSpring(0, SPRING)
  useEffect(() => {
    setHover(matchMedia("(hover: hover) and (pointer: fine)").matches)
    setDisp(typeof CSS !== "undefined" && CSS.supports("backdrop-filter", `url(#${id}) blur(2px)`))
  }, [id])
  const track = interactive && hover && !reduce
  const move = (e: RPE<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    sx.set(e.clientX - r.left - r.width * 0.3); sy.set(e.clientY - r.top - r.height * 0.28)
  }
  const bodyF = `blur(${blur}px) saturate(160%) brightness(1.02)`
  const rimF = `blur(${Math.max(1, Math.round(blur * 0.12))}px) saturate(172%) brightness(1.07)`
  const rim = refraction > 0 && disp ? `url(#${id}) ${rimF}` : rimF
  return (
    <motion.div className={cn("relative overflow-hidden", className)} onPointerMove={track ? move : undefined}
      style={{ borderRadius: radius, boxShadow: "0 26px 60px -26px oklch(0 0 0 / .6), 0 10px 26px -18px oklch(0 0 0 / .45)" }}
      whileHover={track ? { scale: 1.006, y: -3 } : undefined} transition={reduce ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.3 }}>
      {refraction > 0 && disp && (
        <svg aria-hidden focusable="false" className="pointer-events-none absolute size-0"><defs><filter id={id}>
          <feTurbulence baseFrequency="0.016 0.024" numOctaves={2} result="n" seed={7} type="fractalNoise" />
          <feGaussianBlur in="n" result="s" stdDeviation={1.4} />
          <feDisplacementMap in="SourceGraphic" in2="s" scale={refraction} xChannelSelector="R" yChannelSelector="G" />
        </filter></defs></svg>
      )}
      <div aria-hidden className="absolute" style={{ inset: rimWidth, borderRadius: Math.max(radius - rimWidth, 6), backgroundColor: tint, backdropFilter: bodyF, WebkitBackdropFilter: bodyF, boxShadow: "inset 0 1px 0 oklch(1 0 0 / .22), inset 0 0 0 1px oklch(1 0 0 / .07)" }} />
      <div aria-hidden className="absolute inset-0 rounded-[inherit]" style={{ ...ringMask(rimWidth), backdropFilter: rim, WebkitBackdropFilter: rim }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 isolate overflow-hidden rounded-[inherit]">
        <div className="absolute inset-0 rounded-[inherit]" style={{ ...ringMask(rimWidth), backgroundImage: "linear-gradient(125deg, oklch(.84 .12 215 / .4), transparent 36%, transparent 64%, oklch(.78 .15 340 / .34))", mixBlendMode: "plus-lighter" }} />
        <motion.div className="absolute" style={{ width: 260, height: 260, left: "30%", top: "28%", marginLeft: -130, marginTop: -130, x: sx, y: sy, mixBlendMode: "plus-lighter", backgroundImage: "radial-gradient(closest-side, oklch(1 0 0 / .3), oklch(1 0 0 / .07) 48%, transparent 74%)" }} />
        <div className="absolute inset-0 rounded-[inherit]" style={{ backgroundImage: "linear-gradient(to bottom, transparent 48%, oklch(0 0 0 / .2))" }} />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: "inset 0 1px 0 oklch(1 0 0 / .55), inset 0 0 0 1px oklch(1 0 0 / .15)" }} />
      <div className="relative" style={{ padding: Math.max(20, rimWidth + 10) }}>{children}</div>
    </motion.div>
  )
}
