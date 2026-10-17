import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

/** Usuário logado: `undefined` = ainda verificando, `null` = visitante. */
export function useAuthUser() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  return user;
}

/** Só aceita caminhos internos, para o parâmetro `redirect` não virar redirecionamento aberto. */
export function safeRedirect(value: unknown, fallback = "/minha-conta"): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export function authErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  if (m.includes("already registered") || m.includes("already been registered")) return "Já existe uma conta com esse e-mail. Tente entrar.";
  if (m.includes("weak") || m.includes("easy to guess") || m.includes("pwned") || m.includes("compromised"))
    return "Essa senha é muito comum ou já apareceu em vazamentos. Escolha outra, mais longa, misturando letras, números e símbolo.";
  if (m.includes("password") && m.includes("characters")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (m.includes("rate limit")) return "Muitas tentativas. Aguarde um pouco e tente de novo.";
  return message;
}
