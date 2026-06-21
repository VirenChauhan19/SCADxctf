import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toMessageDTO, toGroupMessageDTO } from "@/lib/dto";
import { MessagesView } from "@/components/messages-view";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isCoach = user.role === "COACH";

  const team = user.teamId
    ? await prisma.team.findUnique({
        where: { id: user.teamId },
        include: { coach: { select: { id: true, name: true } } },
      })
    : null;

  let coachId = team?.coach?.id ?? "";
  let coachName = team?.coach?.name ?? "Coach";
  if (!coachId && user.teamId) {
    const c = await prisma.user.findFirst({
      where: { teamId: user.teamId, role: "COACH" },
      select: { id: true, name: true },
    });
    if (c) {
      coachId = c.id;
      coachName = c.name;
    }
  }

  const dmRows = await prisma.message.findMany({
    where: {
      type: "DIRECT",
      OR: [{ senderId: user.id }, { recipientId: user.id }],
    },
    orderBy: { createdAt: "asc" },
  });
  const dms = dmRows.map(toMessageDTO);

  const annRows = await prisma.message.findMany({
    where: { type: "ANNOUNCEMENT", teamId: user.teamId ?? undefined },
    orderBy: { createdAt: "asc" },
  });
  const anns = annRows.map((m) => ({
    id: m.id,
    body: m.body,
    createdISO: m.createdAt.toISOString(),
  }));

  // Team-wide channels: the group chat and the photos channel.
  const [groupRows, photoRows] = await Promise.all([
    prisma.message.findMany({
      where: { type: "GROUP", teamId: user.teamId ?? undefined },
      include: { sender: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.message.findMany({
      where: { type: "PHOTOS", teamId: user.teamId ?? undefined },
      include: { sender: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  const groupMsgs = groupRows.map(toGroupMessageDTO);
  const photoMsgs = photoRows.map(toGroupMessageDTO);

  // Everyone on the team (coach first), with each member's team-chat read cursor
  // so the group chat can show who is on the team and who has seen messages.
  const memberRows = await prisma.user.findMany({
    where: { teamId: user.teamId ?? undefined, active: true },
    select: { id: true, name: true, role: true, lastReadTeamChatAt: true },
    orderBy: [{ role: "desc" }, { name: "asc" }],
  });
  const members = memberRows.map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    lastReadISO: m.lastReadTeamChatAt ? m.lastReadTeamChatAt.toISOString() : null,
  }));

  const athletes = isCoach
    ? await prisma.user.findMany({
        where: { teamId: user.teamId ?? undefined, role: "ATHLETE", active: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [{ id: coachId || "coach", name: coachName }];

  return (
    <div>
      <PageHeader
        title="Messages"
        subtitle={
          isCoach
            ? "Announce to the team or message athletes privately."
            : "Team announcements and private messages with your coach."
        }
      />
      <MessagesView
        meId={user.id}
        meName={user.name}
        isCoach={isCoach}
        coachName={coachName}
        athletes={athletes}
        initialDms={dms}
        initialAnns={anns}
        initialGroup={groupMsgs}
        initialPhotos={photoMsgs}
        members={members}
      />
    </div>
  );
}
