import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const unreadDms = await prisma.message.count({
    where: { type: "DIRECT", recipientId: user.id, readAt: null },
  });

  let unreadAnnouncements = 0;
  if (user.role !== "COACH" && user.teamId) {
    unreadAnnouncements = await prisma.message.count({
      where: {
        type: "ANNOUNCEMENT",
        teamId: user.teamId,
        ...(user.lastReadAnnouncementsAt
          ? { createdAt: { gt: user.lastReadAnnouncementsAt } }
          : {}),
      },
    });
  }

  return (
    <AppShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }}
      unreadMessages={unreadDms + unreadAnnouncements}
    >
      {children}
    </AppShell>
  );
}
