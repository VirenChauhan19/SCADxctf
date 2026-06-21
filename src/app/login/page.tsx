import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

// Rendered per-request so the CSP nonce (set in middleware) is applied to scripts.
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Only skip the login screen when the session is actually valid. Checking
  // validity here (not just cookie presence in middleware) avoids a redirect loop
  // when the cookie is present but expired.
  if (await getCurrentUser()) redirect("/dashboard");
  return <AuthForm mode="login" />;
}
