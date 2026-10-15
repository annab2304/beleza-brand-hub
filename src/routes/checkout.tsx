import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useAuthUser } from "@/lib/auth";
import { createCheckout } from "@/lib/checkout.functions";
import { brl, clean } from "@/lib/catalog";
import { whatsappUrl } from "@/lib/contact";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Finalizar compra — Beleza em Detalhes" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const FIELD = "w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground";
const digits = (v: string) => v.replace(/\D/g, "");

function CheckoutPage() {
  const { cart, subtotal } = useStore();
  const user = useAuthUser();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    name: "", email: "", phone: "",
    cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "",
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  // Se estiver logada, já preenche nome e e-mail.
  useEffect(() => {
    if (!user) return;
    const fullName = (user.user_metadata as { full_name?: string } | undefined)?.full_name ?? "";
    setF((s) => ({ ...s, name: s.name || fullName, email: s.email || user.email || "" }));
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const { checkoutUrl } = await createCheckout({
        data: {
          customer: { name: f.name, email: f.email, phone: digits(f.phone) },
          address: {
            cep: digits(f.cep), street: f.street, number: f.number,
            ...(f.complement.trim() ? { complement: f.complement } : {}),
            neighborhood: f.neighborhood, city: f.city, state: f.state,
          },
          items: cart.map((i) => ({ variant_id: i.variant_id, quantity: i.quantity })),
        },
      });
      window.location.href = checkoutUrl; // segue para o pagamento seguro no Mercado Pago
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível finalizar. Tente novamente.");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-center text-4xl sm:text-5xl">Finalizar <span className="script text-cafe">compra</span></h1>

        {cart.length === 0 ? (
          <div className="py-16 text-center">
            <p className="script text-4xl text-cafe">sua sacola está vazia</p>
            <Link to="/categoria/$slug" params={{ slug: "todos" }} className="btn-primary mt-8">Explorar a coleção</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem]">
            <div className="space-y-10">
              <section>
                <h2 className="text-2xl">Seus dados</h2>
                {!user && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Quer acompanhar o pedido na sua conta?{" "}
                    <Link to="/login" search={{ redirect: "/checkout" }} className="underline">Entrar</Link> ou{" "}
                    <Link to="/cadastro" search={{ redirect: "/checkout" }} className="underline">criar conta</Link>. Também dá para comprar sem cadastro.
                  </p>
                )}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input required autoComplete="name" placeholder="Nome completo" value={f.name} onChange={set("name")} className={`${FIELD} sm:col-span-2`} />
                  <input required type="email" autoComplete="email" placeholder="E-mail" value={f.email} onChange={set("email")} className={FIELD} />
                  <input required type="tel" inputMode="tel" autoComplete="tel" placeholder="Telefone com DDD" value={f.phone} onChange={set("phone")} className={FIELD} />
                </div>
              </section>

              <section>
                <h2 className="text-2xl">Endereço de entrega</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-6">
                  <input required inputMode="numeric" autoComplete="postal-code" placeholder="CEP" value={f.cep} onChange={set("cep")} className={`${FIELD} sm:col-span-2`} />
                  <input required autoComplete="address-line1" placeholder="Rua / Avenida" value={f.street} onChange={set("street")} className={`${FIELD} sm:col-span-4`} />
                  <input required placeholder="Número" value={f.number} onChange={set("number")} className={`${FIELD} sm:col-span-2`} />
                  <input placeholder="Complemento (opcional)" value={f.complement} onChange={set("complement")} className={`${FIELD} sm:col-span-4`} />
                  <input required placeholder="Bairro" value={f.neighborhood} onChange={set("neighborhood")} className={`${FIELD} sm:col-span-3`} />
                  <input required autoComplete="address-level2" placeholder="Cidade" value={f.city} onChange={set("city")} className={`${FIELD} sm:col-span-2`} />
                  <input required maxLength={2} autoComplete="address-level1" placeholder="UF" value={f.state} onChange={set("state")} className={`${FIELD} uppercase sm:col-span-1`} />
                </div>
              </section>

              <section>
                <h2 className="text-2xl">Pagamento</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Você será levada ao ambiente seguro do Mercado Pago para pagar. Nós não guardamos dados do seu cartão.
                </p>
              </section>
            </div>

            <aside className="h-fit border border-border bg-background p-6 lg:sticky lg:top-32">
              <h2 className="text-2xl">Resumo</h2>
              <ul className="mt-4 divide-y divide-border">
                {cart.map((i) => (
                  <li key={i.variant_id} className="flex gap-3 py-3">
                    <div className="h-16 w-14 shrink-0 overflow-hidden bg-cream">
                      {i.image && <img src={i.image} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="leading-snug">{clean(i.name)}</p>
                      <p className="text-xs text-muted-foreground">{i.options.map((o) => `${o.name}: ${o.value}`).join(" · ")} · {i.quantity}×</p>
                    </div>
                    <span className="text-sm">{brl(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between"><dt>Subtotal</dt><dd>{brl(subtotal)}</dd></div>
                <div className="flex justify-between"><dt>Frete</dt><dd className="text-muted-foreground">a definir</dd></div>
                <div className="flex justify-between border-t border-border pt-3 text-base font-medium"><dt>Total</dt><dd>{brl(subtotal)}</dd></div>
              </dl>
              <button type="submit" disabled={busy} className="btn-primary mt-6 w-full">
                {busy ? "Aguarde…" : "Pagar com Mercado Pago"}
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Dúvidas? <a href={whatsappUrl("Olá! Tenho uma dúvida sobre a minha compra.")} target="_blank" rel="noreferrer" className="underline">Fale no WhatsApp</a>
              </p>
            </aside>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
