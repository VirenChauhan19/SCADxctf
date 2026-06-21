"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import type { AssignmentDTO } from "@/lib/dto";
import { WorkoutDetail } from "./workout-detail";
import { AthleteWorkoutActions } from "./athlete-workout-actions";
import { TypeBadge, StatusBadge } from "./ui/badges";
import { PacesCard } from "./paces-card";
import { CountUp, AnimatedBar } from "./ui/stat";
import { workoutMeta } from "@/lib/constants";
import { cn, type Paces } from "@/lib/utils";
import { fmtFullDate, fmtRelative, format } from "@/lib/date";

export type DayCell = {
  dateISO: string;
  isToday: boolean;
  assignments: AssignmentDTO[];
};

function greeting(nowISO: string) {
  const h = new Date(nowISO).getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function AthleteDashboard({
  firstName,
  coachName,
  nowISO,
  today,
  week,
  viewIds,
  latestAnnouncement,
  unreadCount,
  latestMessage,
  weekStats,
  group,
  lrTarget,
  ezTarget,
  paces,
}: {
  firstName: string;
  coachName: string;
  nowISO: string;
  today: AssignmentDTO[];
  week: DayCell[];
  viewIds: string[];
  latestAnnouncement: { body: string; createdISO: string } | null;
  unreadCount: number;
  latestMessage: { body: string; createdISO: string; fromCoach: boolean } | null;
  weekStats: { completed: number; total: number };
  group: string | null;
  lrTarget: string | null;
  ezTarget: string | null;
  paces: Paces | null;
}) {
  // Mark shown assignments as "viewed" so the coach gets read receipts.
  useEffect(() => {
    if (viewIds.length === 0) return;
    fetch("/api/assignments/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: viewIds }),
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="mb-6 border-b border-paper-200 pb-4">
        <p className="eyebrow">{greeting(nowISO)}</p>
        <h1 className="mt-1 font-display text-3xl font-bold uppercase leading-none tracking-tight text-ink sm:text-[2.5rem] xl:text-5xl">
          {firstName}
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          {fmtFullDate(nowISO)} · Coached by {coachName}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:gap-8">
        {/* main column */}
        <div className="space-y-6 lg:col-span-2 stagger">
          {/* Today */}
          <section>
            <h2 className="eyebrow mb-2">Today&apos;s session</h2>
            {today.length === 0 ? (
              <div className="card p-5 text-sm text-slate-500">
                Nothing scheduled for today. Check your weekly schedule below.
              </div>
            ) : (
              <div className="space-y-4">
                {today.map((a) => (
                  <div key={a.id} className="card overflow-hidden">
                    <div className={cn("h-1.5 w-full", workoutMeta(a.workout.type).bar)} />
                    <div className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-ink">
                              {a.workout.title}
                            </h3>
                            {a.workout.scope === "INDIVIDUAL" && (
                              <span className="badge bg-brand-100 text-brand-800 ring-brand-600/30">
                                For you
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <TypeBadge type={a.workout.type} />
                            <StatusBadge status={a.status} />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <WorkoutDetail workout={a.workout} customNote={a.customNote} />
                      </div>
                      <div className="mt-5 border-t border-slate-100 pt-4">
                        <AthleteWorkoutActions assignment={a} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* This week */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="eyebrow">This week</h2>
              <Link
                href="/workouts"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
              >
                Full schedule <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-7 gap-1.5 stagger">
              {week.map((d) => {
                const primary = d.assignments[0];
                const type = primary?.workout.type ?? null;
                const meta = type ? workoutMeta(type) : null;
                const done = d.assignments.some((a) => a.status === "COMPLETED");
                return (
                  <div
                    key={d.dateISO}
                    className={cn(
                      "rounded-lg border p-2 text-center transition-colors",
                      d.isToday
                        ? "border-ink bg-ink text-white"
                        : "border-paper-200 bg-white hover:border-brand-200"
                    )}
                  >
                    <div
                      className={cn(
                        "text-[10px] font-semibold uppercase",
                        d.isToday ? "text-slate-300" : "text-slate-400"
                      )}
                    >
                      {format(d.dateISO, "EEE")}
                    </div>
                    <div className="font-display text-lg font-bold leading-none">
                      {format(d.dateISO, "d")}
                    </div>
                    <div className="mt-1.5 flex h-4 items-center justify-center">
                      {meta ? (
                        <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
                      ) : (
                        <span className="text-[10px] text-slate-300">·</span>
                      )}
                    </div>
                    <div
                      className={cn(
                        "mt-0.5 truncate text-[10px]",
                        d.isToday ? "text-slate-200" : "text-slate-500"
                      )}
                    >
                      {meta ? meta.short : ""}
                    </div>
                    {done && (
                      <CheckCircle2
                        size={12}
                        className={cn(
                          "mx-auto mt-0.5",
                          d.isToday ? "text-emerald-300" : "text-emerald-500"
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* sidebar */}
        <div className="space-y-6 stagger">
          <PacesCard
            group={group}
            lrTarget={lrTarget}
            ezTarget={ezTarget}
            paces={paces}
          />
          {/* week stat */}
          <div className="card p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
              This week
            </div>
            <div className="mt-2 flex items-end gap-2">
              <span className="font-display text-4xl font-bold leading-none text-ink">
                <CountUp value={weekStats.completed} />
              </span>
              <span className="pb-1 text-sm text-slate-500">
                / {weekStats.total} sessions logged
              </span>
            </div>
            <AnimatedBar
              value={
                weekStats.total
                  ? Math.round((weekStats.completed / weekStats.total) * 100)
                  : 0
              }
              className="mt-3"
            />
          </div>

          {/* announcement */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Latest announcement
              </div>
            </div>
            {latestAnnouncement ? (
              <>
                <p className="mt-2 line-clamp-4 text-sm text-slate-700">
                  {latestAnnouncement.body}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {coachName} · {fmtRelative(latestAnnouncement.createdISO)}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No announcements yet.</p>
            )}
            <Link
              href="/messages"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
            >
              Open messages <ArrowRight size={14} />
            </Link>
          </div>

          {/* messages */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Coach messages
              </div>
              {unreadCount > 0 && (
                <span className="badge bg-brand-500 text-white ring-0">
                  {unreadCount} new
                </span>
              )}
            </div>
            {latestMessage ? (
              <p className="mt-2 line-clamp-3 text-sm text-slate-700">
                <span className="font-medium text-ink">
                  {latestMessage.fromCoach ? `${coachName}: ` : "You: "}
                </span>
                {latestMessage.body}
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                No messages yet. Say hi to your coach.
              </p>
            )}
            <Link
              href="/messages"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
            >
              Open chat <ArrowRight size={14} />
            </Link>
          </div>

          <Link
            href="/calendar"
            className="card card-link flex items-center gap-3 p-5"
          >
            <span className="font-mono text-xs font-semibold text-brand-700">
              CAL
            </span>
            <div>
              <div className="text-sm font-semibold text-ink">Calendar</div>
              <div className="text-xs text-slate-500">See your month at a glance</div>
            </div>
            <ArrowRight size={16} className="ml-auto text-slate-300" />
          </Link>
        </div>
      </div>
    </div>
  );
}
