import { cn, initials, avatarColor } from "@/lib/utils";

export function Avatar({
  name,
  seed,
  size = 40,
  className,
  ring = false,
}: {
  name: string;
  seed?: string;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  const color = avatarColor(seed ?? name);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none",
        ring && "ring-2 ring-white",
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: Math.round(size * 0.4),
      }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
