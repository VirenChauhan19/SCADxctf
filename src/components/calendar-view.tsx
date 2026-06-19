"use client";

import { useMemo, useState } from "react";
import { isSameMonth } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  addDays,
  isSameDay,
  format,
  weekStart,
  weekEnd,
  dayKey,
} from "@/lib/date";
import {
  WORKOUT_TYPE_ORDER,
  workoutMeta,
  statusMeta,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Modal } from "./ui/modal";
import { TypeBadge, StatusBadge } from "./ui/badges";
import { WorkoutFormModal } from "./workout-form-modal";

export type CalEvent = {
  id: string;
  title: string;
  type: string;
  dateISO: string;
  scope: string;
  status?: string | null;
  assignedCount?: number;
  distance?: string | null;
  location?: string | null;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarView({
  events,
  isCoach,
  athletes = [],
  nowISO,
}: {
  events: CalEvent[];
  isCoach: boolean;
  athletes?: { id: string; name: string }[];
  nowISO: string;
}) {
  const now = useMemo(() => new Date(nowISO), [nowISO]);
  const [month, setMonth] = useState(() => startOfMonth(now));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addDate, setAddDate] = useState<string | null>(null);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    for (const e of events) {
      const k = dayKey(e.dateISO);
      const arr = map.get(k) ?? [];
      arr.push(e);
      map.set(k, arr);
    }
    return map;
  }, [events]);

  const days = useMemo(() => {
    const gridStart = weekStart(startOfMonth(month));
    const gridEnd = weekEnd(endOfMonth(month));
    const out: Date[] = [];
    let d = gridStart;
    while (d <= gridEnd) {
      out.push(d);
      d = addDays(d, 1);
    }
    return out;
  }, [month]);

  const selectedEvents = selectedDay
    ? (eventsByDay.get(selectedDay) ?? []).slice().sort((a, b) => a.dateISO.localeCompare(b.dateISO))
    : [];

  return (
    <div>
      {/* controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-ink">{format(month, "MMMM yyyy")}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-outline px-2.5 py-1.5"
            onClick={() => setMonth(startOfMonth(now))}
          >
            Today
          </button>
          <div className="flex overflow-hidden rounded-lg border border-slate-300">
            <button
              className="px-2 py-1.5 text-slate-600 transition hover:bg-slate-100"
              onClick={() => setMonth(addDays(startOfMonth(month), -1))}
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="border-l border-slate-300 px-2 py-1.5 text-slate-600 transition hover:bg-slate-100"
              onClick={() => setMonth(startOfMonth(addDays(endOfMonth(month), 1)))}
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* legend */}
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1">
        {WORKOUT_TYPE_ORDER.map((t) => {
          const m = workoutMeta(t);
          return (
            <span key={t} className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <span className={cn("h-2 w-2 rounded-full", m.dot)} />
              {m.label}
            </span>
          );
        })}
      </div>

      {/* grid */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400"
            >
              <span className="hidden sm:inline">{w}</span>
              <span className="sm:hidden">{w[0]}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d) => {
            const k = dayKey(d);
            const dayEvents = (eventsByDay.get(k) ?? [])
              .slice()
              .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
            const inMonth = isSameMonth(d, month);
            const today = isSameDay(d, now);
            return (
              <button
                key={k}
                onClick={() => setSelectedDay(k)}
                className={cn(
                  "group relative min-h-[78px] border-b border-r border-slate-100 p-1.5 text-left align-top transition last:border-r-0 sm:min-h-[104px]",
                  inMonth ? "bg-white hover:bg-slate-50" : "bg-slate-50/50",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                      today
                        ? "bg-ink text-white"
                        : inMonth
                          ? "text-slate-600"
                          : "text-slate-300"
                    )}
                  >
                    {format(d, "d")}
                  </span>
                </div>
                <div className="mt-1 space-y-1">
                  {/* desktop: chips */}
                  <div className="hidden space-y-1 sm:block">
                    {dayEvents.slice(0, 3).map((e) => {
                      const m = workoutMeta(e.type);
                      const done = e.status === "COMPLETED";
                      return (
                        <div
                          key={e.id}
                          className={cn(
                            "flex items-center gap-1 truncate rounded px-1 py-0.5 text-[11px] font-medium ring-1 ring-inset",
                            m.chip
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", m.dot)} />
                          <span className="truncate">{e.title}</span>
                          {done && <CheckCircle2 size={11} className="ml-auto shrink-0" />}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="px-1 text-[10px] font-medium text-slate-400">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                  {/* mobile: dots */}
                  <div className="flex flex-wrap gap-0.5 sm:hidden">
                    {dayEvents.slice(0, 4).map((e) => (
                      <span
                        key={e.id}
                        className={cn("h-1.5 w-1.5 rounded-full", workoutMeta(e.type).dot)}
                      />
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* day modal */}
      <Modal
        open={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? format(selectedDay, "EEEE, MMMM d") : ""}
        size="md"
        footer={
          isCoach ? (
            <button
              className="btn-gold"
              onClick={() => {
                setAddDate(selectedDay);
                setSelectedDay(null);
                setAddOpen(true);
              }}
            >
              <Plus size={16} /> Add workout
            </button>
          ) : undefined
        }
      >
        {selectedEvents.length === 0 ? (
          <p className="py-4 text-sm text-slate-500">Nothing scheduled this day.</p>
        ) : (
          <ul className="space-y-3">
            {selectedEvents.map((e) => (
              <li key={e.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-ink">{e.title}</div>
                  {e.status ? (
                    <StatusBadge status={e.status} />
                  ) : (
                    <TypeBadge type={e.type} />
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  {e.status && <TypeBadge type={e.type} />}
                  {e.distance && <span>{e.distance}</span>}
                  {e.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} /> {e.location}
                    </span>
                  )}
                  {isCoach && (
                    <span>
                      {e.scope === "INDIVIDUAL"
                        ? `${e.assignedCount ?? 0} athlete${e.assignedCount === 1 ? "" : "s"}`
                        : "Whole team"}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      {isCoach && (
        <WorkoutFormModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          athletes={athletes}
          defaultDateISO={addDate ?? undefined}
        />
      )}
    </div>
  );
}
