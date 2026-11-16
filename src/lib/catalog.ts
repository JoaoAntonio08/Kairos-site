// Lógica do catálogo (busca, filtro por status, ordenação e contagem).
// Funções puras, sem React: recebem dados e devolvem dados. Assim podem ser testadas isoladamente (tests/catalog.test.ts).
import type { Status } from "@/data/projects"

export type StatusFilter = Status | "all"
export type SortMode = "saga" | "az" | "za" | "status"

/** Formato mínimo que um item precisa ter para entrar no catálogo. */
export interface CatalogItem { id: string; name: string; status: Status; description: string; tags?: string[] }

/** Item com a posição original na lista: preserva a numeração (I, II, III...) mesmo depois de filtrar ou ordenar. */
export type Indexed<T> = T & { pos: number }

export const SORT_LABELS: Record<SortMode, string> = { saga: "Ordem original", az: "Nome (A–Z)", za: "Nome (Z–A)", status: "Mais avançados primeiro" }
export const MAX_QUERY = 60

// Peso de cada estado para a ordenação "mais avançados primeiro": Disponível > Em desenvolvimento > Conceito.
const WEIGHT: Record<Status, number> = { on: 3, dev: 2, concept: 1 }

/** Minúsculas, sem acentos e com espaços normalizados: "  Éden  FALL " → "eden fall". */
export function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim()
}

/** Limpa o texto digitado na busca: tira espaços extras e corta no tamanho máximo. */
export function cleanQuery(raw: string): string {
  return raw.replace(/\s+/g, " ").trimStart().slice(0, MAX_QUERY)
}

/** Verdadeiro quando TODAS as palavras da busca aparecem no nome, na descrição ou nas tags do item. */
export function matches(item: CatalogItem, query: string): boolean {
  const words = normalize(query).split(" ").filter(Boolean)
  if (words.length === 0) return true
  const haystack = normalize([item.name, item.description, ...(item.tags ?? [])].join(" "))
  for (const w of words) {
    if (!haystack.includes(w)) return false
  }
  return true
}

/** Quantos itens existem em cada estado (usado nos botões de filtro). */
export function countByStatus(items: CatalogItem[]): Record<StatusFilter, number> {
  const count: Record<StatusFilter, number> = { all: items.length, concept: 0, dev: 0, on: 0 }
  for (const it of items) count[it.status] += 1
  return count
}

/** Ordena uma cópia da lista (nunca altera a original). */
export function sortItems<T extends CatalogItem>(items: Indexed<T>[], mode: SortMode): Indexed<T>[] {
  const list = [...items]
  const byName = (a: T, b: T) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })
  switch (mode) {
    case "az": return list.sort(byName)
    case "za": return list.sort((a, b) => byName(b, a))
    case "status": return list.sort((a, b) => WEIGHT[b.status] - WEIGHT[a.status] || a.pos - b.pos)
    default: return list.sort((a, b) => a.pos - b.pos)
  }
}

/** Pipeline completo: numera → busca → filtra por estado → ordena. */
export function applyCatalog<T extends CatalogItem>(items: T[], opts: { query: string; status: StatusFilter; sort: SortMode }): Indexed<T>[] {
  const indexed = items.map((it, k) => ({ ...it, pos: k + 1 }))
  const found = indexed.filter((it) => matches(it, opts.query) && (opts.status === "all" || it.status === opts.status))
  return sortItems(found, opts.sort)
}

/** Converte um valor salvo (ex.: no localStorage) em opção válida; qualquer valor desconhecido volta ao padrão. */
export function asSort(v: unknown): SortMode { return v === "az" || v === "za" || v === "status" ? v : "saga" }
export function asStatus(v: unknown): StatusFilter { return v === "concept" || v === "dev" || v === "on" ? v : "all" }

/** Frase de resultado, no singular ou no plural. */
export function resultLabel(shown: number, total: number): string {
  if (total === 0) return "Nenhum item nesta aba."
  if (shown === total) return total === 1 ? "1 item" : `${total} itens`
  return `${shown} de ${total} ${total === 1 ? "item" : "itens"}`
}
