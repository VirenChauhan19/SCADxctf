import { cn } from "@/lib/utils";

export function CountUp({
  value,
  className,
  suffix = "",
}: {
  value: number;
  className?: string;
  suffix?: string;
}) {
  return (
    <span className={cn("tabular-nums", className)}>
      {value}
      {suffix}
    </span>
  );
}

export function AnimatedBar({
  value,
  className,
  barClassName = "bg-emerald-500",
  height = "h-1.5",
}: {
  value: number;
  className?: string;
  barClassName?: string;
  height?: string;
}) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-sm bg-paper-200",
        height,
        className
      )}
    >
      <div
        className={cn("h-full rounded-sm", barClassName)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
