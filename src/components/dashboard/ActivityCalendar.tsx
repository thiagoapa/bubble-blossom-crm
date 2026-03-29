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

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

function MonthGrid({
  year,
  month,
  contacts,
  onSelectDate,
}: {
  year: number;
  month: number;
  contacts: Contact[];
  onSelectDate: (date: string) => void;
}) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1);
  // Convert Sunday=0 to Monday=0
  let startWeekday = firstDayOfMonth.getDay();
  startWeekday = startWeekday === 0 ? 6 : startWeekday - 1;

  const dayData: Record<string, DayCounts> = useMemo(() => {
    const data: Record<string, DayCounts> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      data[iso] = { date: iso, dayNumber: d, createdCount: 0, firstCount: 0, secondCount: 0 };
    }
    contacts.forEach((c) => {
      const createdKey = (c.createdAt ?? c.fechaCreacion) || "";
      if (data[createdKey]) data[createdKey].createdCount += 1;
      if (c.firstMeetingDate && data[c.firstMeetingDate]) data[c.firstMeetingDate].firstCount += 1;
      if (c.secondMeetingDate && data[c.secondMeetingDate]) data[c.secondMeetingDate].secondCount += 1;
    });
    return data;
  }, [contacts, month, year, daysInMonth]);

  const weeks: (DayCounts | null)[][] = [];
  let currentWeek: (DayCounts | null)[] = [];

  for (let i = 0; i < startWeekday; i++) currentWeek.push(null);

  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
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

  const today = new Date().toISOString().split("T")[0];
  const totalMonth = Object.values(dayData).reduce((sum, d) => sum + d.createdCount, 0);

  return (
    <div className="rounded-xl border border-border/60 bg-background/80 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-foreground/80">{MONTH_NAMES[month]}</span>
        {totalMonth > 0 && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300">
            {totalMonth} contatos
          </span>
        )}
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-[9px] text-muted-foreground mb-1">
        {WEEKDAYS.map((d) => (
          <span key={d} className="text-center">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            if (!day) {
              return <div key={`${wi}-${di}`} className="h-8 rounded" />;
            }

            const hasAny = day.createdCount || day.firstCount || day.secondCount;
            const isToday = day.date === today;

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => hasAny && onSelectDate(day.date)}
                className={`
                  relative flex h-8 flex-col items-center justify-center rounded text-[10px] font-medium transition-colors
                  ${isToday ? "ring-1 ring-violet-400" : ""}
                  ${hasAny
                    ? "bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-300 cursor-pointer"
                    : "text-muted-foreground/60 cursor-default"
                  }
                `}
              >
                <span>{day.dayNumber}</span>
                {hasAny ? (
                  <span className="text-[8px] leading-none font-bold">
                    {(day.createdCount || 0) + (day.firstCount || 0) + (day.secondCount || 0)}
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export function ActivityCalendar({ contacts, onDeleteContact, onChangePhase }: ActivityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const now = new Date();
  const currentYear = now.getFullYear();

  const totalYear = useMemo(() => {
    return contacts.filter((c) => {
      const d = c.createdAt ?? c.fechaCreacion ?? "";
      return d.startsWith(String(currentYear));
    }).length;
  }, [contacts, currentYear]);

  return (
    <section
      aria-label="Calendario de actividad"
      className="rounded-2xl border border-border/70 bg-background/95 p-4 md:p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Calendário de atividade
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Todos os meses de {currentYear}
          </p>
        </div>
        {totalYear > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300">
            {totalYear} contatos em {currentYear}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }, (_, i) => (
          <MonthGrid
            key={i}
            year={currentYear}
            month={i}
            contacts={contacts}
            onSelectDate={setSelectedDate}
          />
        ))}
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
