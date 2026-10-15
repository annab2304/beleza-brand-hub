import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import logoBd from "@/assets/logo-bd.png";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage, safeRedirect, useAuthUser } from "@/lib/auth";

const FIELD = "w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground";

export function AuthForm({ mode, redirect }: { mode: "login" | "cadastro"; redirect?: string | undefined }) {
  const navigate = useNavigate();
  const user = useAuthUser();
  const isSignup = mode === "cadastro";
  const target = safeRedirect(redirect);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // Já está logada: vai direto para o destino.
  useEffect(() => {
    if (user) navigate({ to: target });
  }, [user, target, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: `${window.location.origin}${target}`,
          },
        });
        if (error) throw error;
        if (!data.session) toast.success("Conta criada! Confirme pelo link enviado ao seu e-mail para entrar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(authErrorMessage(err instanceof Error ? err.message : "Não foi possível continuar."));
    } finally {
      setBusy(false);
    }
  };

  const search = redirect ? { redirect } : {};

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-sm bg-ivory p-8">
        <Link to="/" aria-label="Voltar à loja">
          <img src={logoBd} alt="Beleza em Detalhes" className="mx-auto h-16 w-16" />
        </Link>
        <h1 className="mt-4 text-center text-3xl">{isSignup ? "Criar conta" : "Entrar"}</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {isSignup ? "Acompanhe seus pedidos em um só lugar." : "Veja seus pedidos e finalize suas compras."}
        </p>

        <div className="mt-8 space-y-3">
          {isSignup && (
            <input type="text" required autoComplete="name" placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} className={FIELD} />
          )}
          <input type="email" required autoComplete="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className={FIELD} />
          <input
            type="password"
            required
            minLength={6}
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={FIELD}
          />
        </div>

        <button type="submit" disabled={busy} className="btn-primary mt-6 w-full">
          {busy ? "Aguarde…" : isSignup ? "Criar conta" : "Entrar"}
        </button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {isSignup ? (
            <>Já tem conta? <Link to="/login" search={search} className="underline">Entrar</Link></>
          ) : (
            <>Ainda não tem conta? <Link to="/cadastro" search={search} className="underline">Criar conta</Link></>
          )}
        </p>
        <Link to="/" className="mt-6 block text-center text-xs text-muted-foreground">← Voltar à loja</Link>
      </form>
    </div>
  );
}
