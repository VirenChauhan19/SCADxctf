"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Users, User, Loader2 } from "lucide-react";
import { WorkoutFormModal, type WorkoutInitial } from "./workout-form-modal";
import { Modal } from "./ui/modal";
import { TypeBadge } from "./ui/badges";
import { EmptyState } from "./ui/empty";
import { workoutMeta } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { format, smartDayLabel } from "@/lib/date";

export type CoachWorkoutRow = WorkoutInitial & {
  total: number;
  completed: number;
};

export function CoachWorkouts({
  workouts,
  athletes,
  nowISO,
}: {
  workouts: CoachWorkoutRow[];
  athletes: { id: string; name: string }[];
  nowISO: string;
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<CoachWorkoutRow | null>(null);
  const [deleting, setDeleting] = useState<CoachWorkoutRow | null>(null);
  const [busy, setBusy] = useState(false);

  const todayKey = format(nowISO, "yyyy-MM-dd");
  const upcoming = workouts
    .filter((w) => format(w.dateISO, "yyyy-MM-dd") >= todayKey)
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const past = workouts
    .filter((w) => format(w.dateISO, "yyyy-MM-dd") < todayKey)
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO));

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await fetch(`/api/workouts/${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const Row = ({ w }: { w: CoachWorkoutRow }) => {
    const pct = w.total ? Math.round((w.completed / w.total) * 100) : 0;
    const isRest = w.type === "REST";
    return (
      <div className="card flex items-center gap-4 p-4">
        <div className="flex w-14 shrink-0 flex-col items-center">
          <span className="text-[11px] font-semibold uppercase text-slate-400">
            {format(w.dateISO, "MMM")}
          </span>
          <span className="text-xl font-bold text-ink">{format(w.dateISO, "d")}</span>
          <span className="text-[11px] text-slate-400">{format(w.dateISO, "EEE")}</span>
        </div>
        <div className={cn("h-12 w-1 shrink-0 rounded-full", workoutMeta(w.type).bar)} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-ink">{w.title}</span>
            <TypeBadge type={w.type} />
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              {w.scope === "INDIVIDUAL" ? <User size={12} /> : <Users size={12} />}
              {w.scope === "INDIVIDUAL"
                ? `${w.athleteIds.length} athlete${w.athleteIds.length === 1 ? "" : "s"}`
                : "Team"}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {[w.distance, w.pace].filter(Boolean).join(" · ") || "No distance set"}
          </div>
          {!isRest && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-slate-500">
                {w.completed}/{w.total} done
              </span>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => setEditing(w)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setDeleting(w)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <button className="btn-gold" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> New workout
        </button>
      </div>

      {workouts.length === 0 ? (
        <EmptyState
          title="No workouts yet"
          description="Create your first session and assign it to the team or specific athletes."
          action={
            <button className="btn-gold" onClick={() => setCreateOpen(true)}>
              <Plus size={16} /> New workout
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Upcoming · {upcoming.length}
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-slate-500">Nothing scheduled ahead.</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((w) => (
                  <Row key={w.id} w={w} />
                ))}
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Earlier
              </h2>
              <div className="space-y-2 opacity-90">
                {past.map((w) => (
                  <Row key={w.id} w={w} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <WorkoutFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        athletes={athletes}
      />
      {editing && (
        <WorkoutFormModal
          open
          onClose={() => setEditing(null)}
          athletes={athletes}
          initial={editing}
        />
      )}
      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Delete workout?"
        size="sm"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setDeleting(null)} disabled={busy}>
              Cancel
            </button>
            <button
              className="btn bg-rose-600 text-white hover:bg-rose-700"
              onClick={confirmDelete}
              disabled={busy}
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          This will remove <span className="font-semibold">{deleting?.title}</span>{" "}
          ({deleting ? smartDayLabel(deleting.dateISO) : ""}) and all athlete responses
          for it. This can&apos;t be undone.
        </p>
      </Modal>
    </div>
  );
}
