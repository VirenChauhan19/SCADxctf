import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup"];
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/calendar",
  "/messages",
  "/athletes",
  "/workouts",
  "/settings",
];

const isDev = process.env.NODE_ENV !== "production";

function buildCsp(nonce: string): string {
  // Production locks scripts to a per-request nonce (no 'unsafe-inline'); dev needs
  // eval + a websocket for Fast Refresh. Styles keep 'unsafe-inline' because
  // next/font and React inject inline <style> without a nonce.
  const scriptSrc = isDev
    ? "'self' 'unsafe-inline' 'unsafe-eval'"
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`;
  const connectSrc = isDev ? "'self' ws:" : "'self'";

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src ${connectSrc}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

// Lightweight gate (redirect on session-cookie presence) + a per-request CSP nonce.
// Real session verification happens server-side in getCurrentUser().
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has("coach_session");
  const isPublic = PUBLIC_PATHS.includes(pathname);
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (isPublic && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const nonce = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16)))
  );
  const csp = buildCsp(nonce);

  // Next reads the nonce from the request CSP header and stamps it onto its own
  // scripts; x-nonce is exposed for any app code that needs it.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("content-security-policy", csp);
  if (!isDev) requestHeaders.set("x-nonce", nonce);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

export const config = {
  matcher: [
    // Run on every page except API routes, Next internals, and static assets.
    "/((?!api/|_next/static|_next/image|favicon.ico|icon.png|scad-bees.png).*)",
  ],
};
