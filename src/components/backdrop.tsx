import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface Item { id: string; video?: string; wide: string }
/** Fundo que troca conforme o item ativo: vídeo do projeto, ou a arte esmaecida quando não há vídeo. active = -1 → preto. */
export default function Backdrop({ items, active, className }: { items: Item[]; active: number; className?: string }) {
  const refs = useRef<(HTMLVideoElement | null)[]>([])
  useEffect(() => { refs.current.forEach((v, i) => { if (!v) return; if (i === active) v.play().catch(() => {}); else v.pause() }) }, [active])
  return (
    <div aria-hidden className={cn("absolute inset-0 overflow-hidden bg-black", className)}>
      {items.map((it, i) => (
        <div key={it.id} className={"absolute inset-0 transition-opacity duration-700 " + (i === active ? "opacity-100" : "opacity-0")}>
          {it.video
            ? <video ref={(n) => { refs.current[i] = n }} src={it.video} poster={it.wide} muted loop playsInline preload="metadata" className="size-full scale-[1.04] object-cover blur-[3px]" />
            : <img src={it.wide} alt="" className="size-full scale-110 object-cover opacity-60 blur-sm" />}
        </div>
      ))}
    </div>
  )
}
