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
      { name: "description", content: "Crie sua conta na Beleza em Detalhes." },
      { property: "og:title", content: "Criar conta — Beleza em Detalhes" },
      { property: "og:description", content: "Cadastre-se para acompanhar suas compras." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { redirect } = Route.useSearch();
  return <AuthForm mode="cadastro" redirect={redirect} />;
}
