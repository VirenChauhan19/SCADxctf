import { NextResponse } from "next/server";
import { getCurrentUser, type SessionUser } from "./auth";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "You must be signed in.");
  return user;
}

export async function requireCoach(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "COACH") throw new ApiError(403, "Coach access required.");
  return user;
}

export function apiError(e: unknown): NextResponse {
  if (e instanceof ApiError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error("[api]", e);
  return NextResponse.json(
    { error: "Something went wrong on our end." },
    { status: 500 }
  );
}

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}
