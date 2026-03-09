import { motion } from "framer-motion";
import { Target, Flame, BarChart2, TrendingUp } from "lucide-react";

interface ProgressHeaderProps {
  weeklyCount: number;
  metaSemanal: number;
  weekProgress: number;
  todayCount: number;
  monthCount: number;
  heatmapDays: Array<{ date: string; count: number }>;
}

export function ProgressHeader({
  weeklyCount,
  metaSemanal,
  weekProgress,
  todayCount,
  monthCount,
  heatmapDays,
}: ProgressHeaderProps) {
  const remaining = Math.max(metaSemanal - weeklyCount, 0);
  const isGoalReached = weeklyCount >= metaSemanal;

  const motivationMsg = isGoalReached
    ? "¡META ALCANZADA! 🎉"
    : remaining <= 5
    ? `¡Solo ${remaining} más! 🔥`
    : remaining <= 15
    ? `¡Faltan ${remaining}, tú puedes! 💪`
    : `${remaining} contactos para la meta 🚀`;

  const maxDayCount = Math.max(...heatmapDays.map((d) => d.count), 1);
  const today = new Date().toISOString().split("T")[0];

  const getHeatOpacity = (count: number) => {
    if (count === 0) return 0.08;
    const ratio = count / maxDayCount;
    return 0.18 + ratio * 0.82;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="glass rounded-2xl shadow-column p-5 w-full relative overflow-hidden"
    >
      {/* Decorative glow blob */}
      <div
        className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary-glow) / 0.18) 0%, transparent 70%)",
        }}
      />

      <div className="flex flex-col gap-4 relative">
        {/* ── Stat chips ── */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Weekly */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/8 border border-primary/18">
            <Target className="w-4 h-4 text-primary" />
            <span className="font-black text-xl text-foreground leading-none">
              {weeklyCount}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              / {metaSemanal} <span className="hidden sm:inline">semana</span>
            </span>
          </div>

          {/* Today */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 border border-orange-100">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="font-bold text-foreground">{todayCount}</span>
            <span className="text-xs text-muted-foreground">hoy</span>
          </div>

          {/* Month */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/6 border border-primary/15">
            <BarChart2 className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground">{monthCount}</span>
            <span className="text-xs text-muted-foreground">mes</span>
          </div>

          {/* Motivation badge */}
          <div className="ml-auto">
            <motion.span
              key={motivationMsg}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`
                inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full
                ${isGoalReached
                  ? "bg-phase-comprador text-white shadow-md"
                  : "pill-gradient text-white shadow-md"
                }
              `}
            >
              <TrendingUp className="w-3 h-3" />
              {motivationMsg}
            </motion.span>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="group cursor-default" title={motivationMsg}>
          <div
            className="relative h-3.5 rounded-full overflow-hidden"
            style={{ background: "hsl(var(--progress-bg))" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${weekProgress}%` }}
              transition={{ duration: 1.1, ease: [0.34, 1.56, 0.64, 1] }}
              className="h-full rounded-full relative"
              style={{
                background: isGoalReached
                  ? "hsl(var(--bubble-comprador))"
                  : "linear-gradient(90deg, hsl(var(--primary-deep)), hsl(var(--primary)), hsl(var(--primary-glow)))",
                boxShadow: "0 0 12px hsl(var(--primary) / 0.45)",
              }}
            >
              {/* Shimmer sweep */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 2.2s linear infinite",
                }}
              />
            </motion.div>

            {/* Milestone ticks */}
            {[10, 20].map((m) => (
              <div
                key={m}
                className="absolute top-0 bottom-0 w-px bg-white/50"
                style={{ left: `${(m / metaSemanal) * 100}%` }}
              />
            ))}
          </div>

          {/* Percentage label */}
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground font-medium">
              {Math.round(weekProgress)}% completado
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              Meta: {metaSemanal}
            </span>
          </div>
        </div>

        {/* ── Heatmap ── */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            Actividad · últimos 30 días
          </p>
          <div className="flex gap-1 flex-wrap">
            {heatmapDays.map((d) => (
              <div
                key={d.date}
                title={`${d.date}: ${d.count} contacto${d.count !== 1 ? "s" : ""}`}
                className={`
                  w-3 h-3 rounded-sm transition-all duration-200 cursor-pointer
                  hover:scale-125 hover:z-10 relative
                  ${d.date === today ? "ring-1 ring-primary ring-offset-1" : ""}
                `}
                style={{
                  background: `hsl(var(--primary) / ${getHeatOpacity(d.count)})`,
                  boxShadow:
                    d.count > 0
                      ? `0 0 4px hsl(var(--primary) / ${getHeatOpacity(d.count) * 0.5})`
                      : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
