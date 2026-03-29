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

function buildDayData(year: number, month: number, contacts: Contact[]): Record<string, DayCounts> {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
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
}

function buildWeeks(year: number, month: number, dayData: Record<string, DayCounts>) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startWeekday = new Date(year, month, 1).getDay();
  startWeekday = startWeekday === 0 ? 6 : startWeekday - 1;

  const weeks: (DayCounts | null)[][] = [];
  let currentWeek: (DayCounts | null)[] = [];

  for (let i = 0; i < startWeekday; i++) currentWeek.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    currentWeek.push(dayData[iso]);
    if (currentWeek.length === 7) { weeks.push(currentWeek); currentWeek = []; }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }
  return weeks;
}

function MonthGrid({
  year, month, contacts, onSelectDate, compact = false,
}: {
  year: number; month: number; contacts: Contact[];
  onSelectDate: (date: string) => void; compact?: boolean;
}) {
  const dayData = useMemo(() => buildDayData(year, month, contacts), [year, month, contacts]);
  const weeks = useMemo(() => buildWeeks(year, month, dayData), [year, month, dayData]);
  const today = new Date().toISOString().split("T")[0];
  const totalMonth = Object.values(dayData).reduce((s, d) => s + d.createdCount, 0);

  return (
    <div className={`rounded-xl border border-border/60 bg-background/80 ${compact ? "p-2.5" : "p-4"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`font-semibold text-foreground/80 ${compact ? "text-[11px]" : "text-sm"}`}>
          {MONTH_NAMES[month]}
        </span>
        {totalMonth > 0 && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300">
            {totalMonth}
          </span>
        )}
      </div>

      <div className={`grid grid-cols-7 gap-0.5 text-muted-foreground mb-1 ${compact ? "text-[9px]" : "text-[10px]"}`}>
        {WEEKDAYS.map((d) => <span key={d} className="text-center">{d}</span>)}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            if (!day) return <div key={`${wi}-${di}`} className={compact ? "h-6" : "h-9"} />;
            const hasAny = day.createdCount || day.firstCount || day.secondCount;
            const isToday = day.date === today;
            const total = (day.createdCount || 0) + (day.firstCount || 0) + (day.secondCount || 0);

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => hasAny && onSelectDate(day.date)}
                className={`
                  relative flex flex-col items-center justify-center rounded transition-colors
                  ${compact ? "h-6 text-[9px]" : "h-9 text-[10px]"}
                  ${isToday ? "ring-1 ring-violet-400" : ""}
                  ${hasAny
                    ? "bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-300 cursor-pointer"
                    : "text-muted-foreground/60 cursor-default"
                  }
                `}
              >
                <span className="font-medium">{day.dayNumber}</span>
                {hasAny && <span className="text-[8px] leading-none font-bold">{total}</span>}
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
  const [showYear, setShowYear] = useState(false);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const totalYear = useMemo(() =>
    contacts.filter((c) => (c.createdAt ?? c.fechaCreacion ?? "").startsWith(String(currentYear))).length,
    [contacts, currentYear]
  );

  const monthLabel = now.toLocaleString("pt-BR", { month: "long", year: "numeric" });

  return (
    <section
      aria-label="Calendário de atividade"
      className="rounded-2xl border border-border/70 bg-background/95 p-4 md:p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Calendário de atividade
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {showYear ? `Todos os meses de ${currentYear}` : monthLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showYear && totalYear > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300">
              {totalYear} em {currentYear}
            </span>
          )}
          <button
            onClick={() => setShowYear((v) => !v)}
            className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            {showYear ? "← Mês atual" : "Ver ano todo →"}
          </button>
        </div>
      </div>

      {!showYear && (
        <MonthGrid
          year={currentYear}
          month={currentMonth}
          contacts={contacts}
          onSelectDate={setSelectedDate}
          compact={false}
        />
      )}

      {showYear && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }, (_, i) => (
            <MonthGrid
              key={i}
              year={currentYear}
              month={i}
              contacts={contacts}
              onSelectDate={setSelectedDate}
              compact={true}
            />
          ))}
        </div>
      )}

      <DayDetailsModal
        date={selectedDate}
        contacts={contacts}
        onDeleteContact={onDeleteContact}
        onChangePhase={onChangePhase}
        onOpenChange={(open) => { if (!open) setSelectedDate(null); }}
      />
    </section>
  );
}
