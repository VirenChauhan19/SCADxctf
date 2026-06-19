"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Eases a number from 0 → value on mount (and when it re-enters the viewport). */
export function CountUp({
  value,
  className,
  suffix = "",
  duration = 750,
}: {
  value: number;
  className?: string;
  suffix?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    let start = 0;
    const run = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      // easeOutCubic
      setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(run);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          raf = requestAnimationFrame(run);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) io.observe(ref.current);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {display}
      {suffix}
    </span>
  );
}

/** A progress bar whose fill grows from 0 → value after mount. */
export function AnimatedBar({
  value,
  className,
  barClassName = "bg-emerald-500",
  height = "h-2",
}: {
  value: number;
  className?: string;
  barClassName?: string;
  height?: string;
}) {
  const [w, setW] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setW(value);
      return;
    }
    const id = requestAnimationFrame(() => setW(value));
    return () => cancelAnimationFrame(id);
  }, [value]);

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-paper-200",
        height,
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-out",
          barClassName
        )}
        style={{ width: `${Math.max(0, Math.min(100, w))}%` }}
      />
    </div>
  );
}
