import {
  format as dfFormat,
  formatDistanceToNowStrict,
  isToday as dfIsToday,
  isTomorrow as dfIsTomorrow,
  isYesterday as dfIsYesterday,
  isSameDay as dfIsSameDay,
  isSameMonth as dfIsSameMonth,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
} from "date-fns";

type DInput = Date | string | number;
const D = (d: DInput): Date => (d instanceof Date ? d : new Date(d));

// String-tolerant wrappers (date-fns v4 only accepts Date | number).
export function format(d: DInput, fmt: string): string {
  return dfFormat(D(d), fmt);
}
export function isToday(d: DInput): boolean {
  return dfIsToday(D(d));
}
export function isTomorrow(d: DInput): boolean {
  return dfIsTomorrow(D(d));
}
export function isYesterday(d: DInput): boolean {
  return dfIsYesterday(D(d));
}
export function isSameDay(a: DInput, b: DInput): boolean {
  return dfIsSameDay(D(a), D(b));
}
export function isSameMonth(a: DInput, b: DInput): boolean {
  return dfIsSameMonth(D(a), D(b));
}

export function fmtDate(d: DInput): string {
  return dfFormat(D(d), "EEE, MMM d");
}
export function fmtFullDate(d: DInput): string {
  return dfFormat(D(d), "EEEE, MMMM d, yyyy");
}
export function fmtDayMonth(d: DInput): string {
  return dfFormat(D(d), "MMM d");
}
export function fmtTime(d: DInput): string {
  return dfFormat(D(d), "h:mm a");
}
export function fmtWeekday(d: DInput): string {
  return dfFormat(D(d), "EEEE");
}
export function dayKey(d: DInput): string {
  return dfFormat(D(d), "yyyy-MM-dd");
}

export function fmtRelative(d: DInput): string {
  const date = D(d);
  if (dfIsToday(date)) return fmtTime(date);
  if (dfIsYesterday(date)) return "Yesterday";
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export function smartDayLabel(d: DInput): string {
  const date = D(d);
  if (dfIsToday(date)) return "Today";
  if (dfIsTomorrow(date)) return "Tomorrow";
  if (dfIsYesterday(date)) return "Yesterday";
  return fmtDate(date);
}

// Monday-based week for a college training schedule.
export function weekStart(d: DInput): Date {
  return startOfWeek(D(d), { weekStartsOn: 1 });
}
export function weekEnd(d: DInput): Date {
  return endOfWeek(D(d), { weekStartsOn: 1 });
}

export { startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays };
