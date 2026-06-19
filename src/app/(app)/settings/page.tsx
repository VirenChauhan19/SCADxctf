import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsForm } from "@/components/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) redirect("/login");

  const team = user.teamId
    ? await prisma.team.findUnique({ where: { id: user.teamId } })
    : null;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account and profile." />
      <SettingsForm
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          hometown: user.hometown,
          gradYear: user.gradYear,
          events: user.events,
          emergencyName: user.emergencyName,
          emergencyPhone: user.emergencyPhone,
          bio: user.bio,
          mileageGroup: user.mileageGroup,
        }}
        teamName={team?.name ?? "—"}
        season={team?.season ?? null}
      />
    </div>
  );
}
