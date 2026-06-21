import { redirect } from "next/navigation";
import { startOfDay } from "date-fns";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { weekStart, weekEnd, addDays } from "@/lib/date";
import { PageHeader } from "@/components/ui/page-header";
import { AthletesManager, type RosterAthlete } from "@/components/athletes-manager";

export const dynamic = "force-dynamic";

export default async function AthletesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "COACH") redirect("/dashboard");

  const teamId = user.teamId ?? undefined;
  const now = new Date();
  const ws = weekStart(now);
  const we = weekEnd(now);

  const athletes = await prisma.user.findMany({
    where: { teamId, role: "ATHLETE", active: true },
    orderBy: { name: "asc" },
  });

  const weekAssignments = await prisma.assignment.findMany({
    where: {
      workout: { teamId, date: { gte: ws, lte: we }, type: { not: "REST" } },
    },
    select: { athleteId: true, status: true },
  });

  const needsRows = await prisma.assignment.findMany({
    where: {
      status: "NEEDS_DISCUSSION",
      workout: { teamId, date: { gte: addDays(startOfDay(now), -10) } },
    },
    select: { athleteId: true },
  });

  const feedbackRows = await prisma.feedback.findMany({
    where: { workout: { teamId } },
    orderBy: { updatedAt: "desc" },
    select: { athleteId: true, updatedAt: true },
  });

  const weekStat = new Map<string, { c: number; t: number }>();
  for (const a of weekAssignments) {
    const s = weekStat.get(a.athleteId) ?? { c: 0, t: 0 };
    s.t += 1;
    if (a.status === "COMPLETED") s.c += 1;
    weekStat.set(a.athleteId, s);
  }
  const needsCount = new Map<string, number>();
  for (const n of needsRows)
    needsCount.set(n.athleteId, (needsCount.get(n.athleteId) ?? 0) + 1);
  const lastFeedback = new Map<string, Date>();
  for (const f of feedbackRows)
    if (!lastFeedback.has(f.athleteId)) lastFeedback.set(f.athleteId, f.updatedAt);

  const roster: RosterAthlete[] = athletes.map((a) => {
    const s = weekStat.get(a.id) ?? { c: 0, t: 0 };
    const last = lastFeedback.get(a.id);
    return {
      id: a.id,
      name: a.name,
      email: a.email,
      gradYear: a.gradYear,
      events: a.events,
      hometown: a.hometown,
      phone: a.phone,
      emergencyName: a.emergencyName,
      emergencyPhone: a.emergencyPhone,
      bio: a.bio,
      mileageGroup: a.mileageGroup,
      lrTarget: a.lrTarget,
      weekCompleted: s.c,
      weekTotal: s.t,
      lastFeedbackISO: last ? last.toISOString() : null,
      needsDiscussion: needsCount.get(a.id) ?? 0,
    };
  });

  return (
    <div>
      <PageHeader
        title="Athletes"
        subtitle="Your roster. Add runners, edit profiles, and review their feedback."
      />
      <AthletesManager athletes={roster} />
    </div>
  );
}
