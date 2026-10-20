# Kairós Interactive — site institucional
React 18 + TypeScript + Vite + Tailwind v4 (estrutura shadcn: `src/components/ui`, alias `@/`).
Dependências de animação: `gsap` (timeline) e `motion` (glass-card).

    npm install
    npm run dev        # desenvolvimento
    npm run build      # checagem de tipos + build de produção
    npm run single     # build em um único HTML

Onde editar: `src/data/site.ts` (contatos, mídia, vídeo do hero), `src/data/projects.ts` (projetos e status).
Mídia oficial: `public/media/`. Para usar os componentes originais, cole-os sobre os arquivos de `src/components/ui/` (mesmos nomes e export default).
