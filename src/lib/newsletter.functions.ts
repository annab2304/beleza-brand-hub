import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Código sensível só dentro do handler (import dinâmico): este arquivo vai para o navegador.
export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().trim().toLowerCase().email("Digite um e-mail válido").max(160) }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("newsletter_subscribers").insert({ email: data.email });
    // 23505 = e-mail já inscrito: para quem se inscreveu, o resultado é o mesmo.
    if (error && error.code !== "23505") {
      console.error("[newsletter] falha ao salvar", error);
      throw new Error("Não foi possível cadastrar agora. Tente de novo em instantes.");
    }
    return { ok: true as const };
  });
