import { motion } from "framer-motion";
import { Target, Flame, BarChart2 } from "lucide-react";

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

  const motivationMessages = [
    `¡Faltan ${remaining}! Tú puedes 💪`,
    `${remaining} más y llegas a la meta 🚀`,
    `Sigue así, ya casi llegas! 🔥`,
  ];
  const motivationMsg = remaining === 0
    ? "¡META ALCANZADA! 🎉🏆"
    : motivationMessages[Math.min(Math.floor((weeklyCount / metaSemanal) * 3), 2)];

  const maxDayCount = Math.max(...heatmapDays.map((d) => d.count), 1);

  const getHeatIntensity = (count: number) => {
    if (count === 0) return "opacity-10";
    const ratio = count / maxDayCount;
    if (ratio < 0.25) return "opacity-30";
    if (ratio < 0.5) return "opacity-55";
    if (ratio < 0.75) return "opacity-75";
    return "opacity-100";
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="glass rounded-2xl shadow-column p-5 w-full"
    >
      <div className="flex flex-col gap-4">
        {/* Top row: stats */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <span className="font-extrabold text-2xl text-foreground leading-none">
              {weeklyCount}
              <span className="text-sm font-normal text-muted-foreground">/{metaSemanal}</span>
            </span>
            <span className="text-xs text-muted-foreground font-medium">esta semana</span>
          </div>

          <div className="h-5 w-px bg-border" />

          <div className="flex items-center gap-1.5 text-sm">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="font-bold text-foreground">{todayCount}</span>
            <span className="text-muted-foreground text-xs">hoy</span>
          </div>

          <div className="flex items-center gap-1.5 text-sm">
            <BarChart2 className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground">{monthCount}</span>
            <span className="text-muted-foreground text-xs">este mes</span>
          </div>

          <div className="ml-auto">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                isGoalReached
                  ? "bg-phase-comprador text-white"
                  : "bg-secondary text-primary"
              }`}
            >
              {motivationMsg}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div
            className="relative h-4 rounded-full overflow-hidden"
            style={{ backgroundColor: "hsl(var(--progress-bg))" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${weekProgress}%` }}
              transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
              className="h-full rounded-full relative"
              style={{
                background: isGoalReached
                  ? "hsl(var(--bubble-comprador))"
                  : "linear-gradient(90deg, hsl(var(--primary-deep)), hsl(var(--primary-glow)))",
              }}
            >
              {/* Shimmer */}
              <div
                className="absolute inset-0 rounded-full opacity-40"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 2s linear infinite",
                }}
              />
            </motion.div>
            {/* Milestone markers */}
            {[10, 20].map((m) => (
              <div
                key={m}
                className="absolute top-0 bottom-0 w-0.5 bg-white/40"
                style={{ left: `${(m / metaSemanal) * 100}%` }}
              />
            ))}
          </div>
        </div>

        {/* Mini heatmap */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Actividad últimos 30 días
          </p>
          <div className="flex gap-1 flex-wrap">
            {heatmapDays.map((d) => (
              <div
                key={d.date}
                title={`${d.date}: ${d.count} contactos`}
                className={`
                  w-3 h-3 rounded-sm bg-primary transition-all duration-200
                  ${getHeatIntensity(d.count)}
                  ${d.date === today ? "ring-1 ring-primary ring-offset-1" : ""}
                `}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
