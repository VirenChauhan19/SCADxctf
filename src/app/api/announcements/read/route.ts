import { prisma } from "@/lib/prisma";
import { apiError, ok, requireUser } from "@/lib/api";

export async function POST() {
  try {
    const user = await requireUser();
    await prisma.user.update({
      where: { id: user.id },
      data: { lastReadAnnouncementsAt: new Date() },
    });
    return ok({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
