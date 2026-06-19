import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Trophy,
  ShieldAlert,
  MessageSquare,
  Activity,
  CheckCircle2,
  MessageCircleQuestion,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { TypeBadge, StatusBadge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/empty";
import { PacesCard, GroupBadge } from "@/components/paces-card";
import { parsePersonalBests, parsePaces, eventsList } from "@/lib/utils";
import { fmtDate, fmtRelative } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function AthleteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "COACH") redirect("/dashboard");

  const { id } = await params;
  const athlete = await prisma.user.findUnique({ where: { id } });
  if (!athlete || athlete.teamId !== user.teamId || athlete.role !== "ATHLETE") {
    notFound();
  }

  const assignments = await prisma.assignment.findMany({
    where: { athleteId: id },
    include: { workout: true, feedback: true },
    orderBy: { workout: { date: "desc" } },
    take: 50,
  });

  const nonRest = assignments.filter((a) => a.workout.type !== "REST");
  const completed = nonRest.filter((a) => a.status === "COMPLETED").length;
  const completionRate = nonRest.length
    ? Math.round((completed / nonRest.length) * 100)
    : 0;
  const needsDiscussion = assignments.filter(
    (a) => a.status === "NEEDS_DISCUSSION"
  ).length;

  const withFeedback = assignments.filter((a) => a.feedback);
  const pbs = parsePersonalBests(athlete.personalBests);
  const paces = parsePaces(athlete.paces);
  const recent = assignments.slice(0, 8);

  return (
    <div>
      <Link
        href="/athletes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-ink"
      >
        <ArrowLeft size={16} /> Back to roster
      </Link>

      {/* header */}
      <div className="card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={athlete.name} seed={athlete.id} size={64} />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-ink">
                {athlete.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <GroupBadge group={athlete.mileageGroup} />
                {athlete.gradYear && <span>Class of {athlete.gradYear}</span>}
                {eventsList(athlete.events).map((e) => (
                  <span
                    key={e}
                    className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Link href="/messages" className="btn-outline self-start">
            <MessageSquare size={16} /> Message
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Mail size={14} className="text-slate-400" />
            {athlete.email}
          </span>
          {athlete.phone && (
            <span className="inline-flex items-center gap-1.5">
              <Phone size={14} className="text-slate-400" />
              {athlete.phone}
            </span>
          )}
          {athlete.hometown && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} className="text-slate-400" />
              {athlete.hometown}
            </span>
          )}
        </div>
      </div>

      {/* stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Activity size={14} /> Completion
          </div>
          <div className="mt-1 text-2xl font-bold text-ink">{completionRate}%</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <CheckCircle2 size={14} /> Completed
          </div>
          <div className="mt-1 text-2xl font-bold text-ink">{completed}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <MessageCircleQuestion size={14} /> To discuss
          </div>
          <div className="mt-1 text-2xl font-bold text-ink">{needsDiscussion}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* feedback history */}
        <div className="space-y-4 lg:col-span-2">
          <section className="card p-5">
            <h2 className="mb-3 text-sm font-semibold text-ink">Feedback history</h2>
            {withFeedback.length === 0 ? (
              <EmptyState
                title="No feedback logged yet"
                description="When this athlete logs how a workout went, it shows up here — visible only to you."
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {withFeedback.map((a) => {
                  const f = a.feedback!;
                  return (
                    <li key={a.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-ink">
                            {a.workout.title}
                          </span>
                          <TypeBadge type={a.workout.type} />
                        </div>
                        <div className="flex items-center gap-2">
                          {f.effort != null && (
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-700">
                              RPE {f.effort}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            {fmtDate(a.workout.date)}
                          </span>
                        </div>
                      </div>
                      {!f.completed && (
                        <span className="mt-1 inline-block badge bg-amber-50 text-amber-700 ring-amber-600/20">
                          Did not complete
                        </span>
                      )}
                      {f.feeling && (
                        <p className="mt-1.5 text-sm text-slate-700">“{f.feeling}”</p>
                      )}
                      {f.soreness && (
                        <p className="mt-1 text-sm text-slate-500">
                          <span className="font-medium text-slate-600">Soreness:</span>{" "}
                          {f.soreness}
                        </p>
                      )}
                      {f.notes && (
                        <p className="mt-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-sm text-brand-900">
                          {f.notes}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* profile sidebar */}
        <div className="space-y-4">
          <PacesCard
            group={athlete.mileageGroup}
            lrTarget={athlete.lrTarget}
            ezTarget={athlete.ezTarget}
            paces={paces}
          />

          {pbs.length > 0 && (
            <section className="card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Trophy size={15} className="text-brand-600" /> Personal bests
              </div>
              <ul className="mt-2 space-y-1.5">
                {pbs.map((p, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{p.event}</span>
                    <span className="font-semibold text-ink">{p.time}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ShieldAlert size={15} className="text-slate-400" /> Emergency contact
            </div>
            {athlete.emergencyName || athlete.emergencyPhone ? (
              <div className="mt-2 text-sm text-slate-600">
                <div>{athlete.emergencyName ?? "—"}</div>
                <div className="text-slate-500">{athlete.emergencyPhone ?? ""}</div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Not provided.</p>
            )}
          </section>

          {athlete.bio && (
            <section className="card p-5">
              <div className="text-sm font-semibold text-ink">Notes</div>
              <p className="mt-2 text-sm text-slate-600">{athlete.bio}</p>
            </section>
          )}

          <section className="card p-5">
            <h2 className="mb-2 text-sm font-semibold text-ink">Recent sessions</h2>
            <ul className="space-y-2">
              {recent.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 flex-1 truncate text-slate-600">
                    {a.workout.title}
                  </span>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
