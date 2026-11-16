import { useEffect, useId, useRef, useState, type KeyboardEvent, type Ref } from "react"
import { normalize } from "@/lib/catalog"

// Seletor com o visual do site. O <select> nativo abre uma lista desenhada pelo sistema operacional, que ignora o CSS
// (fundo, fonte, cor de destaque). Este componente segue o padrão "select-only combobox" do WAI-ARIA: o foco fica no
// botão e as opções são anunciadas por aria-activedescendant.
// Teclado: ↑/↓, Home/End, Enter/Espaço (abre ou escolhe), Esc (fecha), Tab (fecha) e digitar uma letra (pula para a opção).

export interface Option<T extends string> { value: T; label: string }

interface Props<T extends string> {
  id: string
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
  onBlur?: () => void
  placeholder?: string            // texto mostrado quando value === "" (opção vazia)
  invalid?: boolean
  describedBy?: string
  className?: string               // classes do botão (altura, borda, raio...)
  buttonRef?: Ref<HTMLButtonElement>
  align?: "left" | "right"
}

const Chevron = ({ open }: { open: boolean }) => (
  <svg aria-hidden viewBox="0 0 16 16" className={"h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 " + (open ? "rotate-180 text-accent" : "")}>
    <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const Check = () => (
  <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-accent"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

export default function Select<T extends string>({ id, value, options, onChange, onBlur, placeholder, invalid, describedBy, className = "", buttonRef, align = "left" }: Props<T>) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const box = useRef<HTMLDivElement>(null), list = useRef<HTMLUListElement>(null)
  const listId = useId() + "-lista"
  const selected = options.findIndex((o) => o.value === value)
  const current = selected >= 0 ? options[selected] : null
  const empty = !current || current.value === ""

  const show = (at = selected >= 0 ? selected : 0) => { setActive(at); setOpen(true) }
  const pick = (k: number) => { const o = options[k]; if (o) onChange(o.value); setOpen(false) }

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!open) return
    const out = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", out)
    return () => document.removeEventListener("mousedown", out)
  }, [open])

  // Mantém a opção destacada visível quando a lista rola.
  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-k="${active}"]`)?.scrollIntoView({ block: "nearest" })
  }, [open, active])

  const key = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); show() }
      return
    }
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setActive((a) => Math.min(last, a + 1)); break
      case "ArrowUp": e.preventDefault(); setActive((a) => Math.max(0, a - 1)); break
      case "Home": e.preventDefault(); setActive(0); break
      case "End": e.preventDefault(); setActive(last); break
      case "Enter": case " ": e.preventDefault(); pick(active); break
      case "Escape": e.preventDefault(); e.stopPropagation(); setOpen(false); break
      case "Tab": setOpen(false); break
      default:
        // Digitar uma letra pula para a próxima opção que começa com ela.
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const ch = normalize(e.key)
          for (let step = 1; step <= options.length; step++) {
            const k = (active + step) % options.length
            if (normalize(options[k].label).startsWith(ch)) { setActive(k); break }
          }
        }
    }
  }

  return (
    <div ref={box} className="relative">
      <button ref={buttonRef} id={id} type="button" role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined} aria-invalid={invalid || undefined} aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : show())} onKeyDown={key} onBlur={() => { setOpen(false); onBlur?.() }}
        className={"flex w-full items-center justify-between gap-3 text-left " + (open ? "!border-accent " : "") + className}>
        <span className={"truncate " + (empty ? "text-muted-foreground/70" : "")}>{empty ? placeholder ?? current?.label ?? "" : current!.label}</span>
        <Chevron open={open} />
      </button>

      {open && (
        <ul ref={list} id={listId} role="listbox" aria-labelledby={id} tabIndex={-1}
          className={"absolute top-[calc(100%+6px)] z-40 max-h-72 min-w-full overflow-auto rounded-xl border border-line bg-[#121214] p-1.5 shadow-[0_18px_48px_rgba(0,0,0,.55)] [animation:pop_.16s_ease-out] " + (align === "right" ? "right-0" : "left-0")}>
          {options.map((o, k) => {
            const isSel = k === selected, isAct = k === active
            return (
              <li key={o.value || "_vazio"} id={`${listId}-${k}`} data-k={k} role="option" aria-selected={isSel}
                onMouseDown={(e) => e.preventDefault()} onMouseMove={() => { if (k !== active) setActive(k) }} onClick={() => pick(k)}
                className={"flex cursor-pointer items-center justify-between gap-6 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-[15px] transition-colors "
                  + (isAct ? "bg-white/[.07] " : "")
                  + (o.value === "" ? "text-muted-foreground/70" : isSel ? "text-accent" : "text-foreground")}>
                {o.label}
                {isSel && o.value !== "" ? <Check /> : <span className="w-4" />}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
