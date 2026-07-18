import { NextResponse } from "next/server";

// Liveness check that deliberately touches nothing: no database, no session, no
// cookies. The keep-warm pinger hits this to hold a Cloud Run instance open
// without spending Neon compute hours, and it's a cheap way to confirm the
// server itself is up when a page feels slow.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { ok: true, at: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
