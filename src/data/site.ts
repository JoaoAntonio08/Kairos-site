// Configuração central. Deixe "" onde ainda não existir canal oficial: nenhum link é criado.
export const CONTACT = {
  email: "kairos.interactiveoficial@gmail.com",
  instagram: "https://www.instagram.com/kairosint__",
  linkedin: "", github: "", youtube: "",
}
export const CONTACT_LABELS: Record<keyof typeof CONTACT, string> = { email: "E-mail", instagram: "Instagram", linkedin: "LinkedIn", github: "GitHub", youtube: "YouTube" }
export const contactHref = (k: keyof typeof CONTACT, v: string) => (k === "email" ? `mailto:${v}` : v)
// Vídeo oficial para o fundo do hero (mp4). Vazio = só as partículas.
export const HERO_VIDEO = ""
export const MEDIA = {
  logo: "/media/logo.png",
  lixeiraVideo: "/media/lixeira-video.mp4", econVideo: "/media/econ-video.webm",
  originVideo: "/media/origin-video.mp4", edenfallVideo: "/media/edenfall-video.mp4", aftertimeVideo: "/media/aftertime-video.mp4", hollowVideo: "/media/hollow-video.mp4", requiemVideo: "/media/requiem-video.mp4",
}
export const NAV = [["inicio", "Início"], ["projetos", "Projetos"], ["sobre", "Sobre"], ["contato", "Contato"]] as const
export const STAGES = [
  { id: "dev", label: "01", title: "Desenvolver", text: "Tirar a ideia do papel e transformá-la em algo que existe." },
  { id: "exp", label: "02", title: "Experimentar", text: "Testar cedo, em protótipos pequenos, aceitando que nem tudo funciona." },
  { id: "lea", label: "03", title: "Aprender", text: "Registrar o que deu certo e o que não deu." },
  { id: "evo", label: "04", title: "Evoluir", text: "Concluir, publicar e começar o próximo com mais consistência." },
]
