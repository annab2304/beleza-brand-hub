import { createFileRoute } from "@tanstack/react-router";

import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): { redirect?: string | undefined } => ({
    redirect: typeof s["redirect"] === "string" ? s["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Entrar — Beleza em Detalhes" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  return <AuthForm mode="login" redirect={redirect} />;
}
