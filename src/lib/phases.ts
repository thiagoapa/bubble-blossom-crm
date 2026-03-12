import type { Phase } from "@/hooks/useContacts";

export interface PhaseConfig {
  key: Phase;
  label: string;
  emoji: string;
  colorClass: string;     // Tailwind bg class for bubbles
  textClass: string;      // Tailwind text class for bubble labels
  headerColor: string;    // hex for column header
  bgClass: string;        // Tailwind bg for column area
  borderClass: string;    // Tailwind border class
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
    key: "comprador",
    label: "Comprador 🏆",
    emoji: "🟢",
    colorClass: "bg-phase-comprador",
    textClass: "text-white",
    headerColor: "#7FB77E",
    bgClass: "bg-colbg-comprador",
    borderClass: "border-phase-comprador",
  },
];

export const PHASE_MAP = Object.fromEntries(PHASES.map((p) => [p.key, p])) as Record<Phase, PhaseConfig>;
