import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok, requireUser } from "@/lib/api";

// Marks a batch of the athlete's own assignments as "viewed" (only those still
// in the ASSIGNED state), so the coach can see read receipts.
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const b = await req.json();
    const ids: string[] = Array.isArray(b.ids) ? b.ids.map(String) : [];
    if (!ids.length) return ok({ updated: 0 });

    const res = await prisma.assignment.updateMany({
      where: { id: { in: ids }, athleteId: user.id, status: "ASSIGNED" },
      data: { status: "VIEWED", viewedAt: new Date() },
    });

    return ok({ updated: res.count });
  } catch (e) {
    return apiError(e);
  }
}
