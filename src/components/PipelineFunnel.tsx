import { motion } from "framer-motion";
import type { Contact, Phase } from "@/hooks/useContacts";

interface PipelineFunnelProps {
  contactsByPhase: (fase: Phase) => Contact[];
}

const LEADS_FUNNEL = [
  { key: "novos" as Phase, label: "Novos Contatos", emoji: "🟣", color: "#8b5cf6", bg: "rgba(139,92,246,0.10)", border: "rgba(139,92,246,0.30)", widthPct: 100 },
  { key: "primeira" as Phase, label: "1ª Reunião (1R)", emoji: "🟡", color: "#eab308", bg: "rgba(234,179,8,0.10)", border: "rgba(234,179,8,0.30)", widthPct: 80 },
  { key: "segunda" as Phase, label: "2ª Reunião (2R)", emoji: "🟠", color: "#f97316", bg: "rgba(249,115,22,0.10)", border: "rgba(249,115,22,0.30)", widthPct: 60 },
  { key: "followup" as Phase, label: "Follow-up", emoji: "🔵", color: "#3b82f6", bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.30)", widthPct: 40 },
  { key: "captacao" as const, label: "Captação", emoji: "🎯", color: "#a855f7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.35)", widthPct: 22 },
];

const BUYER_FUNNEL = [
  { key: "comprador" as Phase, label: "Comprador", emoji: "🟢", color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.35)", widthPct: 100 },
  { key: "visita" as const, label: "Visita Imóvel", emoji: "🏠", color: "#14b8a6", bg: "rgba(20,184,166,0.10)", border: "rgba(20,184,166,0.30)", widthPct: 65 },
  { key: "comprou" as const, label: "Comprou ✨", emoji: "🏆", color: "#f59e0b", bg: "rgba(245,158,11,0.13)", border: "rgba(245,158,11,0.40)", widthPct: 35 },
];

function FunnelRow({
  phase, count, convRate, index,
}: {
  phase: { key: string; label: string; emoji: string; color: string; bg: string; border: string; widthPct: number };
  count: number;
  convRate: number | null;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0.6 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 260, damping: 26 }}
      className="flex items-center gap-3 w-full"
    >
      <div className="w-36 text-right shrink-0">
        <span className="text-xs font-medium" style={{ color: phase.color }}>
          {phase.emoji} {phase.label}
        </span>
      </div>
      <div className="flex-1 flex justify-center">
        <div
          className="relative flex items-center justify-center rounded-full h-9"
          style={{ width: `${phase.widthPct}%`, background: phase.bg, border: `1.5px solid ${phase.border}` }}
        >
          <span className="text-sm font-bold" style={{ color: phase.color }}>{count}</span>
        </div>
      </div>
      <div className="w-14 shrink-0">
        {convRate !== null ? (
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{
              color: convRate >= 50 ? "#22c55e" : convRate >= 25 ? "#f97316" : "#ef4444",
              background: convRate >= 50 ? "rgba(34,197,94,0.12)" : convRate >= 25 ? "rgba(249,115,22,0.12)" : "rgba(239,68,68,0.12)",
            }}
          >
            {convRate}%
          </span>
        ) : (
          <span className="text-[10px] text-muted-foreground/50">topo</span>
        )}
      </div>
    </motion.div>
  );
}

export function PipelineFunnel({ contactsByPhase }: PipelineFunnelProps) {
  const counts: Record<string, number> = {
    novos: contactsByPhase("novos").length,
    primeira: contactsByPhase("primeira").length,
    segunda: contactsByPhase("segunda").length,
    followup: contactsByPhase("followup").length,
    captacao: 0,
    comprador: contactsByPhase("comprador").length,
    visita: 0,
    comprou: 0,
  };

  function getConvRate(current: number, prevCount: number | null) {
    if (prevCount === null || prevCount === 0) return null;
    return Math.round((current / prevCount) * 100);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Leads funnel */}
      <section className="rounded-2xl border border-border/70 bg-background/95 p-4 md:p-5">
        <div className="mb-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Funil de Leads</p>
          <p className="text-xs text-muted-foreground mt-0.5">Conversão do primeiro contato ao follow-up</p>
        </div>
        <div className="flex flex-col items-center gap-1.5 w-full">
          {LEADS_FUNNEL.map((phase, i) => (
            <FunnelRow
              key={phase.key}
              phase={phase}
              count={counts[phase.key] ?? 0}
              convRate={getConvRate(counts[phase.key] ?? 0, i > 0 ? counts[LEADS_FUNNEL[i - 1].key] ?? 0 : null)}
              index={i}
            />
          ))}
        </div>
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          % = conversão da fase anterior
        </p>
      </section>

      {/* Buyer funnel */}
      <section className="rounded-2xl border border-border/70 bg-background/95 p-4 md:p-5">
        <div className="mb-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Funil de Compradores</p>
          <p className="text-xs text-muted-foreground mt-0.5">Do comprador qualificado ao negócio fechado</p>
        </div>
        <div className="flex flex-col items-center gap-1.5 w-full">
          {BUYER_FUNNEL.map((phase, i) => (
            <FunnelRow
              key={phase.key}
              phase={phase}
              count={counts[phase.key] ?? 0}
              convRate={getConvRate(counts[phase.key] ?? 0, i > 0 ? counts[BUYER_FUNNEL[i - 1].key] ?? 0 : null)}
              index={i}
            />
          ))}
        </div>
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          % = conversão da fase anterior · Visita e Comprou: fases futuras
        </p>
      </section>
    </div>
  );
}
