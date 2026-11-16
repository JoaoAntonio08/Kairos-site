// Validação do formulário de contato (RV-15 / PB-15).
// Funções puras: recebem os valores digitados e devolvem dados limpos + mensagens de erro por campo.
// Testadas em tests/validation.test.ts.

export const SUBJECTS = ["Parceria ou colaboração", "Dúvida sobre um projeto", "Sugestão ou feedback", "Outro assunto"] as const
export type Subject = (typeof SUBJECTS)[number]

export interface ContactForm { name: string; email: string; subject: string; message: string; website: string }
export type Field = keyof Omit<ContactForm, "website">
export type Errors = Partial<Record<Field, string>>

export const LIMITS = { name: { min: 3, max: 80 }, email: { max: 120 }, message: { min: 20, max: 1000 } } as const
export const EMPTY: ContactForm = { name: "", email: "", subject: "", message: "", website: "" }

// Letras (com acento), espaço, apóstrofo, ponto e hífen. Ex.: "Ana Maria", "D'Ávila", "João-Pedro".
const NAME_RE = /^[\p{L}][\p{L}\s'.-]*$/u
// usuário@domínio.tld, sem espaços, com pelo menos um ponto no domínio e TLD de 2+ letras.
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i

/** Remove espaços nas pontas e espaços repetidos. Na mensagem, preserva quebras de linha. */
export function clean(form: ContactForm): ContactForm {
  const line = (s: string) => s.replace(/\s+/g, " ").trim()
  return {
    name: line(form.name),
    email: form.email.trim().toLowerCase(), // espaço no meio do e-mail é erro de digitação: não removemos, a validação acusa
    subject: line(form.subject),
    message: form.message.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim(),
    website: form.website.trim(),
  }
}

/** Valida um único campo e devolve a mensagem de erro, ou "" quando está correto. */
export function validateField(field: Field, raw: ContactForm): string {
  const f = clean(raw)
  switch (field) {
    case "name":
      if (!f.name) return "Informe seu nome."
      if (f.name.length < LIMITS.name.min) return `O nome precisa ter pelo menos ${LIMITS.name.min} letras.`
      if (f.name.length > LIMITS.name.max) return `Use no máximo ${LIMITS.name.max} caracteres.`
      if (!NAME_RE.test(f.name)) return "Use apenas letras, espaços, apóstrofo ou hífen."
      return ""
    case "email":
      if (!f.email) return "Informe seu e-mail."
      if (f.email.length > LIMITS.email.max) return "E-mail longo demais."
      if (!EMAIL_RE.test(f.email)) return "Digite um e-mail válido, como nome@exemplo.com."
      return ""
    case "subject":
      return (SUBJECTS as readonly string[]).includes(f.subject) ? "" : "Escolha um assunto."
    case "message":
      if (!f.message) return "Escreva sua mensagem."
      if (f.message.length < LIMITS.message.min) return `Escreva pelo menos ${LIMITS.message.min} caracteres (faltam ${LIMITS.message.min - f.message.length}).`
      if (f.message.length > LIMITS.message.max) return `Use no máximo ${LIMITS.message.max} caracteres.`
      return ""
  }
}

export const FIELDS: Field[] = ["name", "email", "subject", "message"]

/** Valida o formulário inteiro. `ok` só é verdadeiro sem nenhum erro e com o campo-armadilha vazio. */
export function validate(raw: ContactForm): { ok: boolean; errors: Errors; data: ContactForm; spam: boolean } {
  const errors: Errors = {}
  for (const field of FIELDS) {
    const msg = validateField(field, raw)
    if (msg) errors[field] = msg
  }
  const data = clean(raw), spam = data.website !== ""
  return { ok: Object.keys(errors).length === 0 && !spam, errors, data, spam }
}

/** Monta o link mailto: com assunto e corpo já preenchidos (o site não tem servidor para enviar e-mails). */
export function mailtoLink(to: string, d: ContactForm): string {
  const subject = `[Site Kairós] ${d.subject} — ${d.name}`
  const body = `${d.message}\n\n—\nNome: ${d.name}\nE-mail para resposta: ${d.email}\nEnviado pelo formulário do site.`
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
