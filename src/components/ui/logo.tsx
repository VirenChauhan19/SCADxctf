import { cn } from "@/lib/utils";

// The official SCAD Bees mark (served from /public). Rendered on a clean white
// tile so the full-color bee keeps its contrast on both the dark sidebar/hero
// and light backgrounds.
export function LogoMark({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label="SCAD Bees"
      className={cn(
        "inline-block shrink-0 rounded-xl bg-white ring-1 ring-black/5",
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundImage: "url(/scad-bees.png)",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "82%",
      }}
    />
  );
}

export function Wordmark({
  className,
  subtitle = true,
}: {
  className?: string;
  subtitle?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <div className="leading-tight">
        <div className="text-sm font-bold tracking-tight text-white">
          SCAD Atlanta
        </div>
        {subtitle && (
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-brand-400">
            Distance
          </div>
        )}
      </div>
    </div>
  );
}
