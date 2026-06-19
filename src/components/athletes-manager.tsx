"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Pencil,
  UserMinus,
  Loader2,
  ArrowRight,
  MessageCircleQuestion,
} from "lucide-react";
import { AthleteFormModal, type AthleteEditable } from "./athlete-form-modal";
import { Modal } from "./ui/modal";
import { Avatar } from "./ui/avatar";
import { GroupBadge } from "./paces-card";
import { EmptyState } from "./ui/empty";
import { eventsList } from "@/lib/utils";
import { fmtRelative } from "@/lib/date";

export type RosterAthlete = AthleteEditable & {
  mileageGroup: string | null;
  lrTarget: string | null;
  weekCompleted: number;
  weekTotal: number;
  lastFeedbackISO: string | null;
  needsDiscussion: number;
};

export function AthletesManager({ athletes }: { athletes: RosterAthlete[] }) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<RosterAthlete | null>(null);
  const [removing, setRemoving] = useState<RosterAthlete | null>(null);
  const [busy, setBusy] = useState(false);

  async function confirmRemove() {
    if (!removing) return;
    setBusy(true);
    try {
      await fetch(`/api/athletes/${removing.id}`, { method: "DELETE" });
      setRemoving(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {athletes.length} athlete{athletes.length === 1 ? "" : "s"} on the roster
        </p>
        <button className="btn-gold" onClick={() => setAddOpen(true)}>
          <UserPlus size={16} /> Add athlete
        </button>
      </div>

      {athletes.length === 0 ? (
        <EmptyState
          title="No athletes yet"
          description="Add your runners to start assigning workouts and tracking feedback."
          action={
            <button className="btn-gold" onClick={() => setAddOpen(true)}>
              <UserPlus size={16} /> Add athlete
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {athletes.map((a) => {
            const pct = a.weekTotal
              ? Math.round((a.weekCompleted / a.weekTotal) * 100)
              : 0;
            return (
              <div key={a.id} className="card flex flex-col p-4">
                <div className="flex items-start gap-3">
                  <Avatar name={a.name} seed={a.id} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-ink">{a.name}</div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      {a.mileageGroup ? (
                        <GroupBadge group={a.mileageGroup} />
                      ) : (
                        <span className="text-xs text-slate-500">
                          {a.gradYear ? `Class of ${a.gradYear}` : "Athlete"}
                        </span>
                      )}
                      {a.lrTarget && (
                        <span className="text-xs text-slate-400">{a.lrTarget} mi</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => setEditing(a)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setRemoving(a)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      title="Remove"
                    >
                      <UserMinus size={15} />
                    </button>
                  </div>
                </div>

                {eventsList(a.events).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {eventsList(a.events).map((ev) => (
                      <span
                        key={ev}
                        className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600"
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>This week</span>
                    <span>
                      {a.weekCompleted}/{a.weekTotal}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    {a.needsDiscussion > 0 ? (
                      <span className="inline-flex items-center gap-1 font-medium text-rose-600">
                        <MessageCircleQuestion size={13} />
                        {a.needsDiscussion} to discuss
                      </span>
                    ) : a.lastFeedbackISO ? (
                      <span>Last check-in {fmtRelative(a.lastFeedbackISO)}</span>
                    ) : (
                      <span>No feedback yet</span>
                    )}
                  </div>
                  <Link
                    href={`/athletes/${a.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
                  >
                    View <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AthleteFormModal open={addOpen} onClose={() => setAddOpen(false)} />
      {editing && (
        <AthleteFormModal open onClose={() => setEditing(null)} initial={editing} />
      )}
      <Modal
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="Remove athlete?"
        size="sm"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setRemoving(null)} disabled={busy}>
              Cancel
            </button>
            <button
              className="btn bg-rose-600 text-white hover:bg-rose-700"
              onClick={confirmRemove}
              disabled={busy}
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              Remove
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          <span className="font-semibold">{removing?.name}</span> will be removed from
          the active roster. Their training history is kept and they can be re-added
          later.
        </p>
      </Modal>
    </div>
  );
}
