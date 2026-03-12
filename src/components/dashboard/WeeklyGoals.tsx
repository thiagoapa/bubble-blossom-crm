import type { Contact } from "@/hooks/useContacts";

const WEEKLY_GOALS = {
  contacts: 25,
  firstMeetings: 3,
  secondMeetings: 2,
} as const;

function isInCurrentWeek(dateStr: string | undefined) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;

  const now = new Date();
  const day = now.getDay(); // 0 = Sun
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return d >= monday && d <= sunday;
}

interface WeeklyGoalsProps {
  contacts: Contact[];
}

export function WeeklyGoals({ contacts }: WeeklyGoalsProps) {
  const contactsThisWeek = contacts.filter((c) =>
    isInCurrentWeek(c.createdAt ?? c.fechaCreacion),
  ).length;

  const firstMeetingsThisWeek = contacts.filter((c) =>
    isInCurrentWeek(c.firstMeetingDate),
  ).length;

  const secondMeetingsThisWeek = contacts.filter((c) =>
    isInCurrentWeek(c.secondMeetingDate),
  ).length;

  const goals = [
    {
      label: "Contactos nuevos",
      current: contactsThisWeek,
      target: WEEKLY_GOALS.contacts,
    },
    {
      label: "1ª reuniones (1R)",
      current: firstMeetingsThisWeek,
      target: WEEKLY_GOALS.firstMeetings,
    },
    {
      label: "2ª reuniones (2R)",
      current: secondMeetingsThisWeek,
      target: WEEKLY_GOALS.secondMeetings,
    },
  ];

  return (
    <section
      aria-label="Metas semanales de actividad"
      className="rounded-2xl border border-border/70 bg-background/95 p-4 md:p-5"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Metas semanales
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {goals.map((g) => {
          const ratio = g.target ? Math.min(g.current / g.target, 1) : 0;
          const pct = Math.round(ratio * 100);
          return (
            <div
              key={g.label}
              className="flex flex-col justify-between gap-2 rounded-xl border border-border bg-background px-3.5 py-3"
            >
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {g.label}
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {g.current}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    / {g.target}
                  </span>
                </p>
              </div>
              <div className="mt-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-neutral-900 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {pct}% de la meta semanal
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
