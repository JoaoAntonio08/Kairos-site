import { MEDIA } from "./site"
import econCover from "@/assets/econ-cover.jpg"; import econWide from "@/assets/econ-wide.jpg"; import econShot from "@/assets/econ-shot.jpg"
import lixCover from "@/assets/lixeira-cover.jpg"; import lixWide from "@/assets/lixeira-wide.jpg"; import lixShot from "@/assets/lixeira-shot.jpg"
import siteCover from "@/assets/site-cover.jpg"; import siteWide from "@/assets/site-wide.jpg"
import originFull from "@/assets/origin-full.jpg"
import edenfallFull from "@/assets/edenfall-full.jpg"
import aftertimeFull from "@/assets/aftertime-full.jpg"
import hollowFull from "@/assets/hollow-full.jpg"
import requiemFull from "@/assets/requiem-full.jpg"

export type Status = "concept" | "dev" | "on"
export const STATUS: Record<Status, string> = { concept: "Conceito", dev: "Em desenvolvimento", on: "Disponível" }
export interface Project {
  id: string; kind: "game" | "solution" | "site"; name: string; short: string; category: string; status: Status
  tagline?: string; summary: string[]; points?: string[]; saga?: string; note: string
  // História em pedaços curtos: aparecem como pausas entre as seções da página individual (4 falas + 1 assinatura).
  beats?: string[]; sign?: string
  cover: string; wide: string; video?: string; shot?: string; shotCap?: string; site?: string
}
const GAME_NOTE = "Nome sujeito a alteração. Conceito ainda sem versão jogável; a arte é ilustrativa."
// Ordem do roadmap. Para adicionar um projeto, inclua um item aqui. Status só com base em informação real.
export const ROADMAP: Project[] = [
  { id: "econ", kind: "solution", name: "Econ Radar", short: "Econ Radar", category: "Web · Mercados financeiros", status: "concept", cover: econCover, wide: econWide, video: MEDIA.econVideo,
    shot: econShot, shotCap: "Consultor com IA: os dados exibidos são exemplos de apresentação", site: "https://econradar.zapeu.net",
    summary: ["Proposta de plataforma para acompanhar mercados financeiros."],
    points: ["Consulta de cotações de ativos", "Histórico recente de preços", "Análises produzidas com auxílio de inteligência artificial", "Indicador de 0 a 100 personalizado ao perfil do usuário, como apoio à análise"],
    beats: [
      "O mercado nunca para. Moedas oscilam, commodities reagem, criptomoedas sobem e caem.",
      "Dados são apenas o começo. Muita informação não garante compreensão.",
      "Nada de previsões infalíveis. Só melhores condições para observar, estudar e interpretar.",
      "Acompanhar o mercado é observar seus movimentos. Compreendê-lo exige enxergar além deles."],
    sign: "Enxergue além dos números.",
    note: "O indicador é apoio à análise. Não é recomendação financeira, previsão de mercado nem garantia de resultado." },
  { id: "lixeira", kind: "solution", name: "Lixeira Tech", short: "Lixeira Tech", category: "Web · Sustentabilidade", status: "concept", cover: lixCover, wide: lixWide, video: MEDIA.lixeiraVideo,
    shot: lixShot, shotCap: "Materiais do lixo eletrônico: recuperáveis, críticos e tóxicos", site: "https://lixeiratech.zapeu.net",
    summary: ["Proposta de sistema gamificado de reciclagem de lixo eletrônico, voltado a escolas."],
    points: ["Registro de resíduos eletrônicos", "Uso de pontos de coleta locais", "Dinâmica de incentivos para participantes, ainda em avaliação"],
    beats: [
      "Celulares antigos, baterias e computadores se acumulam em gavetas. Não por descuido, mas porque descartar direito ainda é complicado.",
      "O fim da vida útil de um dispositivo não precisa ser o fim do seu valor.",
      "Dar o destino certo é só parte do desafio. A outra é mudar o olhar sobre aquilo que já não usamos.",
      "Construir o futuro também é assumir a responsabilidade pelo mundo que a tecnologia ajuda a transformar."],
    sign: "A tecnologia também precisa saber como terminar seu ciclo.",
    note: "Faz parte da proposta. Ainda não existe rede de coleta nem sistema de recompensas em funcionamento." },
  { id: "site", kind: "site", name: "Site Kairós Interactive", short: "Site Kairós", category: "Web · Presença institucional", status: "dev", cover: siteCover, wide: siteWide,
    summary: ["A vitrine oficial da Kairós: apresenta a iniciativa, seus projetos e o estado real de cada um."],
    note: "Este site está em construção e é atualizado conforme os projetos avançam." },
  { id: "origin", kind: "game", name: "ORIGIN: Breath of Light", short: "ORIGIN", category: "Jogo · Aventura contemplativa 2D", status: "concept", cover: originFull, wide: originFull, video: MEDIA.originVideo,
    tagline: "Every beginning carries the memory of what came before.",
    summary: ["Uma aventura sobre criação, descoberta e o significado de construir algo que mereça existir. Por meio da exploração, de enigmas e da manipulação da luz, o jogador participa do nascimento de um novo mundo.", "Sem combates tradicionais: exploração, puzzles ambientais e direção de arte atmosférica."],
    saga: "Apresenta as origens do universo e estabelece os fundamentos narrativos dos jogos seguintes.", beats: [
      "Antes de cada horizonte, havia apenas a possibilidade de um novo começo.",
      "Uma luz atravessa o escuro. Um mecanismo desperta. Aqui, explorar é aprender.",
      "Um mundo pode ser vasto e, ainda assim, estar incompleto.",
      "Nem todo começo revela, de imediato, aquilo que está destinado a se tornar."],
    sign: "Toda criação começa com uma possibilidade.",
    note: GAME_NOTE },
  { id: "edenfall", kind: "game", name: "EDENFALL", short: "EDENFALL", category: "Jogo · Metroidvania 2D", status: "concept", cover: edenfallFull, wide: edenfallFull, video: MEDIA.edenfallVideo,
    tagline: "Paradise was never meant to fall.",
    summary: ["Após a queda do Jardim de Origem, os guardiões Aelion e Seraphyn enfrentam as consequências de suas escolhas em um mundo fragmentado.", "Exploração interconectada, habilidades únicas, puzzles ambientais e combates contra criaturas corrompidas."],
    saga: "Apresenta a queda do Jardim de Origem e a promessa de uma restauração que ultrapassa os limites de seu mundo.", beats: [
      "O Jardim nasceu de uma promessa: uma criação que alcançasse a plenitude.",
      "Até no paraíso, uma pergunta pode mudar tudo.",
      "Cada habilidade nova abre um caminho. Cada região guarda um fragmento do Dia Perfeito.",
      "E, em meio aos destroços, permanece uma pergunta: o que ainda pode ser restaurado?"],
    sign: "Toda queda deixa algo para trás.",
    note: GAME_NOTE },
  { id: "aftertime", kind: "game", name: "AFTERTIME", short: "AFTERTIME", category: "Jogo · Aventura cinematográfica 3D", status: "concept", cover: aftertimeFull, wide: aftertimeFull, video: MEDIA.aftertimeVideo,
    tagline: "When time breaks, hope must cross the fragments.",
    summary: ["O Restaurador das Linhas atravessa eras e linhas temporais corrompidas para recuperar os fragmentos que restauram a continuidade do tempo.", "Cada era guarda seus próprios conflitos, segredos e consequências."],
    saga: "Conecta a mitologia dos primeiros jogos a um universo mais amplo e prepara a fase final da saga.", beats: [
      "A queda do Jardim deveria ter ficado naquele mundo. Não ficou.",
      "Passados que nunca deveriam ter existido passam a coexistir com futuros que talvez jamais aconteçam.",
      "Restaurar não significa apagar.",
      "O passado precisa ser compreendido. O presente, enfrentado."],
    sign: "O passado nunca está tão distante quanto parece.",
    note: GAME_NOTE },
  { id: "hollow", kind: "game", name: "THE HOLLOW", short: "THE HOLLOW", category: "Jogo · Survival horror 3D", status: "concept", cover: hollowFull, wide: hollowFull, video: MEDIA.hollowVideo,
    tagline: "Some discoveries should have remained buried.",
    summary: ["Um investigador segue o desaparecimento de pesquisadores até um complexo arqueológico isolado, onde escavações revelaram estruturas que desafiam a história humana.", "Investigação, exploração, enigmas e sobrevivência, com atmosfera realista e tensão crescente."],
    saga: "Aproxima o universo da Kairós Interactive de uma realidade contemporânea e prepara o jogo final.", beats: [
      "Um desaparecimento. Um complexo isolado. Poucas respostas.",
      "Cada descoberta deixa a explicação anterior menos confiável.",
      "Nem toda ameaça precisa ser compreendida para ser perigosa.",
      "Avançar é aceitar que algumas respostas podem tornar tudo pior."],
    sign: "Nem tudo o que está enterrado deveria ser encontrado.",
    note: GAME_NOTE },
  { id: "requiem", kind: "game", name: "REQUIEM: THE LAST DAY", short: "REQUIEM", category: "Jogo · Aventura cinematográfica 3D", status: "concept", cover: requiemFull, wide: requiemFull, video: MEDIA.requiemVideo,
    tagline: "Every ending reveals what truly remains.",
    summary: ["Capítulo final da saga. Quando acontecimentos extraordinários transformam o mundo, a humanidade enfrenta uma crise que ultrapassa qualquer explicação conhecida.", "Visual realista, narrativa intensa e sequências de grande escala."],
    saga: "Converge os mistérios e temas dos quatro jogos anteriores em uma conclusão de escala global.", beats: [
      "O mundo não termina no instante em que tudo começa a desmoronar.",
      "Antigos mistérios voltam à superfície. Tudo o que aconteceu antes conduziu a este momento.",
      "Compreender o passado não significa controlar o desfecho.",
      "O fim de uma história é o momento em que finalmente podemos compreender o que tudo aquilo significou."],
    sign: "Todo fim revela o que realmente permanece.",
    note: GAME_NOTE },
]
// A roda mostra os projetos (sem o próprio site).
export const PROJECTS = ROADMAP.filter((p) => p.kind !== "site")

// Cor de destaque por projeto: usada nos capítulos da home e nas páginas dos Extras.
export const ACCENT: Record<string, string> = { origin: "#f2b544", edenfall: "#f4813a", aftertime: "#60a5fa", hollow: "#a8b0a0", requiem: "#fb7185", econ: "#4ade80", lixeira: "#2dd4bf" }
