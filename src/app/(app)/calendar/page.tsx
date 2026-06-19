import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { CalendarView, type CalEvent } from "@/components/calendar-view";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isCoach = user.role === "COACH";
  let events: CalEvent[] = [];
  let athletes: { id: string; name: string }[] = [];

  if (isCoach && user.teamId) {
    const workouts = await prisma.workout.findMany({
      where: { teamId: user.teamId },
      include: { _count: { select: { assignments: true } } },
      orderBy: { date: "asc" },
    });
    events = workouts.map((w) => ({
      id: w.id,
      title: w.title,
      type: w.type,
      dateISO: w.date.toISOString(),
      scope: w.scope,
      assignedCount: w._count.assignments,
      distance: w.distance,
      location: w.location,
    }));
    athletes = await prisma.user.findMany({
      where: { teamId: user.teamId, role: "ATHLETE", active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  } else {
    const assignments = await prisma.assignment.findMany({
      where: { athleteId: user.id },
      include: { workout: true },
      orderBy: { workout: { date: "asc" } },
    });
    events = assignments.map((a) => ({
      id: a.id,
      title: a.workout.title,
      type: a.workout.type,
      dateISO: a.workout.date.toISOString(),
      scope: a.workout.scope,
      status: a.status,
      distance: a.workout.distance,
      location: a.workout.location,
    }));
  }

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle={
          isCoach
            ? "Every session on the team schedule, color-coded by type."
            : "Your training schedule at a glance."
        }
      />
      <CalendarView
        events={events}
        isCoach={isCoach}
        athletes={athletes}
        nowISO={new Date().toISOString()}
      />
    </div>
  );
}
