"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  SkipForward,
  MessageCircleQuestion,
  Loader2,
  PencilLine,
} from "lucide-react";
import { FeedbackModal } from "./feedback-modal";
import { cn } from "@/lib/utils";
import type { AssignmentDTO } from "@/lib/dto";

const QUICK = [
  {
    status: "COMPLETED",
    label: "Completed",
    icon: Check,
    active: "border-emerald-500 bg-emerald-50 text-emerald-700",
  },
  {
    status: "SKIPPED",
    label: "Skipped",
    icon: SkipForward,
    active: "border-amber-500 bg-amber-50 text-amber-700",
  },
  {
    status: "NEEDS_DISCUSSION",
    label: "Need to discuss",
    icon: MessageCircleQuestion,
    active: "border-rose-500 bg-rose-50 text-rose-700",
  },
] as const;

export function AthleteWorkoutActions({
  assignment,
}: {
  assignment: AssignmentDTO;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const isRest = assignment.workout.type === "REST";
  const status = assignment.status;
  const fb = assignment.feedback;

  async function setStatus(s: string) {
    setBusy(s);
    try {
      await fetch(`/api/assignments/${assignment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: s }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (isRest) {
    return (
      <p className="text-sm text-slate-500">
        Rest day. No need to check in. Recovery is part of the plan.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {QUICK.map((q) => {
          const Icon = q.icon;
          const selected = status === q.status;
          return (
            <button
              key={q.status}
              onClick={() => setStatus(q.status)}
              disabled={busy !== null}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:opacity-60",
                selected
                  ? q.active
                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              {busy === q.status ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Icon size={15} />
              )}
              {q.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
      >
        <PencilLine size={14} />
        {fb ? "Edit post-workout feedback" : "Add post-workout feedback"}
      </button>

      {fb && (
        <div className="rounded-xl border border-paper-200 bg-paper-50 p-3 text-sm">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
            {fb.effort != null && (
              <span>
                <span className="font-semibold text-ink">Effort:</span> {fb.effort}/10
              </span>
            )}
            <span>
              <span className="font-semibold text-ink">Done:</span>{" "}
              {fb.completed ? "Yes" : "No"}
            </span>
          </div>
          {fb.feeling && <p className="mt-1.5 text-slate-700">“{fb.feeling}”</p>}
          {fb.soreness && (
            <p className="mt-1 text-slate-500">Soreness: {fb.soreness}</p>
          )}
        </div>
      )}

      <FeedbackModal
        assignment={assignment}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
