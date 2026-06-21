import { MapPin, ExternalLink, Ruler, Gauge, StickyNote } from "lucide-react";
import type { WorkoutDTO } from "@/lib/dto";
import { workoutMeta } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function WorkoutDetail({
  workout,
  customNote,
  compact = false,
}: {
  workout: WorkoutDTO;
  customNote?: string | null;
  compact?: boolean;
}) {
  const meta = workoutMeta(workout.type);
  const segments = [
    { label: "Warm-up", value: workout.warmup },
    { label: "Main set", value: workout.mainSet },
    { label: "Cool-down", value: workout.cooldown },
  ].filter((s) => s.value);

  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      {/* metrics */}
      {(workout.distance || workout.pace) && (
        <div className="flex flex-wrap gap-2">
          {workout.distance && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-paper-100 px-2.5 py-1.5 text-sm font-medium text-slate-700">
              <Ruler size={14} className="text-slate-400" />
              {workout.distance}
            </span>
          )}
          {workout.pace && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-paper-100 px-2.5 py-1.5 text-sm font-medium text-slate-700">
              <Gauge size={14} className="text-slate-400" />
              {workout.pace}
            </span>
          )}
        </div>
      )}

      {customNote && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700">
            <StickyNote size={13} />
            Note just for you
          </div>
          <p className="mt-1 text-sm text-brand-900">{customNote}</p>
        </div>
      )}

      {/* segments */}
      {segments.length > 0 && (
        <div className="space-y-2.5">
          {segments.map((s) => (
            <div key={s.label} className="flex gap-3">
              <div className={cn("mt-0.5 w-1 shrink-0 rounded-full", meta.bar)} />
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {s.label}
                </div>
                <div className="text-sm text-ink whitespace-pre-line">{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {workout.notes && (
        <div className="rounded-xl bg-paper-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Coach notes
          </div>
          <p className="mt-1 text-sm text-slate-700 whitespace-pre-line">
            {workout.notes}
          </p>
        </div>
      )}

      {(workout.location || workout.link) && (
        <div className="flex flex-wrap items-center gap-4 pt-1 text-sm">
          {workout.location && (
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <MapPin size={15} className="text-slate-400" />
              {workout.location}
            </span>
          )}
          {workout.link && (
            <a
              href={workout.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-brand-700 hover:underline"
            >
              <ExternalLink size={15} />
              Attachment / link
            </a>
          )}
        </div>
      )}
    </div>
  );
}
