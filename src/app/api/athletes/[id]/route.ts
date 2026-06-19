import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok, ApiError, requireCoach } from "@/lib/api";

const clean = (v: unknown): string | null => {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
};

async function loadTeamAthlete(id: string, teamId: string | null) {
  const athlete = await prisma.user.findUnique({ where: { id } });
  if (!athlete || athlete.teamId !== teamId || athlete.role !== "ATHLETE") {
    throw new ApiError(404, "Athlete not found.");
  }
  return athlete;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const coach = await requireCoach();
    const { id } = await params;
    await loadTeamAthlete(id, coach.teamId);
    const b = await req.json();

    const data: Record<string, unknown> = {};
    if (b.name !== undefined) {
      const n = String(b.name).trim();
      if (!n) throw new ApiError(400, "Name is required.");
      data.name = n;
    }
    if (b.email !== undefined) {
      const email = String(b.email).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ApiError(400, "Please enter a valid email address.");
      }
      const dupe = await prisma.user.findFirst({
        where: { email, id: { not: id } },
        select: { id: true },
      });
      if (dupe) throw new ApiError(409, "That email is already in use.");
      data.email = email;
    }
    if (b.gradYear !== undefined) {
      const g = parseInt(String(b.gradYear), 10);
      data.gradYear = Number.isNaN(g) ? null : g;
    }
    for (const f of ["events", "hometown", "phone", "emergencyName", "emergencyPhone", "bio"] as const) {
      if (b[f] !== undefined) data[f] = clean(b[f]);
    }
    if (b.active !== undefined) data.active = Boolean(b.active);

    await prisma.user.update({ where: { id }, data });
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
    await loadTeamAthlete(id, coach.teamId);
    // Soft-remove: preserves the athlete's history (feedback, messages).
    await prisma.user.update({ where: { id }, data: { active: false } });
    return ok({ id });
  } catch (e) {
    return apiError(e);
  }
}
