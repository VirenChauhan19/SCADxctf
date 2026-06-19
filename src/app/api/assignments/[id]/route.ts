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
