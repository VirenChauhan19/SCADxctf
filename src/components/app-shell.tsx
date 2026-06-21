"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  Menu,
  LayoutDashboard,
  CalendarDays,
  ListChecks,
  MessageSquare,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "./ui/avatar";
import { LogoMark } from "./ui/logo";

type NavUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

// Icons are used only by the mobile bottom tab bar (the desktop sidebar is numbered).
const ICONS = {
  dashboard: LayoutDashboard,
  calendar: CalendarDays,
  workouts: ListChecks,
  messages: MessageSquare,
  athletes: Users,
  settings: Settings,
} as const;

type NavItem = {
  href: string;
  label: string;
  badge?: number;
  icon?: keyof typeof ICONS;
};

export function AppShell({
  user,
  unreadMessages,
  children,
}: {
  user: NavUser;
  unreadMessages: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sheetClosing, setSheetClosing] = useState(false);

  function openSheet() {
    setSheetClosing(false);
    setMobileOpen(true);
  }
  // Play the slide-down animation, then unmount.
  function closeSheet() {
    setSheetClosing(true);
    window.setTimeout(() => {
      setMobileOpen(false);
      setSheetClosing(false);
    }, 230);
  }

  const isCoach = user.role === "COACH";

  const nav: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/calendar", label: "Calendar", icon: "calendar" },
    { href: "/workouts", label: "Workouts", icon: "workouts" },
    { href: "/messages", label: "Messages", icon: "messages", badge: unreadMessages },
    ...(isCoach
      ? [{ href: "/athletes", label: "Athletes", icon: "athletes" as const }]
      : []),
    { href: "/settings", label: "Settings", icon: "settings" },
  ];

  // Primary destinations for the mobile bottom tab bar (the rest live in "More").
  const bottomNav: NavItem[] = [
    { href: "/dashboard", label: "Home", icon: "dashboard" },
    { href: "/calendar", label: "Calendar", icon: "calendar" },
    { href: "/workouts", label: "Workouts", icon: "workouts" },
    { href: "/messages", label: "Messages", icon: "messages", badge: unreadMessages },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex-1 px-3">
      {nav.map((item, index) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 border-b border-white/10 px-3 py-3 text-sm font-medium transition-colors",
              active
                ? "text-white"
                : "text-slate-400 hover:text-white"
            )}
          >
            <span
              className={cn(
                "absolute inset-y-2 left-0 w-0.5 transition-colors",
                active ? "bg-brand-400" : "bg-transparent group-hover:bg-brand-400/40"
              )}
            />
            <span
              className={cn(
                "w-6 shrink-0 font-mono text-[11px] transition-colors",
                active ? "text-brand-400" : "text-slate-600 group-hover:text-brand-400"
              )}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="flex-1 tracking-tight">{item.label}</span>
            {item.badge ? (
              <span className="inline-flex min-w-[20px] items-center justify-center rounded bg-brand-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  const UserCard = () => (
    <div className="border-t border-white/10 p-3">
      <div className="flex items-center gap-3 px-2 py-2">
        <Avatar name={user.name} seed={user.id} size={36} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">
            {user.name}
          </div>
          <div className="truncate text-xs text-slate-400">
            {isCoach ? "Head Coach" : "Athlete"}
          </div>
        </div>
        <button
          onClick={logout}
          className="rounded-md p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink lg:flex">
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <LogoMark size={34} className="rounded-md" />
          <div className="leading-none">
            <div className="font-display text-base font-bold uppercase tracking-[0.08em] text-white">
              SCAD Atlanta
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-400">
              Distance
            </div>
          </div>
        </div>
        <div className="mt-5 flex-1">
          <p className="mb-2 px-6 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">
            Team Ops
          </p>
          <NavLinks />
        </div>
        <UserCard />
      </aside>

      {/* Mobile top bar (safe-area aware) */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between border-b border-paper-200 bg-white/95 px-4 backdrop-blur lg:hidden"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <Link href="/dashboard" className="flex h-14 items-center gap-2.5">
          <LogoMark size={28} className="rounded-md" />
          <span className="font-display text-base font-bold uppercase tracking-[0.08em] text-ink">
            SCAD Distance
          </span>
        </Link>
        <button
          onClick={openSheet}
          className="flex h-14 items-center"
          aria-label="Open menu"
        >
          <Avatar name={user.name} seed={user.id} size={32} />
        </button>
      </header>

      {/* Mobile "More" sheet: slides up from the bottom, slides down to close */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className={cn(
              "absolute inset-0 bg-ink/50 backdrop-blur-[2px]",
              sheetClosing ? "animate-fade-out" : "animate-fade-in"
            )}
            onClick={closeSheet}
          />
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-paper-200 bg-paper p-3 shadow-soft",
              sheetClosing ? "animate-sheet-down" : "animate-sheet-up"
            )}
            style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
          >
            <button
              onClick={closeSheet}
              aria-label="Close menu"
              className="mx-auto mb-3 mt-1 block h-1.5 w-10 rounded-full bg-paper-200"
            />
            <nav className="space-y-1">
              {nav.map((item) => {
                const Icon = ICONS[item.icon ?? "dashboard"];
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSheet}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition active:scale-[0.98]",
                      active
                        ? "bg-ink text-white"
                        : "text-slate-600 hover:bg-paper-100"
                    )}
                  >
                    <Icon size={19} className={cn(active && "text-brand-400")} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge ? (
                      <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1.5 text-[11px] font-semibold text-white">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    ) : active ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                    ) : null}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-paper-200 bg-white p-3">
              <Avatar name={user.name} seed={user.id} size={40} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-ink">
                  {user.name}
                </div>
                <div className="text-xs text-slate-500">
                  {isCoach ? "Head Coach" : "Athlete"}
                </div>
              </div>
              <button onClick={logout} className="btn-outline px-3 py-2 text-xs">
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom tab bar: floating, rounded, icon-driven */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 px-3 lg:hidden"
        style={{ paddingBottom: "calc(0.7rem + env(safe-area-inset-bottom))" }}
      >
        <nav className="mx-auto flex max-w-md items-stretch gap-1 rounded-2xl border border-paper-200 bg-white/80 p-1.5 shadow-soft backdrop-blur-xl">
          {bottomNav.map((item) => {
            const Icon = ICONS[item.icon ?? "dashboard"];
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-semibold transition active:scale-95",
                  active
                    ? "bg-ink text-white shadow-sm"
                    : "text-slate-500 hover:text-ink"
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.4 : 2}
                  className={cn(active && "text-brand-400")}
                />
                <span>{item.label}</span>
                {item.badge ? (
                  <span className="absolute right-2 top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
          <button
            onClick={openSheet}
            className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-semibold text-slate-500 transition hover:text-ink active:scale-95"
            aria-label="More"
          >
            <Menu size={20} />
            <span>More</span>
          </button>
        </nav>
      </div>

      {/* Main content */}
      <main className="lg:ml-64">
        <div
          key={pathname}
          className="mx-auto w-full max-w-6xl animate-fade-in px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </div>
      </main>
    </div>
  );
}
