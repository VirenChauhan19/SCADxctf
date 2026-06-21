import { redirect } from "next/navigation";
import { endOfDay } from "date-fns";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toAssignmentDTO } from "@/lib/dto";
import { PageHeader } from "@/components/ui/page-header";
import { CoachWorkouts, type CoachWorkoutRow } from "@/components/coach-workouts";
import { AthleteWorkouts } from "@/components/athlete-workouts";

export const dynamic = "force-dynamic";

export default async function WorkoutsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const nowISO = new Date().toISOString();

  if (user.role === "COACH") {
    const workouts = await prisma.workout.findMany({
      where: { teamId: user.teamId ?? undefined },
      include: {
        assignments: {
          where: { athlete: { active: true } },
          select: { athleteId: true, status: true },
        },
      },
      orderBy: { date: "asc" },
    });
    const athletes = await prisma.user.findMany({
      where: { teamId: user.teamId ?? undefined, role: "ATHLETE", active: true },
      select: { id: true, name: true, mileageGroup: true },
      orderBy: { name: "asc" },
    });

    const rows: CoachWorkoutRow[] = workouts.map((w) => ({
      id: w.id,
      title: w.title,
      type: w.type,
      dateISO: w.date.toISOString(),
      scope: w.scope,
      distance: w.distance,
      pace: w.pace,
      warmup: w.warmup,
      mainSet: w.mainSet,
      cooldown: w.cooldown,
      notes: w.notes,
      location: w.location,
      link: w.link,
      athleteIds: w.assignments.map((a) => a.athleteId),
      total: w.assignments.length,
      completed: w.assignments.filter((a) => a.status === "COMPLETED").length,
    }));

    return (
      <div>
        <PageHeader
          title="Workouts"
          subtitle="Build sessions, assign them, and track completion."
        />
        <CoachWorkouts workouts={rows} athletes={athletes} nowISO={nowISO} />
      </div>
    );
  }

  // Athlete
  const assignmentRows = await prisma.assignment.findMany({
    where: { athleteId: user.id },
    include: { workout: true, feedback: true },
    orderBy: { workout: { date: "asc" } },
  });
  const assignments = assignmentRows.map(toAssignmentDTO);

  const todayEnd = endOfDay(new Date());
  const viewIds = assignmentRows
    .filter((a) => a.status === "ASSIGNED" && a.workout.date <= todayEnd)
    .map((a) => a.id);

  return (
    <div>
      <PageHeader
        title="My Workouts"
        subtitle="Your full training schedule. Tap a session to log how it went."
      />
      <AthleteWorkouts assignments={assignments} viewIds={viewIds} nowISO={nowISO} />
    </div>
  );
}
