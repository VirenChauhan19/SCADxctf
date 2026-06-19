"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ListChecks,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
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

const ICONS = {
  dashboard: LayoutDashboard,
  calendar: CalendarDays,
  workouts: ListChecks,
  messages: MessageSquare,
  athletes: Users,
  settings: Settings,
};

type NavItem = {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  badge?: number;
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
    <nav className="flex-1 space-y-1 px-3">
      {nav.map((item) => {
        const Icon = ICONS[item.icon];
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-white/10 text-white"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-400" />
            )}
            <Icon
              size={18}
              className={cn(active ? "text-brand-400" : "text-slate-400 group-hover:text-slate-200")}
            />
            <span className="flex-1">{item.label}</span>
            {item.badge ? (
              <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
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
      <div className="flex items-center gap-3 rounded-lg px-2 py-2">
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
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
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
        <div className="flex h-16 items-center gap-2.5 border-b border-white/5 px-5">
          <LogoMark size={38} />
          <div className="leading-none">
            <div className="font-display text-lg font-bold uppercase tracking-wide text-white">
              SCAD Atlanta
            </div>
            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-400">
              Distance
            </div>
          </div>
        </div>
        <div className="mt-4 flex-1">
          <p className="mb-2 px-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Menu
          </p>
          <NavLinks />
        </div>
        <UserCard />
      </aside>

      {/* Mobile top bar (safe-area aware) */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <Link href="/dashboard" className="flex h-14 items-center gap-2.5">
          <LogoMark size={30} />
          <span className="font-display text-base font-bold uppercase tracking-wide text-ink">
            SCAD Distance
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-14 items-center"
          aria-label="Open menu"
        >
          <Avatar name={user.name} seed={user.id} size={32} />
        </button>
      </header>

      {/* Mobile drawer (full menu) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-ink animate-fade-in">
            <div className="flex h-14 items-center justify-between px-4">
              <LogoMark size={32} />
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-300 hover:bg-white/5"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-2 flex-1 overflow-y-auto">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </div>
            <UserCard />
          </div>
        </div>
      )}

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {bottomNav.map((item) => {
          const Icon = ICONS[item.icon];
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition",
                active ? "text-brand-600" : "text-slate-500"
              )}
            >
              <Icon size={21} strokeWidth={active ? 2.4 : 2} />
              <span>{item.label}</span>
              {item.badge ? (
                <span className="absolute right-[calc(50%-1.4rem)] top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium text-slate-500"
          aria-label="More"
        >
          <Menu size={21} />
          <span>More</span>
        </button>
      </nav>

      {/* Main content */}
      <main className="lg:ml-64">
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
