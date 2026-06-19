import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok, ApiError, requireCoach } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const coach = await requireCoach();
    if (!coach.teamId) throw new ApiError(400, "No team found for this coach.");
    const b = await req.json();
    const body = String(b.body ?? "").trim();
    if (!body) throw new ApiError(400, "Announcement can't be empty.");
    if (body.length > 5000) throw new ApiError(400, "Announcement is too long.");

    const message = await prisma.message.create({
      data: {
        type: "ANNOUNCEMENT",
        body,
        senderId: coach.id,
        teamId: coach.teamId,
      },
    });

    // The coach has implicitly read their own announcement.
    await prisma.user.update({
      where: { id: coach.id },
      data: { lastReadAnnouncementsAt: new Date() },
    });

    return ok({ id: message.id, createdAt: message.createdAt.toISOString() }, 201);
  } catch (e) {
    return apiError(e);
  }
}
