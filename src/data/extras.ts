import { ACCENT, PROJECTS, type Project, type Status } from "./projects"

/**
 * PÁGINAS SECUNDÁRIAS ("Extras")
 * --------------------------------------------------------------------------
 * Cada item de EXTRAS vira, automaticamente:
 *   - uma aba no menu do topo (depois do divisor) e um link no rodapé;
 *   - uma página de lista em  /#/<slug>;
 *   - uma PÁGINA INDIVIDUAL para cada item, em  /#/<slug>/<id>.
 *
 * O QUE JÁ ENTRA SOZINHO
 *   Os jogos e softwares de  src/data/projects.ts  (lista ROADMAP) aparecem em "Jogos" e
 *   "Softwares" sem você fazer nada, com a mesma arte, texto, status e vídeo.
 *   Para um jogo/software novo, adicione-o em projects.ts: ele aparece na home e aqui.
 *
 * COMO ADICIONAR ALGO SÓ DOS EXTRAS (demo, ferramenta pequena, boneco, item físico...):
 *   1. (opcional) coloque as imagens em  public/media/extras/
 *   2. copie um bloco de exemplo abaixo, cole em `items: [ ... ]` e edite.
 *      Só id, name, status e description são obrigatórios; o resto é opcional e,
 *      quando existe, ganha seção própria na página individual.
 *
 * COMO CRIAR UMA ABA NOVA: copie um bloco inteiro de categoria e troque os textos.
 * COMO REMOVER UMA ABA: apague o bloco da categoria.
 *
 * Regra do site: `status` só com base em informação real
 *   "concept" = Conceito · "dev" = Em desenvolvimento · "on" = Disponível
 */

export interface ExtraItem {
  id: string                       // único dentro da categoria, sem espaços: vira /#/<slug>/<id>
  name: string
  status: Status
  description: string              // resumo curto (aparece no card)
  image?: string                   // capa: caminho a partir de /public, ex.: "/media/extras/meu-app.jpg"
  tags?: string[]                  // ex.: ["Windows", "v0.2"] ou ["Edição limitada"]
  price?: string                   // ex.: "R$ 129,90"
  link?: { label: string; href: string }  // botão externo na página do item (download, loja...)
  // ---- opcionais: enriquecem a página individual ----
  tagline?: string                 // frase em serifa itálica sob o título
  summary?: string[]               // parágrafos da "Visão geral" (se faltar, usa `description`)
  points?: string[]                // lista numerada de destaques
  saga?: string                    // "Papel na saga" (jogos e colecionáveis)
  note?: string                    // aviso de estado real (aparece em "Estado real")
  video?: string                   // vídeo de fundo do topo da página
  gallery?: { src: string; caption: string }[]  // imagens/capturas
  accent?: string                  // cor de destaque do item (hex). Padrão: a da categoria
}

export interface ExtraCategory {
  slug: string                     // vira a URL: /#/<slug>
  label: string                    // texto da aba no menu
  title: string                    // título grande da página
  intro: string                    // parágrafo abaixo do título
  empty: string                    // texto mostrado enquanto a lista estiver vazia
  accent?: string                  // cor de destaque da categoria (hex)
  unify?: boolean                  // true: os cards da lista usam a cor da categoria, não a de cada item
  numerals?: "roman"               // numera os cards em algarismos romanos (I, II, III...)
  showcase?: { kicker: string; lines: [string, string]; hint: string }  // seção "túnel 3D" (precisa de 3+ itens com imagem)
  items: ExtraItem[]
}

// Converte um projeto de projects.ts em item dos Extras.
const fromProject = (p: Project): ExtraItem => ({
  id: p.id, name: p.name, status: p.status, description: p.summary[0], image: p.wide, video: p.video,
  tags: p.category.split(" · ").slice(p.kind === "game" ? 1 : 0), tagline: p.tagline, summary: p.summary, points: p.points, saga: p.saga, note: p.note,
  gallery: [p.shot ? { src: p.shot, caption: p.shotCap ?? p.name } : { src: p.wide, caption: "Arte ilustrativa, não é captura do jogo" }],
  accent: ACCENT[p.id], link: p.site ? { label: "Ver página do projeto", href: p.site } : undefined,
})
const fromProjects = (kind: Project["kind"]) => PROJECTS.filter((p) => p.kind === kind).map(fromProject)

export const EXTRAS: ExtraCategory[] = [
  {
    slug: "jogos",
    label: "Jogos",
    title: "Jogos",
    intro: "Os cinco jogos da saga, em ordem, e qualquer jogo novo que entrar no caminho. Cada um tem página própria, com o estado real.",
    empty: "Ainda não há nenhum jogo por aqui.",
    accent: "#f2b544",
    unify: true,
    numerals: "roman",
    showcase: { kicker: "A saga", lines: ["Cinco jogos,", "uma história."], hint: "Role para atravessar a saga" },
    items: [
      ...fromProjects("game"),
      // { id: "origin-demo", name: "ORIGIN: Demo", status: "dev", description: "Primeira fase jogável.", image: "/media/extras/origin-demo.jpg",
      //   tags: ["Windows", "Demo"], link: { label: "Baixar demo", href: "https://..." } },
    ],
  },
  {
    slug: "softwares",
    label: "Softwares",
    title: "Softwares",
    intro: "Aplicações web da Kairós que tentam resolver problemas reais. Software está sempre em evolução, então cada um mostra o estado real e ganha versões por aqui.",
    empty: "Ainda não há nenhum software por aqui.",
    accent: "#4ade80",
    items: [
      ...fromProjects("solution"),
      // { id: "exemplo-app", name: "Nome do app", status: "dev", description: "O que ele faz, em uma ou duas frases.", image: "/media/extras/exemplo-app.jpg",
      //   tags: ["Web", "v0.1"], link: { label: "Abrir app", href: "https://..." } },
    ],
  },
  {
    slug: "colecionaveis",
    label: "Colecionáveis",
    title: "Colecionáveis",
    intro: "Bonecos dos personagens da saga e outros itens físicos. Tudo o que aparecer aqui terá o estado real: da ideia ao produto à venda.",
    empty: "Ainda não existe nenhum produto físico. Quando houver um boneco ou item, ele aparece aqui com o estado real.",
    accent: "#fb7185",
    items: [
      // { id: "boneco-aelion", name: "Aelion — Boneco colecionável", status: "concept", description: "Guardião do Jardim de Origem, em versão vinil.",
      //   image: "/media/extras/aelion.jpg", tags: ["Vinil", "Edição limitada"], price: "R$ 129,90", saga: "Um dos guardiões de EDENFALL.",
      //   gallery: [{ src: "/media/extras/aelion.jpg", caption: "Protótipo digital" }], link: { label: "Quero saber mais", href: "https://..." } },
    ],
  },
]

export const findExtra = (slug: string) => EXTRAS.find((c) => c.slug === slug)
