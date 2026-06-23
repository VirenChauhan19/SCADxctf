import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok, ApiError, requireUser } from "@/lib/api";
import type { AssignmentStatus } from "@/lib/constants";

const ALLOWED: AssignmentStatus[] = ["VIEWED", "COMPLETED", "SKIPPED", "NEEDS_DISCUSSION"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const b = await req.json();

    // Coach setting/clearing the personal note this athlete sees on the workout.
    if (b.customNote !== undefined) {
      if (user.role !== "COACH") throw new ApiError(403, "Coach access required.");
      const assignment = await prisma.assignment.findUnique({
        where: { id },
        include: { athlete: { select: { teamId: true } } },
      });
      if (!assignment || assignment.athlete.teamId !== user.teamId) {
        throw new ApiError(404, "Assignment not found.");
      }
      const note = String(b.customNote ?? "").trim();
      if (note.length > 1000) {
        throw new ApiError(400, "Note is too long (max 1000 characters).");
      }
      const updated = await prisma.assignment.update({
        where: { id },
        data: { customNote: note || null },
      });
      return ok({ id: updated.id, customNote: updated.customNote });
    }

    // Athlete updating the status of their own assignment.
    const status = b.status as AssignmentStatus;
    if (!ALLOWED.includes(status)) throw new ApiError(400, "Invalid status.");

    const assignment = await prisma.assignment.findUnique({ where: { id } });
    if (!assignment || assignment.athleteId !== user.id) {
      throw new ApiError(404, "Assignment not found.");
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        status,
        viewedAt: assignment.viewedAt ?? new Date(),
        respondedAt: status === "VIEWED" ? assignment.respondedAt : new Date(),
      },
    });

    return ok({ id: updated.id, status: updated.status });
  } catch (e) {
    return apiError(e);
  }
}
