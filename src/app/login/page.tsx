import { AuthForm } from "@/components/auth-form";

// Rendered per-request so the CSP nonce (set in middleware) is applied to scripts.
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
