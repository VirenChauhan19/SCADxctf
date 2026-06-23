/* eslint-disable no-console */
// Read-only: list every user so we can plan account provisioning.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      name: true,
      email: true,
      role: true,
      active: true,
      mustChangePassword: true,
    },
  });
  console.log(`Total users: ${users.length}\n`);
  for (const u of users) {
    console.log(
      `${u.role.padEnd(7)} | ${u.active ? "active " : "INACTIVE"} | mcp=${u.mustChangePassword ? "Y" : "n"} | ${u.name}  <${u.email}>`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
