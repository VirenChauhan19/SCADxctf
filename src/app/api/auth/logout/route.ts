import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, getCurrentUser } from "@/lib/auth";
import { ok } from "@/lib/api";

export async function POST(req: NextRequest) {
  // `{ all: true }` revokes every other active session for this user by bumping
  // their session version (existing tokens then fail the version check).
  let all = false;
  try {
    const body = await req.json();
    all = body?.all === true;
  } catch {
    // No body; ordinary single-device logout.
  }

  if (all) {
    const user = await getCurrentUser();
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { sessionVersion: { increment: 1 } },
      });
    }
  }

  await clearSessionCookie();
  return ok({ ok: true });
}
