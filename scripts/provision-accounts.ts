/* eslint-disable no-console */
// One-off provisioning: create the two real coaches and put every real account
// on a shared temporary password with a forced first-login reset.
//
// SAFE/IDEMPOTENT: re-running it just re-applies the same state. The two demo
// accounts (coach@scadxc.com, viren@scadxc.com) are deliberately left untouched
// so the demo keeps working.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Temp password comes from the environment so it's never committed in plaintext.
// Run with:  TEMP_PASSWORD='YourTempPass' npx tsx scripts/provision-accounts.ts
const TEMP_PASSWORD = process.env.TEMP_PASSWORD ?? "";
const DEMO_EMAILS = new Set(["coach@scadxc.com", "viren@scadxc.com"]);

const COACHES = [
  { name: "Chris Benassi", email: "cbenassi@scadxc.com", bio: "Distance coach, SCAD Atlanta." },
  { name: "Meredith Herman", email: "mherman@scadxc.com", bio: "Distance coach, SCAD Atlanta." },
];

async function main() {
  if (TEMP_PASSWORD.length < 8) {
    throw new Error(
      "Set a TEMP_PASSWORD env var (>=8 chars) before running, e.g.\n" +
        "  TEMP_PASSWORD='ScadXC2026' npx tsx scripts/provision-accounts.ts"
    );
  }
  const team = await prisma.team.findFirst();
  if (!team) throw new Error("No team found — cannot attach coaches.");

  const tempHash = await bcrypt.hash(TEMP_PASSWORD, 12);

  // 1. Create / update the two real coaches (idempotent on email).
  for (const c of COACHES) {
    await prisma.user.upsert({
      where: { email: c.email },
      update: {
        name: c.name,
        role: "COACH",
        teamId: team.id,
        active: true,
        passwordHash: tempHash,
        mustChangePassword: true,
        sessionVersion: { increment: 1 },
      },
      create: {
        name: c.name,
        email: c.email,
        role: "COACH",
        teamId: team.id,
        bio: c.bio,
        passwordHash: tempHash,
        mustChangePassword: true,
      },
    });
    console.log(`coach ready: ${c.name} <${c.email}>`);
  }

  // 2. Put every real account (not the demo accounts, not already-created coaches)
  //    on the shared temp password + forced reset.
  const coachEmails = COACHES.map((c) => c.email);
  const targets = await prisma.user.findMany({
    where: {
      email: { notIn: [...DEMO_EMAILS, ...coachEmails] },
    },
    select: { id: true, name: true, email: true, role: true },
  });

  for (const u of targets) {
    await prisma.user.update({
      where: { id: u.id },
      data: {
        passwordHash: tempHash,
        mustChangePassword: true,
        sessionVersion: { increment: 1 },
      },
    });
  }
  console.log(`\nFlagged ${targets.length} existing accounts for first-login reset.`);

  // 3. Final credential summary.
  const all = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: { name: true, email: true, role: true, mustChangePassword: true },
  });
  console.log(`\n================ CREDENTIALS ================`);
  console.log(`Shared temporary password (case-sensitive): ${TEMP_PASSWORD}`);
  console.log(`Demo accounts (unchanged, password123): coach@scadxc.com, viren@scadxc.com\n`);
  for (const u of all) {
    const demo = DEMO_EMAILS.has(u.email);
    console.log(
      `${u.role.padEnd(7)} | ${u.email.padEnd(26)} | ${
        demo ? "DEMO (password123, no reset)" : u.mustChangePassword ? `temp: ${TEMP_PASSWORD} -> sets own` : "—"
      }  | ${u.name}`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
