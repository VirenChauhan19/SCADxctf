import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok, ApiError, requireCoach } from "@/lib/api";
import { isWorkoutType } from "@/lib/constants";

const clean = (v: unknown): string | null => {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
};

function parseDate(input: unknown): Date {
  const s = String(input ?? "");
  const date = /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T07:00:00`) : new Date(s);
  if (isNaN(date.getTime())) throw new ApiError(400, "Please choose a valid date.");
  return date;
}

async function loadOwned(workoutId: string, teamId: string | null) {
  const workout = await prisma.workout.findUnique({ where: { id: workoutId } });
  if (!workout || workout.teamId !== teamId) {
    throw new ApiError(404, "Workout not found.");
  }
  return workout;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const coach = await requireCoach();
    const { id } = await params;
    await loadOwned(id, coach.teamId);
    const b = await req.json();

    const data: Record<string, unknown> = {};
    if (b.title !== undefined) {
      const t = String(b.title).trim();
      if (!t) throw new ApiError(400, "A workout title is required.");
      data.title = t;
    }
    if (b.type !== undefined && isWorkoutType(b.type)) data.type = b.type;
    if (b.date !== undefined) data.date = parseDate(b.date);
    for (const f of ["distance", "pace", "warmup", "mainSet", "cooldown", "notes", "location", "link"] as const) {
      if (b[f] !== undefined) data[f] = clean(b[f]);
    }

    await prisma.workout.update({ where: { id }, data });

    // Optional re-assignment for individual workouts.
    if (Array.isArray(b.athleteIds)) {
      const teamAthletes = await prisma.user.findMany({
        where: { teamId: coach.teamId, role: "ATHLETE", active: true },
        select: { id: true },
      });
      const valid = new Set(teamAthletes.map((a) => a.id));
      const next = (b.athleteIds as unknown[]).map(String).filter((x) => valid.has(x));
      const current = await prisma.assignment.findMany({
        where: { workoutId: id },
        select: { athleteId: true },
      });
      const currentSet = new Set(current.map((c) => c.athleteId));
      const toAdd = next.filter((x) => !currentSet.has(x));
      const toRemove = [...currentSet].filter((x) => !next.includes(x));
      if (toAdd.length) {
        await prisma.assignment.createMany({
          data: toAdd.map((athleteId) => ({ workoutId: id, athleteId })),
        });
      }
      if (toRemove.length) {
        await prisma.assignment.deleteMany({
          where: { workoutId: id, athleteId: { in: toRemove } },
        });
      }
    }

    return ok({ id });
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const coach = await requireCoach();
    const { id } = await params;
    await loadOwned(id, coach.teamId);
    await prisma.workout.delete({ where: { id } });
    return ok({ id });
  } catch (e) {
    return apiError(e);
  }
}
