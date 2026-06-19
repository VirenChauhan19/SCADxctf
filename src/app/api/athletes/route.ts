import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, ok, ApiError, requireCoach } from "@/lib/api";
import { hashPassword } from "@/lib/auth";

const clean = (v: unknown): string | null => {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
};

export async function POST(req: NextRequest) {
  try {
    const coach = await requireCoach();
    if (!coach.teamId) throw new ApiError(400, "No team found for this coach.");
    const b = await req.json();

    const name = String(b.name ?? "").trim();
    const email = String(b.email ?? "").trim().toLowerCase();
    if (!name || !email) throw new ApiError(400, "Name and email are required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError(400, "Please enter a valid email address.");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ApiError(409, "An athlete with that email already exists.");

    const password = String(b.password ?? "").trim() || "password123";
    const passwordHash = await hashPassword(password);

    const gradYear = b.gradYear ? parseInt(String(b.gradYear), 10) : null;

    const athlete = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ATHLETE",
        teamId: coach.teamId,
        gradYear: gradYear && !Number.isNaN(gradYear) ? gradYear : null,
        events: clean(b.events),
        hometown: clean(b.hometown),
        phone: clean(b.phone),
        emergencyName: clean(b.emergencyName),
        emergencyPhone: clean(b.emergencyPhone),
        bio: clean(b.bio),
      },
    });

    return ok({ id: athlete.id, defaultPassword: b.password ? undefined : password }, 201);
  } catch (e) {
    return apiError(e);
  }
}
