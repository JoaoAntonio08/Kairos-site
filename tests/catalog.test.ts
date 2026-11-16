// Testes da lógica do catálogo. Rodar com: npm test
import { test } from "node:test"
import assert from "node:assert/strict"
import { applyCatalog, asSort, asStatus, cleanQuery, countByStatus, matches, normalize, resultLabel } from "../src/lib/catalog.ts"

const ITEMS = [
  { id: "origin", name: "ORIGIN: Breath of Light", status: "concept" as const, description: "Aventura contemplativa sobre a criação.", tags: ["Aventura 2D"] },
  { id: "edenfall", name: "EDENFALL", status: "dev" as const, description: "Metroidvania após a queda do Jardim.", tags: ["Metroidvania 2D"] },
  { id: "aftertime", name: "AFTERTIME", status: "concept" as const, description: "Eras e linhas temporais corrompidas.", tags: ["Aventura 3D"] },
  { id: "hollow", name: "THE HOLLOW", status: "on" as const, description: "Survival horror num complexo arqueológico.", tags: ["Survival horror 3D"] },
]

test("normalize remove acentos, caixa alta e espaços extras", () => {
  assert.equal(normalize("  Éden   FALL  "), "eden fall")
  assert.equal(normalize("Criação"), "criacao")
})

test("cleanQuery limita o tamanho e remove espaços repetidos", () => {
  assert.equal(cleanQuery("   jardim    queda"), "jardim queda")
  assert.equal(cleanQuery("x".repeat(100)).length, 60)
})

test("matches procura em nome, descrição e tags, ignorando acentos", () => {
  assert.equal(matches(ITEMS[0], "criacao"), true)       // descrição com acento
  assert.equal(matches(ITEMS[1], "metroidvania 2d"), true) // tag
  assert.equal(matches(ITEMS[1], "jardim espada"), false)   // todas as palavras precisam aparecer
  assert.equal(matches(ITEMS[2], ""), true)                // busca vazia aceita tudo
})

test("countByStatus soma os itens de cada estado", () => {
  assert.deepEqual(countByStatus(ITEMS), { all: 4, concept: 2, dev: 1, on: 1 })
  assert.deepEqual(countByStatus([]), { all: 0, concept: 0, dev: 0, on: 0 })
})

test("applyCatalog filtra por estado e mantém a numeração original", () => {
  const r = applyCatalog(ITEMS, { query: "", status: "concept", sort: "saga" })
  assert.deepEqual(r.map((i) => [i.id, i.pos]), [["origin", 1], ["aftertime", 3]])
})

test("applyCatalog combina busca e filtro", () => {
  const r = applyCatalog(ITEMS, { query: "aventura", status: "all", sort: "saga" })
  assert.deepEqual(r.map((i) => i.id), ["origin", "aftertime"])
  assert.equal(applyCatalog(ITEMS, { query: "aventura", status: "on", sort: "saga" }).length, 0)
})

test("ordenações: A–Z, Z–A e mais avançados primeiro", () => {
  const ids = (sort: "az" | "za" | "status") => applyCatalog(ITEMS, { query: "", status: "all", sort }).map((i) => i.id)
  assert.deepEqual(ids("az"), ["aftertime", "edenfall", "origin", "hollow"])
  assert.deepEqual(ids("za"), ["hollow", "origin", "edenfall", "aftertime"])
  assert.deepEqual(ids("status"), ["hollow", "edenfall", "origin", "aftertime"]) // empate: ordem original
})

test("applyCatalog não altera a lista original", () => {
  const copy = JSON.stringify(ITEMS)
  applyCatalog(ITEMS, { query: "", status: "all", sort: "za" })
  assert.equal(JSON.stringify(ITEMS), copy)
})

test("valores salvos inválidos voltam ao padrão", () => {
  assert.equal(asSort("qualquer"), "saga")
  assert.equal(asSort("az"), "az")
  assert.equal(asStatus(null), "all")
  assert.equal(asStatus("dev"), "dev")
})

test("resultLabel no singular e no plural", () => {
  assert.equal(resultLabel(5, 5), "5 itens")
  assert.equal(resultLabel(1, 1), "1 item")
  assert.equal(resultLabel(2, 5), "2 de 5 itens")
  assert.equal(resultLabel(0, 0), "Nenhum item nesta aba.")
})
