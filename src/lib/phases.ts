import type { Phase } from "@/hooks/useContacts";

export interface PhaseConfig {
  key: Phase;
  label: string;
  emoji: string;
  colorClass: string;
  textClass: string;
  headerColor: string;
  bgClass: string;
  borderClass: string;
}

export const PHASES: PhaseConfig[] = [
  {
    key: "novos",
    label: "Novos Contatos",
    emoji: "🟣",
    colorClass: "bg-phase-novos",
    textClass: "text-white",
    headerColor: "#9B6B9B",
    bgClass: "bg-colbg-novos",
    borderClass: "border-phase-novos",
  },
  {
    key: "primeira",
    label: "1R",
    emoji: "🟡",
    colorClass: "bg-phase-primeira",
    textClass: "text-white",
    headerColor: "#FFB347",
    bgClass: "bg-colbg-primeira",
    borderClass: "border-phase-primeira",
  },
  {
    key: "segunda",
    label: "2R",
    emoji: "🟠",
    colorClass: "bg-phase-segunda",
    textClass: "text-white",
    headerColor: "#FF8C42",
    bgClass: "bg-colbg-segunda",
    borderClass: "border-phase-segunda",
  },
  {
    key: "followup",
    label: "Follow-up",
    emoji: "🔵",
    colorClass: "bg-phase-followup",
    textClass: "text-white",
    headerColor: "#6A9EC4",
    bgClass: "bg-colbg-followup",
    borderClass: "border-phase-followup",
  },
  {
    key: "captacao",
    label: "Captação",
    emoji: "🎯",
    colorClass: "bg-phase-captacao",
    textClass: "text-white",
    headerColor: "#a855f7",
    bgClass: "bg-colbg-captacao",
    borderClass: "border-phase-captacao",
  },
  {
    key: "comprador",
    label: "Comprador",
    emoji: "🟢",
    colorClass: "bg-phase-comprador",
    textClass: "text-white",
    headerColor: "#7FB77E",
    bgClass: "bg-colbg-comprador",
    borderClass: "border-phase-comprador",
  },
  {
    key: "enviei_imoveis",
    label: "Enviei Imóveis",
    emoji: "🏘️",
    colorClass: "bg-phase-comprador",
    textClass: "text-white",
    headerColor: "#06b6d4",
    bgClass: "bg-colbg-comprador",
    borderClass: "border-phase-comprador",
  },
  {
    key: "visita_imovel",
    label: "Visita Imóvel",
    emoji: "🏠",
    colorClass: "bg-phase-comprador",
    textClass: "text-white",
    headerColor: "#14b8a6",
    bgClass: "bg-colbg-comprador",
    borderClass: "border-phase-comprador",
  },
  {
    key: "comprou",
    label: "Comprou ✨",
    emoji: "🏆",
    colorClass: "bg-phase-comprador",
    textClass: "text-white",
    headerColor: "#f59e0b",
    bgClass: "bg-colbg-comprador",
    borderClass: "border-phase-comprador",
  },
];

export const PHASE_MAP = Object.fromEntries(PHASES.map((p) => [p.key, p])) as Record<Phase, PhaseConfig>;

// Solo las fases que aparecen como columnas en el pipeline principal
export const PIPELINE_PHASES = PHASES.filter(
  (p) => !["enviei_imoveis", "visita_imovel", "comprou"].includes(p.key)
);
