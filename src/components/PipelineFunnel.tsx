import { motion } from "framer-motion";
import type { Contact, Phase } from "@/hooks/useContacts";

interface PipelineFunnelProps {
  contactsByPhase: (fase: Phase) => Contact[];
  allContacts: Contact[];
}

function FunnelRow({
  label, emoji, color, bg, border, widthPct, count, convRate, isTop, index,
}: {
  label: string; emoji: string; color: string; bg: string; border: string;
  widthPct: number; count: number; convRate: number | null; isTop: boolean; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0.6 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 260, damping: 26 }}
      className="flex items-center gap-3 w-full"
    >
      <div className="w-36 text-right shrink-0">
        <span className="text-xs font-medium" style={{ color }}>
          {emoji} {label}
        </span>
      </div>
      <div className="flex-1 flex justify-center">
        <div
          className="relative flex items-center justify-center rounded-full h-9 transition-all duration-500"
          style={{ width: `${widthPct}%`, background: bg, border: `1.5px solid ${border}` }}
        >
          <span className="text-sm font-bold" style={{ color }}>{count}</span>
        </div>
      </div>
      <div className="w-14 shrink-0">
        {isTop ? (
          <span className="text-[10px] text-muted-foreground/50">topo</span>
        ) : (
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{
              color: (convRate ?? 0) >= 50 ? "#22c55e" : (convRate ?? 0) >= 25 ? "#f97316" : "#ef4444",
              background: (convRate ?? 0) >= 50 ? "rgba(34,197,94,0.12)" : (convRate ?? 0) >= 25 ? "rgba(249,115,22,0.12)" : "rgba(239,68,68,0.12)",
            }}
          >
            {convRate ?? 0}%
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function PipelineFunnel({ contactsByPhase, allContacts }: PipelineFunnelProps) {
  // ── Cumulative counts ─────────────────────────────────────────────────────
  // Everyone starts as novos — total contacts = topo of funnel
  const totalNovos    = allContacts.filter(c => c.fase !== "comprador").length; // exclude buyer funnel
  const inPrimeira    = contactsByPhase("primeira").length;
  const inSegunda     = contactsByPhase("segunda").length;
  const inFollowup    = contactsByPhase("followup").length;
  const inCaptacao    = contactsByPhase("captacao").length;

  // Cumulative: each phase = contacts in that phase + all phases beyond it
  const total1R       = inPrimeira + inSegunda + inFollowup + inCaptacao;
  const total2R       = inSegunda + inFollowup + inCaptacao;
  const totalFollowup = inFollowup + inCaptacao;
  const totalCaptacao = inCaptacao;

  const maxLeads = Math.max(totalNovos, 1);

  function pct(current: number, prev: number): number {
    if (prev === 0) return 0;
    return Math.round((current / prev) * 100);
  }

  const leadsPhases = [
    { label: "Novos Contatos",  emoji: "🟣", color: "#8b5cf6", bg: "rgba(139,92,246,0.10)", border: "rgba(139,92,246,0.30)", count: totalNovos,    prev: null },
    { label: "1ª Reunião (1R)", emoji: "🟡", color: "#eab308", bg: "rgba(234,179,8,0.10)",  border: "rgba(234,179,8,0.30)",  count: total1R,       prev: totalNovos },
    { label: "2ª Reunião (2R)", emoji: "🟠", color: "#f97316", bg: "rgba(249,115,22,0.10)", border: "rgba(249,115,22,0.30)", count: total2R,       prev: total1R },
    { label: "Follow-up",       emoji: "🔵", color: "#3b82f6", bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.30)", count: totalFollowup, prev: total2R },
    { label: "Captação",        emoji: "🎯", color: "#a855f7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.35)", count: totalCaptacao, prev: totalFollowup },
  ];

  // ── Buyer funnel (independent) ────────────────────────────────────────────
  const totalComprador = contactsByPhase("comprador").length;
  const maxBuyer = Math.max(totalComprador, 1);

  const buyerPhases = [
    { label: "Comprador",     emoji: "🟢", color: "#22c55e", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.35)",  count: totalComprador, prev: null },
    { label: "Visita Imóvel", emoji: "🏠", color: "#14b8a6", bg: "rgba(20,184,166,0.10)", border: "rgba(20,184,166,0.30)", count: 0,              prev: totalComprador },
    { label: "Comprou ✨",    emoji: "🏆", color: "#f59e0b", bg: "rgba(245,158,11,0.13)", border: "rgba(245,158,11,0.40)", count: 0,              prev: 0 },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* ── Leads funnel ── */}
      <section className="rounded-2xl border border-border/70 bg-background/95 p-4 md:p-5">
        <div className="mb-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Funil de Leads</p>
          <p className="text-xs text-muted-foreground mt-0.5">Acumulativo — cada fase inclui todos os contatos que chegaram até ela ou além</p>
        </div>
        <div className="flex flex-col items-center gap-1.5 w-full">
          {leadsPhases.map((phase, i) => (
            <FunnelRow
              key={phase.label}
              label={phase.label}
              emoji={phase.emoji}
              color={phase.color}
              bg={phase.bg}
              border={phase.border}
              widthPct={Math.max((phase.count / maxLeads) * 100, 8)}
              count={phase.count}
              convRate={phase.prev !== null ? pct(phase.count, phase.prev) : null}
              isTop={phase.prev === null}
              index={i}
            />
          ))}
        </div>
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          % = conversão da fase anterior
        </p>
      </section>

      {/* ── Buyer funnel ── */}
      <section className="rounded-2xl border border-border/70 bg-background/95 p-4 md:p-5">
        <div className="mb-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Funil de Compradores</p>
          <p className="text-xs text-muted-foreground mt-0.5">Do comprador qualificado ao negócio fechado</p>
        </div>
        <div className="flex flex-col items-center gap-1.5 w-full">
          {buyerPhases.map((phase, i) => (
            <FunnelRow
              key={phase.label}
              label={phase.label}
              emoji={phase.emoji}
              color={phase.color}
              bg={phase.bg}
              border={phase.border}
              widthPct={Math.max((phase.count / maxBuyer) * 100, 8)}
              count={phase.count}
              convRate={phase.prev !== null ? pct(phase.count, phase.prev) : null}
              isTop={phase.prev === null}
              index={i}
            />
          ))}
        </div>
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          % = conversão da fase anterior
        </p>
      </section>
    </div>
  );
}
