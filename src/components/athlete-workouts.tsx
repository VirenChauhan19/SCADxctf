"use client";

import { useEffect } from "react";
import type { AssignmentDTO } from "@/lib/dto";
import { WorkoutDetail } from "./workout-detail";
import { AthleteWorkoutActions } from "./athlete-workout-actions";
import { TypeBadge, StatusBadge } from "./ui/badges";
import { EmptyState } from "./ui/empty";
import { workoutMeta } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { format, smartDayLabel } from "@/lib/date";

function Card({ a }: { a: AssignmentDTO }) {
  const isRest = a.workout.type === "REST";
  return (
    <div className="card overflow-hidden">
      <div className={cn("h-1 w-full", workoutMeta(a.workout.type).bar)} />
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              {smartDayLabel(a.workout.dateISO)} · {format(a.workout.dateISO, "MMM d")}
              {a.workout.scope === "INDIVIDUAL" && (
                <span className="badge bg-brand-100 text-brand-800 ring-brand-600/30">
                  For you
                </span>
              )}
            </div>
            <h3 className="mt-1 text-base font-bold text-ink">{a.workout.title}</h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <TypeBadge type={a.workout.type} />
              {!isRest && <StatusBadge status={a.status} />}
            </div>
          </div>
        </div>

        {!isRest && (
          <div className="mt-4">
            <WorkoutDetail workout={a.workout} customNote={a.customNote} compact />
          </div>
        )}
        {isRest && a.workout.notes && (
          <p className="mt-3 text-sm text-slate-500">{a.workout.notes}</p>
        )}

        <div className="mt-4 border-t border-paper-200 pt-4">
          <AthleteWorkoutActions assignment={a} />
        </div>
      </div>
    </div>
  );
}

export function AthleteWorkouts({
  assignments,
  viewIds,
  nowISO,
}: {
  assignments: AssignmentDTO[];
  viewIds: string[];
  nowISO: string;
}) {
  useEffect(() => {
    if (viewIds.length === 0) return;
    fetch("/api/assignments/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: viewIds }),
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayKey = format(nowISO, "yyyy-MM-dd");
  const upcoming = assignments
    .filter((a) => format(a.workout.dateISO, "yyyy-MM-dd") >= todayKey)
    .sort((a, b) => a.workout.dateISO.localeCompare(b.workout.dateISO));
  const past = assignments
    .filter((a) => format(a.workout.dateISO, "yyyy-MM-dd") < todayKey)
    .sort((a, b) => b.workout.dateISO.localeCompare(a.workout.dateISO));

  if (assignments.length === 0) {
    return (
      <EmptyState
        title="No workouts assigned yet"
        description="Your coach hasn't scheduled anything for you. Check back soon."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-center justify-between border-b border-paper-200 pb-2">
          <h2 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.12em] text-ink">
            <span className="h-3.5 w-1 rounded-full bg-brand-500" />
            Upcoming
          </h2>
          <span className="font-mono text-[11px] text-slate-400">
            {String(upcoming.length).padStart(2, "0")}
          </span>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-500">Nothing scheduled ahead right now.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((a) => (
              <Card key={a.id} a={a} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between border-b border-paper-200 pb-2">
            <h2 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.12em] text-ink">
              <span className="h-3.5 w-1 rounded-full bg-slate-300" />
              Earlier
            </h2>
            <span className="font-mono text-[11px] text-slate-400">
              {String(past.length).padStart(2, "0")}
            </span>
          </div>
          <div className="space-y-3">
            {past.map((a) => (
              <Card key={a.id} a={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
