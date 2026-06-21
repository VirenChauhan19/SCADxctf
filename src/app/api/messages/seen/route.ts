import { prisma } from "@/lib/prisma";
import { apiError, ok, requireUser } from "@/lib/api";

// Marks the current user as having seen the team chat up to now. Powers the
// "Seen by" read receipts on the group channel.
export async function POST() {
  try {
    const user = await requireUser();
    await prisma.user.update({
      where: { id: user.id },
      data: { lastReadTeamChatAt: new Date() },
    });
    return ok({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
