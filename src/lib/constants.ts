// Shared domain constants. Because SQLite has no native enums, these string
// unions are the single source of truth for roles / types / statuses.

export type Role = "COACH" | "ATHLETE";

export type WorkoutType =
  | "EASY"
  | "WORKOUT"
  | "LONG_RUN"
  | "RACE"
  | "REST"
  | "RECOVERY";

export type WorkoutScope = "TEAM" | "INDIVIDUAL";

export type AssignmentStatus =
  | "ASSIGNED"
  | "VIEWED"
  | "COMPLETED"
  | "SKIPPED"
  | "NEEDS_DISCUSSION";

export type MessageType = "DIRECT" | "ANNOUNCEMENT";

type TypeMeta = {
  label: string;
  short: string;
  /** rounded pill, e.g. legends + cards */
  chip: string;
  /** small color dot */
  dot: string;
  /** solid color, used for the calendar bar / accent stripe */
  bar: string;
  /** soft tinted background + border for detail panels */
  soft: string;
  /** solid text color */
  text: string;
};

export const WORKOUT_TYPES: Record<WorkoutType, TypeMeta> = {
  EASY: {
    label: "Easy Run",
    short: "Easy",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    soft: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
  },
  WORKOUT: {
    label: "Workout",
    short: "Workout",
    chip: "bg-rose-50 text-rose-700 ring-rose-600/20",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
    soft: "bg-rose-50 border-rose-200",
    text: "text-rose-700",
  },
  LONG_RUN: {
    label: "Long Run",
    short: "Long Run",
    chip: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
    dot: "bg-indigo-500",
    bar: "bg-indigo-500",
    soft: "bg-indigo-50 border-indigo-200",
    text: "text-indigo-700",
  },
  RACE: {
    label: "Race Day",
    short: "Race",
    chip: "bg-brand-100 text-brand-800 ring-brand-600/30",
    dot: "bg-brand-500",
    bar: "bg-brand-500",
    soft: "bg-brand-50 border-brand-200",
    text: "text-brand-700",
  },
  RECOVERY: {
    label: "Recovery Run",
    short: "Recovery",
    chip: "bg-teal-50 text-teal-700 ring-teal-600/20",
    dot: "bg-teal-500",
    bar: "bg-teal-500",
    soft: "bg-teal-50 border-teal-200",
    text: "text-teal-700",
  },
  REST: {
    label: "Rest Day",
    short: "Rest",
    chip: "bg-slate-100 text-slate-600 ring-slate-500/20",
    dot: "bg-slate-400",
    bar: "bg-slate-300",
    soft: "bg-slate-50 border-slate-200",
    text: "text-slate-600",
  },
};

export const WORKOUT_TYPE_ORDER: WorkoutType[] = [
  "EASY",
  "WORKOUT",
  "LONG_RUN",
  "RECOVERY",
  "RACE",
  "REST",
];

export function isWorkoutType(v: unknown): v is WorkoutType {
  return typeof v === "string" && v in WORKOUT_TYPES;
}

export function workoutMeta(type: string): TypeMeta {
  return WORKOUT_TYPES[(isWorkoutType(type) ? type : "EASY") as WorkoutType];
}

type StatusMeta = { label: string; chip: string; dot: string };

export const STATUS_META: Record<AssignmentStatus, StatusMeta> = {
  ASSIGNED: {
    label: "Assigned",
    chip: "bg-slate-100 text-slate-600 ring-slate-500/20",
    dot: "bg-slate-400",
  },
  VIEWED: {
    label: "Viewed",
    chip: "bg-sky-50 text-sky-700 ring-sky-600/20",
    dot: "bg-sky-500",
  },
  COMPLETED: {
    label: "Completed",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
  },
  SKIPPED: {
    label: "Skipped",
    chip: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
  },
  NEEDS_DISCUSSION: {
    label: "Need to discuss",
    chip: "bg-rose-50 text-rose-700 ring-rose-600/20",
    dot: "bg-rose-500",
  },
};

export function statusMeta(status: string): StatusMeta {
  return STATUS_META[(status in STATUS_META ? status : "ASSIGNED") as AssignmentStatus];
}

export const ATHLETE_STATUS_OPTIONS: { value: AssignmentStatus; label: string }[] = [
  { value: "COMPLETED", label: "Completed" },
  { value: "SKIPPED", label: "Skipped" },
  { value: "NEEDS_DISCUSSION", label: "Need to discuss" },
];
