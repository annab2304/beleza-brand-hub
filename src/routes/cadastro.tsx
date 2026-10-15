import { createFileRoute } from "@tanstack/react-router";

import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/cadastro")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): { redirect?: string | undefined } => ({
    redirect: typeof s["redirect"] === "string" ? s["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Criar conta — Beleza em Detalhes" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { redirect } = Route.useSearch();
  return <AuthForm mode="cadastro" redirect={redirect} />;
}
