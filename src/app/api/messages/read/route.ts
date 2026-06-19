import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok, requireUser } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const b = await req.json();
    const withUserId = String(b.withUserId ?? "");
    if (!withUserId) return ok({ updated: 0 });

    const res = await prisma.message.updateMany({
      where: {
        type: "DIRECT",
        senderId: withUserId,
        recipientId: user.id,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return ok({ updated: res.count });
  } catch (e) {
    return apiError(e);
  }
}
