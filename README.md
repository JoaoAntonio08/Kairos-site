# Kairós Interactive — site institucional

Site da **Kairós Interactive**, iniciativa independente de jogos autorais e soluções digitais. O site registra o caminho da iniciativa: o que já foi pensado, o que está sendo construído e o que ainda é só ideia.

## Destaques

- **Hero interativo:** a logo é formada por partículas que reagem ao cursor, sobre uma arte de fundo revelada em cores por um spotlight.
- **Projetos em capítulos:** cada projeto ocupa uma tela cheia, com cor de destaque, tagline, resumo, status e navegação lateral.
- **Scroll suave** com Lenis (respeita `prefers-reduced-motion`).
- **Seções:** Projetos, Sobre, Filosofia (timeline de como trabalhamos) e Contato.
- **Acessibilidade:** link "Ir para o conteúdo", rótulos ARIA e animações desativadas para quem prefere movimento reduzido.

## Stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS v4
- GSAP (timeline), Motion (glass-card) e Lenis (scroll suave)
- Fontes via Fontsource: Archivo, Cinzel e Cormorant Garamond
- Estrutura no padrão shadcn (`src/components/ui`, alias `@/`)

## Como rodar

Requer Node.js 18 ou superior.

```bash
npm install
npm run dev        # desenvolvimento
npm run build      # checagem de tipos + build de produção
npm run single     # build em um único arquivo HTML
npm run preview    # serve o build localmente
```

## Estrutura

```
src/
├── components/
│   ├── chapters.tsx        # seção de projetos em capítulos
│   ├── backdrop.tsx        # fundo dinâmico dos capítulos
│   └── ui/                 # hero, timeline, glass-card e outros
├── data/
│   ├── site.ts             # contatos, mídia, vídeo do hero, navegação
│   └── projects.ts         # projetos e status
├── lib/                    # utilitários e scroll suave
└── assets/                 # imagens importadas pelo código
public/media/               # vídeos, posters e logo
```

## Onde editar

- **Contatos, mídia e vídeo do hero:** `src/data/site.ts`
- **Projetos e status:** `src/data/projects.ts`. Para adicionar um projeto, inclua um item na lista. O status deve refletir apenas informação real.
- **Mídia oficial:** `public/media/`

## Histórico de versões

Veja as [Releases](../../releases) para as notas publicadas.

## Direitos

© Kairós Interactive. Todos os direitos reservados. Os visuais dos projetos são ilustrações conceituais, não capturas de produtos.
