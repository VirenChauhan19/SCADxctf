/* eslint-disable no-console */
// One-off: retire the seeded demo coach (coach@scadxc.com) and make Chris Benassi
// the demo coach. Reassigns everything the old account owns (workouts it created,
// messages it sent/received, team headship) to Chris first so there are no
// dangling foreign keys, then deletes it. Idempotent: safe to re-run.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const OLD_COACH_EMAIL = "coach@scadxc.com";
const CHRIS_EMAIL = "cbenassi@scadxc.com";
const DEMO_PASSWORD = "password123"; // the public demo password shown on the login screen

async function main() {
  const chris = await prisma.user.findUnique({ where: { email: CHRIS_EMAIL } });
  if (!chris) throw new Error(`${CHRIS_EMAIL} not found — provision the coaches first.`);

  // Make Chris the demo coach: known password, no forced reset, so the "Coach
  // demo" button drops straight into the dashboard.
  await prisma.user.update({
    where: { id: chris.id },
    data: {
      role: "COACH",
      active: true,
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 12),
      mustChangePassword: false,
      sessionVersion: { increment: 1 },
    },
  });

  const old = await prisma.user.findUnique({ where: { email: OLD_COACH_EMAIL } });
  if (old) {
    const w = await prisma.workout.updateMany({
      where: { createdById: old.id },
      data: { createdById: chris.id },
    });
    const ms = await prisma.message.updateMany({
      where: { senderId: old.id },
      data: { senderId: chris.id },
    });
    const mr = await prisma.message.updateMany({
      where: { recipientId: old.id },
      data: { recipientId: chris.id },
    });
    const headed = await prisma.team.findFirst({ where: { coachId: old.id } });
    if (headed) {
      await prisma.team.update({ where: { id: headed.id }, data: { coachId: chris.id } });
    }
    await prisma.user.update({ where: { id: old.id }, data: { teamId: null } });
    await prisma.user.delete({ where: { id: old.id } });
    console.log(
      `Retired ${OLD_COACH_EMAIL}: moved ${w.count} workouts, ${ms.count} sent + ${mr.count} received messages, and team headship to Chris.`
    );
  } else {
    console.log(`${OLD_COACH_EMAIL} already gone — nothing to retire.`);
  }

  // Make sure Chris is on the team and is the head coach.
  const team = await prisma.team.findFirst();
  if (team) {
    if (chris.teamId !== team.id) {
      await prisma.user.update({ where: { id: chris.id }, data: { teamId: team.id } });
    }
    if (team.coachId !== chris.id) {
      await prisma.team.update({ where: { id: team.id }, data: { coachId: chris.id } });
    }
  }

  const coaches = await prisma.user.findMany({
    where: { role: "COACH" },
    orderBy: { name: "asc" },
    select: { name: true, email: true, mustChangePassword: true },
  });
  console.log("\nCoaches now:");
  for (const c of coaches) {
    console.log(
      `  ${c.email.padEnd(24)} | ${c.mustChangePassword ? "temp pw -> sets own" : "demo (password123)"} | ${c.name}`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
