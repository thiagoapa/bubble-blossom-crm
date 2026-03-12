import { useMemo, useState } from "react";
import type { Contact } from "@/hooks/useContacts";
import { DayDetailsModal } from "./DayDetailsModal";

interface ActivityCalendarProps {
  contacts: Contact[];
  onDeleteContact: (id: string) => void;
  onChangePhase: (id: string, fase: import("@/hooks/useContacts").Phase) => void;
}

type DayCounts = {
  date: string;
  dayNumber: number;
  createdCount: number;
  firstCount: number;
  secondCount: number;
};

export function ActivityCalendar({ contacts, onDeleteContact, onChangePhase }: ActivityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startWeekday = firstDayOfMonth.getDay(); // 0 = Sun

  const dayData: Record<string, DayCounts> = useMemo(() => {
    const data: Record<string, DayCounts> = {};

    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = new Date(currentYear, currentMonth, d);
      const iso = date.toISOString().split("T")[0];
      data[iso] = {
        date: iso,
        dayNumber: d,
        createdCount: 0,
        firstCount: 0,
        secondCount: 0,
      };
    }

    contacts.forEach((c) => {
      const createdKey = (c.createdAt ?? c.fechaCreacion) || "";
      if (data[createdKey]) {
        data[createdKey].createdCount += 1;
      }
      if (c.firstMeetingDate && data[c.firstMeetingDate]) {
        data[c.firstMeetingDate].firstCount += 1;
      }
      if (c.secondMeetingDate && data[c.secondMeetingDate]) {
        data[c.secondMeetingDate].secondCount += 1;
      }
    });

    return data;
  }, [contacts, currentMonth, currentYear, daysInMonth]);

  const weeks: (DayCounts | null)[][] = [];
  let currentWeek: (DayCounts | null)[] = [];

  // Leading empty cells
  for (let i = 0; i < startWeekday; i += 1) {
    currentWeek.push(null);
  }

  for (let d = 1; d <= daysInMonth; d += 1) {
    const iso = new Date(currentYear, currentMonth, d)
      .toISOString()
      .split("T")[0];
    currentWeek.push(dayData[iso]);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  const monthLabel = now.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <section
      aria-label="Calendario de actividad"
      className="rounded-2xl border border-border/70 bg-background/95 p-4 md:p-5"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Calendario de actividad
        </p>
        <span className="text-xs font-medium text-muted-foreground">{monthLabel}</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-[10px] text-muted-foreground mb-1.5">
        {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
          <span key={d} className="text-center">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-[11px]">
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            if (!day) {
              return (
                <div
                  key={`${wi}-${di}`}
                  className="h-16 rounded-xl border border-transparent bg-transparent"
                />
              );
            }

            const hasAny =
              day.createdCount || day.firstCount || day.secondCount;

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => hasAny && setSelectedDate(day.date)}
                className={`flex h-16 flex-col items-start justify-start rounded-xl border px-2 py-1.5 text-left transition-colors ${
                  hasAny
                    ? "border-border bg-background hover:border-neutral-900/60"
                    : "border-border/60 bg-muted/40 text-muted-foreground"
                }`}
              >
                <span className="text-xs font-medium">{day.dayNumber}</span>
                <div className="mt-0.5 space-y-0.5 text-[10px]">
                  {day.createdCount > 0 && (
                    <p className="flex items-center justify-between gap-1 text-neutral-700">
                      <span>●</span>
                      <span className="font-medium">{day.createdCount}</span>
                    </p>
                  )}
                  {day.firstCount > 0 && (
                    <p className="flex items-center justify-between gap-1 text-sky-700">
                      <span>🔵</span>
                      <span className="font-medium">{day.firstCount}</span>
                    </p>
                  )}
                  {day.secondCount > 0 && (
                    <p className="flex items-center justify-between gap-1 text-emerald-700">
                      <span>🟢</span>
                      <span className="font-medium">{day.secondCount}</span>
                    </p>
                  )}
                </div>
              </button>
            );
          }),
        )}
      </div>

      <DayDetailsModal
        date={selectedDate}
        contacts={contacts}
        onDeleteContact={onDeleteContact}
        onChangePhase={onChangePhase}
        onOpenChange={(open) => {
          if (!open) setSelectedDate(null);
        }}
      />
    </section>
  );
}

