import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok, ApiError, requireUser } from "@/lib/api";

const clean = (v: unknown): string | null => {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
};

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const b = await req.json();
    const assignmentId = String(b.assignmentId ?? "");
    if (!assignmentId) throw new ApiError(400, "Missing assignment.");

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { workout: true },
    });
    if (!assignment || assignment.athleteId !== user.id) {
      throw new ApiError(404, "Assignment not found.");
    }

    const completed = b.completed !== false;
    let effort: number | null = null;
    if (b.effort !== null && b.effort !== undefined && b.effort !== "") {
      const n = Math.round(Number(b.effort));
      if (!Number.isNaN(n)) effort = Math.min(10, Math.max(1, n));
    }

    const feedbackData = {
      completed,
      effort,
      feeling: clean(b.feeling),
      soreness: clean(b.soreness),
      notes: clean(b.notes),
      assignmentId,
    };

    await prisma.feedback.upsert({
      where: {
        workoutId_athleteId: {
          workoutId: assignment.workoutId,
          athleteId: user.id,
        },
      },
      create: {
        ...feedbackData,
        workoutId: assignment.workoutId,
        athleteId: user.id,
      },
      update: feedbackData,
    });

    // Keep the assignment status in sync with the feedback.
    const status =
      assignment.status === "NEEDS_DISCUSSION"
        ? "NEEDS_DISCUSSION"
        : completed
          ? "COMPLETED"
          : "SKIPPED";

    await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        status,
        respondedAt: new Date(),
        viewedAt: assignment.viewedAt ?? new Date(),
      },
    });

    return ok({ ok: true, status });
  } catch (e) {
    return apiError(e);
  }
}
