import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok, ApiError, requireUser } from "@/lib/api";

// Accept a client-resized data URL only. The client shrinks images before
// upload, so anything large here is rejected rather than bloating the DB.
function cleanImage(v: unknown): string | null {
  if (v == null || v === "") return null;
  if (typeof v !== "string" || !/^data:image\/(png|jpe?g|webp|gif);base64,/.test(v)) {
    throw new ApiError(400, "That image format isn't supported.");
  }
  if (v.length > 3_500_000) {
    throw new ApiError(400, "That image is too large. Please pick a smaller one.");
  }
  return v;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const b = await req.json();
    const body = String(b.body ?? "").trim();
    const imageUrl = cleanImage(b.imageUrl);
    const channel = b.channel === "GROUP" || b.channel === "PHOTOS" ? b.channel : null;

    if (body.length > 5000) throw new ApiError(400, "Message is too long.");
    if (!body && !imageUrl) throw new ApiError(400, "Message can't be empty.");

    // Team-wide channels: anyone on the team can post, everyone sees them.
    if (channel) {
      if (!user.teamId) throw new ApiError(400, "You're not on a team yet.");
      if (channel === "PHOTOS" && !imageUrl) {
        throw new ApiError(400, "Add a photo to post in the photos channel.");
      }
      const message = await prisma.message.create({
        data: { type: channel, body, imageUrl, senderId: user.id, teamId: user.teamId },
      });
      return ok(
        {
          id: message.id,
          type: channel,
          body: message.body,
          imageUrl: message.imageUrl,
          senderId: user.id,
          createdAt: message.createdAt.toISOString(),
        },
        201
      );
    }

    // Otherwise it's a direct message.
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
      data: { type: "DIRECT", body, imageUrl, senderId: user.id, recipientId },
    });

    return ok(
      {
        id: message.id,
        body: message.body,
        imageUrl: message.imageUrl,
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
