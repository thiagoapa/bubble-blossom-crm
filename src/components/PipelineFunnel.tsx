import { motion } from "framer-motion";
import type { Contact, Phase } from "@/hooks/useContacts";

interface PipelineFunnelProps {
  contactsByPhase: (fase: Phase) => Contact[];
  totalCaptacao?: number; // optional manual input for top of funnel
}

const FUNNEL_PHASES = [
  {
    key: "captacao" as const,
    label: "Captação",
    emoji: "🎯",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.12)",
    border: "rgba(168,85,247,0.35)",
    widthPct: 100,
  },
  {
    key: "novos" as Phase,
    label: "Novos Contatos",
    emoji: "🟣",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.10)",
    border: "rgba(139,92,246,0.30)",
    widthPct: 84,
  },
  {
    key: "primeira" as Phase,
    label: "1ª Reunião (1R)",
    emoji: "🟡",
    color: "#eab308",
    bg: "rgba(234,179,8,0.10)",
    border: "rgba(234,179,8,0.30)",
    widthPct: 68,
  },
  {
    key: "segunda" as Phase,
    label: "2ª Reunião (2R)",
    emoji: "🟠",
    color: "#f97316",
    bg: "rgba(249,115,22,0.10)",
    border: "rgba(249,115,22,0.30)",
    widthPct: 52,
  },
  {
    key: "followup" as Phase,
    label: "Follow-up",
    emoji: "🔵",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.10)",
    border: "rgba(59,130,246,0.30)",
    widthPct: 36,
  },
  {
    key: "comprador" as Phase,
    label: "Comprador",
    emoji: "🟢",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.35)",
    widthPct: 20,
  },
];

export function PipelineFunnel({ contactsByPhase, totalCaptacao = 0 }: PipelineFunnelProps) {
  const counts: Record<string, number> = {
    captacao: totalCaptacao,
    novos: contactsByPhase("novos").length,
    primeira: contactsByPhase("primeira").length,
    segunda: contactsByPhase("segunda").length,
    followup: contactsByPhase("followup").length,
    comprador: contactsByPhase("comprador").length,
  };

  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <section
      aria-label="Embudo de conversión del pipeline"
      className="rounded-2xl border border-border/70 bg-background/95 p-4 md:p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Embudo de conversão
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visualiza el flujo de leads por fase
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 w-full">
        {FUNNEL_PHASES.map((phase, i) => {
          const count = counts[phase.key] ?? 0;
          const prev = i > 0 ? counts[FUNNEL_PHASES[i - 1].key] ?? 0 : null;
          const convRate =
            prev !== null && prev > 0 ? Math.round((count / prev) * 100) : null;

          return (
            <motion.div
              key={phase.key}
              initial={{ opacity: 0, scaleX: 0.7 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: i * 0.07, type: "spring", stiffness: 260, damping: 28 }}
              className="flex items-center gap-3 w-full"
            >
              {/* Left label */}
              <div className="w-36 text-right shrink-0">
                <span className="text-xs font-medium" style={{ color: phase.color }}>
                  {phase.emoji} {phase.label}
                </span>
              </div>

              {/* Funnel bar centered */}
              <div className="flex-1 flex justify-center">
                <div
                  className="relative flex items-center justify-center rounded-lg h-9 transition-all duration-300"
                  style={{
                    width: `${phase.widthPct}%`,
                    background: phase.bg,
                    border: `1.5px solid ${phase.border}`,
                  }}
                >
                  {/* Fill bar based on count */}
                  <div
                    className="absolute left-0 top-0 bottom-0 rounded-lg opacity-30 transition-all duration-500"
                    style={{
                      width: `${Math.min((count / maxCount) * 100, 100)}%`,
                      background: phase.color,
                    }}
                  />
                  <span
                    className="relative z-10 text-sm font-bold"
                    style={{ color: phase.color }}
                  >
                    {count}
                  </span>
                </div>
              </div>

              {/* Right: conversion rate */}
              <div className="w-14 shrink-0">
                {convRate !== null ? (
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{
                      color: convRate >= 50 ? "#22c55e" : convRate >= 25 ? "#f97316" : "#ef4444",
                      background:
                        convRate >= 50
                          ? "rgba(34,197,94,0.12)"
                          : convRate >= 25
                          ? "rgba(249,115,22,0.12)"
                          : "rgba(239,68,68,0.12)",
                    }}
                  >
                    {convRate}%
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">topo</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Connector lines visual hint */}
      <div className="mt-3 flex justify-center">
        <p className="text-[10px] text-muted-foreground">
          % = conversão da fase anterior
        </p>
      </div>
    </section>
  );
}
