import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react"
import { CONTACT } from "@/data/site"
import { pill } from "@/lib/ui"
import Select from "@/components/ui/select"
import { EMPTY, FIELDS, LIMITS, mailtoLink, SUBJECTS, validate, validateField, type ContactForm as Form, type Errors, type Field } from "@/lib/validation"

// Formulário de contato (PB-15). O site não tem servidor: ao enviar, os dados validados abrem o aplicativo de
// e-mail do visitante com a mensagem pronta (mailto:). Nada é enviado a terceiros. O rascunho fica só neste navegador.
const DRAFT = "kairos:contato:rascunho"
const LABEL: Record<Field, string> = { name: "Nome", email: "E-mail", subject: "Assunto", message: "Mensagem" }

function loadDraft(): Form {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT) ?? "{}")
    const pick = (k: Field) => (typeof d[k] === "string" ? d[k] : "")
    return { ...EMPTY, name: pick("name"), email: pick("email"), subject: pick("subject"), message: pick("message") }
  } catch { return EMPTY }
}

const input = "w-full rounded-xl border-[1.5px] bg-background px-4 text-[15px] text-foreground outline-none transition placeholder:text-muted-foreground/60 focus-visible:border-accent"
const border = (bad: boolean) => (bad ? " border-[#fb7185]" : " border-line hover:border-muted-foreground")

export default function ContactForm() {
  const [form, setForm] = useState<Form>(loadDraft)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [sent, setSent] = useState(false), [summary, setSummary] = useState("")
  const refs = useRef<Partial<Record<Field, HTMLElement | null>>>({})

  // Salva o rascunho a cada alteração (menos o campo-armadilha).
  useEffect(() => {
    const { website: _, ...draft } = form
    try { Object.values(draft).some(Boolean) ? localStorage.setItem(DRAFT, JSON.stringify(draft)) : localStorage.removeItem(DRAFT) } catch { /* sem armazenamento: segue normalmente */ }
  }, [form])

  if (!CONTACT.email) return null

  const check = (field: Field, next: Form) => setErrors((e) => ({ ...e, [field]: validateField(field, next) || undefined }))

  const set = (field: keyof Form, value: string) => {
    const next = { ...form, [field]: value }
    setForm(next); setSent(false)
    if (field !== "website" && (touched[field] || errors[field])) check(field, next) // corrige o erro enquanto digita
  }
  const change = (field: keyof Form) => (ev: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(field, ev.target.value)
  const blur = (field: Field) => () => { setTouched((t) => ({ ...t, [field]: true })); check(field, form) }

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    const r = validate(form)
    setErrors(r.errors); setTouched({ name: true, email: true, subject: true, message: true })
    if (r.spam) return // robô preencheu o campo escondido: ignora em silêncio
    if (!r.ok) {
      const bad = FIELDS.filter((f) => r.errors[f])
      setSummary(bad.length === 1 ? `Corrija o campo ${LABEL[bad[0]]}.` : `Corrija os ${bad.length} campos destacados: ${bad.map((f) => LABEL[f]).join(", ")}.`)
      refs.current[bad[0]]?.focus()
      return
    }
    setSummary(""); setSent(true)
    window.location.href = mailtoLink(CONTACT.email, r.data)
    setForm(EMPTY); setTouched({}); setErrors({})
  }

  const err = (f: Field) => (touched[f] ? errors[f] : undefined)
  const a11y = (f: Field) => ({ id: "cf-" + f, name: f, "aria-invalid": !!err(f), "aria-describedby": `cf-${f}-msg`, ref: (el: HTMLInputElement & HTMLTextAreaElement) => { refs.current[f] = el } })
  const Msg = ({ f, hint }: { f: Field; hint?: string }) => (
    <p id={`cf-${f}-msg`} className={"mt-1.5 min-h-[18px] text-[12.5px] " + (err(f) ? "text-[#fb7185]" : "text-muted-foreground")}>{err(f) ?? hint ?? ""}</p>
  )
  const len = form.message.trim().length

  return (
    <form noValidate onSubmit={submit} aria-labelledby="cf-t" className="grid gap-2 border border-line p-6 sm:p-8">
      <h3 id="cf-t" className="font-head text-xl font-extrabold uppercase tracking-tight">Envie uma mensagem</h3>
      <p className="mb-4 text-sm text-muted-foreground">Os campos marcados com * são obrigatórios. Ao enviar, abrimos o seu aplicativo de e-mail com a mensagem pronta.</p>

      {summary && <p role="alert" className="mb-2 rounded-xl border border-[#fb7185]/50 bg-[#fb7185]/10 px-4 py-3 text-sm text-[#fecdd3]">{summary}</p>}
      {sent && <p role="status" className="mb-2 rounded-xl border border-[#4ade80]/50 bg-[#4ade80]/10 px-4 py-3 text-sm text-[#bbf7d0]">Mensagem pronta! Confira o seu aplicativo de e-mail e toque em enviar. Se nada abriu, escreva para {CONTACT.email}.</p>}

      <div className="grid gap-x-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="mb-1.5 block text-[12px] uppercase tracking-[.14em] text-muted-foreground">Nome *</label>
          <input {...a11y("name")} type="text" autoComplete="name" maxLength={LIMITS.name.max + 20} value={form.name} onChange={change("name")} onBlur={blur("name")} className={input + " h-12" + border(!!err("name"))} />
          <Msg f="name" />
        </div>
        <div>
          <label htmlFor="cf-email" className="mb-1.5 block text-[12px] uppercase tracking-[.14em] text-muted-foreground">E-mail *</label>
          <input {...a11y("email")} type="email" inputMode="email" autoComplete="email" maxLength={LIMITS.email.max + 20} placeholder="nome@exemplo.com" value={form.email} onChange={change("email")} onBlur={blur("email")} className={input + " h-12" + border(!!err("email"))} />
          <Msg f="email" />
        </div>
      </div>

      <div>
        <label htmlFor="cf-subject" className="mb-1.5 block text-[12px] uppercase tracking-[.14em] text-muted-foreground">Assunto *</label>
        <Select id="cf-subject" value={form.subject} onChange={(v) => set("subject", v)} onBlur={blur("subject")}
          options={[{ value: "", label: "Selecione um assunto…" }, ...SUBJECTS.map((s) => ({ value: s, label: s }))]}
          invalid={!!err("subject")} describedBy="cf-subject-msg" buttonRef={(el) => { refs.current.subject = el }}
          className={input + " h-12" + border(!!err("subject"))} />
        <Msg f="subject" />
      </div>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <label htmlFor="cf-message" className="block text-[12px] uppercase tracking-[.14em] text-muted-foreground">Mensagem *</label>
          <span aria-hidden className={"text-[12px] tabular-nums " + (len > LIMITS.message.max ? "text-[#fb7185]" : "text-muted-foreground")}>{len} / {LIMITS.message.max}</span>
        </div>
        <textarea {...a11y("message")} rows={5} value={form.message} onChange={change("message")} onBlur={blur("message")} className={input + " min-h-[140px] resize-y py-3" + border(!!err("message"))} />
        <Msg f="message" hint={`Entre ${LIMITS.message.min} e ${LIMITS.message.max} caracteres.`} />
      </div>

      {/* Campo-armadilha: invisível para pessoas; robôs costumam preenchê-lo. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="cf-website">Não preencha este campo</label>
        <input id="cf-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={change("website")} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <button type="submit" className={pill + " border-accent bg-accent text-black hover:bg-foreground"}>Enviar mensagem</button>
        <p className="text-[12px] text-muted-foreground">O rascunho fica salvo apenas neste navegador.</p>
      </div>
    </form>
  )
}
