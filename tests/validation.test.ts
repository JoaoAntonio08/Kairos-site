// Testes da validação do formulário de contato. Rodar com: npm test
import { test } from "node:test"
import assert from "node:assert/strict"
import { clean, EMPTY, mailtoLink, validate, validateField } from "../src/lib/validation.ts"

const OK = { name: "Luana Ferreira", email: "luana@exemplo.com", subject: "Dúvida sobre um projeto", message: "Quando sai a primeira demo de ORIGIN?", website: "" }

test("formulário vazio aponta erro em todos os campos obrigatórios", () => {
  const r = validate(EMPTY)
  assert.equal(r.ok, false)
  assert.deepEqual(Object.keys(r.errors), ["name", "email", "subject", "message"])
})

test("formulário correto passa sem erros", () => {
  const r = validate(OK)
  assert.equal(r.ok, true)
  assert.deepEqual(r.errors, {})
})

test("nome: tamanho mínimo e caracteres permitidos", () => {
  assert.match(validateField("name", { ...OK, name: "Jo" }), /pelo menos 3/)
  assert.match(validateField("name", { ...OK, name: "R2-D2" }), /apenas letras/)
  assert.equal(validateField("name", { ...OK, name: "  João   D'Ávila-Souza " }), "")
})

test("e-mail: formato válido", () => {
  for (const bad of ["luana", "luana@", "luana@exemplo", "lu ana@exemplo.com", "@exemplo.com", "luana@exemplo.c"])
    assert.notEqual(validateField("email", { ...OK, email: bad }), "", bad)
  for (const good of ["luana@exemplo.com", "Luana.F+site@mail.exemplo.com.br"])
    assert.equal(validateField("email", { ...OK, email: good }), "", good)
})

test("assunto precisa ser uma das opções da lista", () => {
  assert.equal(validateField("subject", { ...OK, subject: "Spam" }), "Escolha um assunto.")
})

test("mensagem: mínimo de 20 e máximo de 1000 caracteres", () => {
  assert.match(validateField("message", { ...OK, message: "Oi, tudo bem?" }), /faltam 7/)
  assert.match(validateField("message", { ...OK, message: "a".repeat(1001) }), /no máximo 1000/)
})

test("clean remove espaços extras e padroniza o e-mail", () => {
  const c = clean({ ...OK, name: "  Rafael    Mendes ", email: " Rafael@Exemplo.COM " })
  assert.equal(c.name, "Rafael Mendes")
  assert.equal(c.email, "rafael@exemplo.com")
})

test("campo-armadilha preenchido (robô) bloqueia o envio", () => {
  const r = validate({ ...OK, website: "http://spam.example" })
  assert.equal(r.spam, true)
  assert.equal(r.ok, false)
})

test("mailtoLink codifica assunto e corpo", () => {
  const url = mailtoLink("kairos@exemplo.com", clean(OK))
  assert.ok(url.startsWith("mailto:kairos@exemplo.com?subject="))
  assert.ok(!url.includes(" "))
  assert.ok(decodeURIComponent(url).includes("E-mail para resposta: luana@exemplo.com"))
})
