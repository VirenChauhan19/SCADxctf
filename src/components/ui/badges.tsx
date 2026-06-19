import { cn } from "@/lib/utils";
import { workoutMeta, statusMeta } from "@/lib/constants";

export function TypeBadge({
  type,
  className,
  withDot = true,
}: {
  type: string;
  className?: string;
  withDot?: boolean;
}) {
  const m = workoutMeta(type);
  return (
    <span className={cn("badge", m.chip, className)}>
      {withDot && <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />}
      {m.label}
    </span>
  );
}

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const m = statusMeta(status);
  return (
    <span className={cn("badge", m.chip, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

export function Dot({ className }: { className?: string }) {
  return <span className={cn("inline-block h-2 w-2 rounded-full", className)} />;
}
