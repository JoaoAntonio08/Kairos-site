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
  beats?: string[]                 // história em falas curtas: pausas entre as seções da página (use 3 ou 4)
  sign?: string                    // frase de assinatura, mostrada antes do "Continue"
  sagaTitle?: string               // título da seção "Papel na saga" (padrão: "Um capítulo da história")
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
  portrait?: boolean               // imagens em pé (3:4): cards altos e topo da página com o objeto em destaque
  showcase?: { kicker: string; lines: [string, string]; hint: string }  // seção "túnel 3D" (precisa de 3+ itens com imagem)
  items: ExtraItem[]
}

// Converte um projeto de projects.ts em item dos Extras.
const fromProject = (p: Project): ExtraItem => ({
  id: p.id, name: p.name, status: p.status, description: p.summary[0], image: p.wide, video: p.video,
  tags: p.category.split(" · ").slice(p.kind === "game" ? 1 : 0), tagline: p.tagline, summary: p.summary, points: p.points, saga: p.saga, note: p.note, beats: p.beats, sign: p.sign,
  gallery: [p.shot ? { src: p.shot, caption: p.shotCap ?? p.name } : { src: p.wide, caption: "Arte ilustrativa, não é captura do jogo" }],
  accent: ACCENT[p.id], link: p.site ? { label: "Ver página do projeto", href: p.site } : undefined,
})
const fromProjects = (kind: Project["kind"]) => PROJECTS.filter((p) => p.kind === kind).map(fromProject)


// Colecionáveis são, por ora, só arte conceitual: o estado e o aviso já vêm preenchidos para não prometer o que ainda não existe.
const KAIROS = "#f2b544"
const collectible = (i: Pick<ExtraItem, "id" | "name" | "description" | "image" | "tags" | "accent" | "saga">): ExtraItem => ({
  ...i, status: "concept", sagaTitle: "Peça da saga",
  note: "Ainda não existe produto físico. A imagem é uma arte conceitual e ilustrativa.",
})

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
    intro: "Oito peças pensadas a partir da saga e da Kairós. Por enquanto são artes conceituais: cada item mostra o estado real, da ideia ao produto à venda.",
    empty: "Ainda não existe nenhum produto físico. Quando houver um boneco ou item, ele aparece aqui com o estado real.",
    accent: "#fb7185",
    portrait: true,
    items: [
      collectible({ id: "criador", name: "O Criador: Figure colecionável", description: "O Criador em versão figure: capuz rasgado, lanterna na mão e uma base de cristais.",
        image: "/media/extras/criador.jpg", tags: ["Figure", "1/8"], accent: ACCENT.origin,
        saga: "O Criador que decide realizar a sua última obra, em ORIGIN." }),
      collectible({ id: "jardim", name: "Jardim de Origem: Caneca colecionável", description: "Caneca com a árvore do Jardim de Origem, de antes da queda.",
        image: "/media/extras/jardim.jpg", tags: ["Caneca", "2/8"], accent: ACCENT.edenfall,
        saga: "O Jardim nasceu de uma promessa. Esta é a imagem dele antes da queda." }),
      collectible({ id: "aelion-seraphyn", name: "Aelion e Seraphyn: Estátua colecionável", description: "Os dois guardiões lado a lado, diante de um relógio partido.",
        image: "/media/extras/aelion-seraphyn.jpg", tags: ["Estátua", "3/8"], accent: ACCENT.aftertime,
        saga: "Os guardiões do Jardim de Origem, diante de um tempo que se partiu." }),
      collectible({ id: "complexo", name: "Símbolo do Complexo: Chaveiro colecionável", description: "Medalhão com o símbolo do complexo arqueológico, rachado ao meio.",
        image: "/media/extras/complexo.jpg", tags: ["Chaveiro", "4/8"], accent: ACCENT.hollow,
        saga: "O símbolo de um lugar que talvez devesse ter ficado enterrado." }),
      collectible({ id: "ultimo-dia", name: "O Último Dia: Pôster colecionável", description: "Um viajante de costas, diante de uma cidade e de um céu que se parte.",
        image: "/media/extras/ultimo-dia.jpg", tags: ["Pôster", "5/8"], accent: ACCENT.requiem,
        saga: "A cena que resume o fim: alguém, o mundo e o último dia." }),
      collectible({ id: "mochila", name: "Viajante da Saga: Mochila colecionável", description: "Mochila de viajante em lona e couro envelhecidos, com o símbolo da Kairós.",
        image: "/media/extras/mochila.jpg", tags: ["Mochila", "6/8"], accent: KAIROS,
        saga: "Para quem atravessa a saga inteira, do primeiro mundo ao último dia." }),
      collectible({ id: "trilha", name: "A Saga: Trilha sonora colecionável", description: "Edição em caixa da trilha sonora da saga, com disco ilustrado.",
        image: "/media/extras/trilha.jpg", tags: ["Trilha sonora", "7/8"], accent: KAIROS,
        saga: "A trilha pensada para os cinco jogos, de ORIGIN a REQUIEM." }),
      collectible({ id: "pulseira", name: "Kairós: Pulseira colecionável", description: "Pulseira de couro trançado com a bússola da Kairós em metal envelhecido.",
        image: "/media/extras/pulseira.jpg", tags: ["Pulseira", "8/8"], accent: KAIROS,
        saga: "O símbolo da Kairós, para levar no pulso. O momento certo para agir." }),
      // Para um item novo, copie um bloco acima. Imagem em pé (3:4), em public/media/extras/.
    ],
  },
]

export const findExtra = (slug: string) => EXTRAS.find((c) => c.slug === slug)
