import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok, ApiError, requireUser } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const b = await req.json();
    const body = String(b.body ?? "").trim();
    if (!body) throw new ApiError(400, "Message can't be empty.");
    if (body.length > 5000) throw new ApiError(400, "Message is too long.");

    let recipientId: string | null = null;

    if (user.role === "COACH") {
      recipientId = String(b.recipientId ?? "");
      const athlete = await prisma.user.findFirst({
        where: { id: recipientId, teamId: user.teamId, role: "ATHLETE" },
        select: { id: true },
      });
      if (!athlete) throw new ApiError(400, "Choose a valid athlete to message.");
    } else {
      // Athletes can only message their coach.
      const team = user.teamId
        ? await prisma.team.findUnique({ where: { id: user.teamId } })
        : null;
      recipientId = team?.coachId ?? null;
      if (!recipientId) {
        const coach = await prisma.user.findFirst({
          where: { teamId: user.teamId, role: "COACH" },
          select: { id: true },
        });
        recipientId = coach?.id ?? null;
      }
      if (!recipientId) throw new ApiError(400, "No coach is set up for your team yet.");
    }

    const message = await prisma.message.create({
      data: {
        type: "DIRECT",
        body,
        senderId: user.id,
        recipientId,
      },
    });

    return ok(
      {
        id: message.id,
        body: message.body,
        senderId: message.senderId,
        recipientId: message.recipientId,
        createdAt: message.createdAt.toISOString(),
      },
      201
    );
  } catch (e) {
    return apiError(e);
  }
}
