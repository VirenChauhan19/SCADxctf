// Bespoke, track-and-field line icons drawn for this program specifically, so the
// navigation reads as "built by someone who knows running," not a stock icon set.
// One shared geometry (24x24, rounded 1.9 stroke). Animated sub-parts carry an
// `ic-*` class; the hover/active motion lives in globals.css and is automatically
// neutralized by the global prefers-reduced-motion guard.

type IconProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
  /** When provided, the icon is exposed to assistive tech with this label. */
  title?: string;
};

function Icon({
  size = 24,
  strokeWidth = 1.9,
  className,
  title,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/** Dashboard: a 400m track from above with a lone runner on the back straight. */
export function IconTrack(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2.5" y="6.5" width="19" height="11" rx="5.5" />
      <rect x="6.75" y="9.75" width="10.5" height="4.5" rx="2.25" />
      <path d="M12 6.5v3.25" />
      <circle className="ic-lap" cx="7" cy="6.5" r="1.15" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/** Calendar: month grid with today blocked out (it nudges up on hover). */
export function IconCalendar(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3.25v3.5M16 3.25v3.5" />
      <rect
        className="ic-today"
        x="7"
        y="12"
        width="4"
        height="3.5"
        rx="1"
        fill="currentColor"
        stroke="none"
      />
    </Icon>
  );
}

/** Workouts: a coach's stopwatch; the hand sweeps the dial on hover. */
export function IconStopwatch(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9.5 2.5h5" />
      <path d="M12 2.5v3.1" />
      <path d="M18 6l1.3-1.3" />
      <circle cx="12" cy="13" r="7.25" />
      <g className="ic-hand">
        <path d="M12 13l3.4-3" />
      </g>
      <circle cx="12" cy="13" r="0.7" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/** Messages: a speech bubble whose three dots bob like a typing indicator. */
export function IconChat(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 5h10a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-6l-3.5 3.5V15H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z" />
      <g className="ic-typing">
        <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="10" r="1" fill="currentColor" stroke="none" />
        <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
      </g>
    </Icon>
  );
}

/** Athletes: a runner mid-stride; the trailing leg drives back on hover. */
export function IconRunner(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="14.7" cy="4.9" r="2" />
      <path d="M13.4 7.3 11 12" />
      <path d="M13.7 8.2 16.3 8.8 16.9 11.2" />
      <path d="M13.1 8 10.3 9.1" />
      <path d="M11 12 14.2 13.4 14.6 16.6" />
      <g className="ic-stride">
        <path d="M11 12 8.4 14 6.9 16.2" />
      </g>
    </Icon>
  );
}

/** Settings: three sliders whose handles slide on hover. */
export function IconSliders(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
      <g className="ic-sliders">
        <circle cx="16" cy="7" r="2.3" fill="currentColor" stroke="none" />
        <circle cx="9" cy="12" r="2.3" fill="currentColor" stroke="none" />
        <circle cx="15" cy="17" r="2.3" fill="currentColor" stroke="none" />
      </g>
    </Icon>
  );
}
