import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useEffect } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth";
import { brl, clean } from "@/lib/catalog";
import { whatsappUrl } from "@/lib/contact";
import {
  formatOrderDate,
  ORDER_STATUS_LABEL,
  parseOptions,
  PAYMENT_STATUS_LABEL,
  type OrderItemRow,
} from "@/lib/orders";

export const Route = createFileRoute("/minha-conta")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Minha conta — Beleza em Detalhes" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

type OrderRow = {
  id: string;
  order_number: number;
  created_at: string;
  status: string;
  payment_status: string;
  tracking_code?: string | null;
  total: number;
  order_items: OrderItemRow[];
};

function AccountPage() {
  const user = useAuthUser();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (user === null) navigate({ to: "/login", search: { redirect: "/minha-conta" } });
  }, [user, navigate]);

  const orders = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<OrderRow[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,order_number,created_at,status,payment_status,tracking_code,total,order_items(id,name,options,image_url,unit_price,quantity)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data as unknown as OrderRow[];
    },
  });

  const name = (user?.user_metadata as { full_name?: string } | undefined)?.full_name;

  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {!user ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Minha conta</p>
                <h1 className="mt-2 text-4xl sm:text-5xl">
                  Olá{name ? <>, <span className="script text-cafe">{name.split(" ")[0]}</span></> : ""}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
              </div>
              <button
                type="button"
                className="btn-outline inline-flex items-center gap-2"
                onClick={async () => {
                  qc.clear();
                  await supabase.auth.signOut();
                  navigate({ to: "/" });
                }}
              >
                <LogOut className="h-4 w-4" strokeWidth={1.25} /> Sair
              </button>
            </div>

            <h2 className="mt-12 text-2xl">Meus pedidos</h2>
            <div className="gold-rule mt-3 w-10" />

            {orders.isLoading && <p className="mt-8 text-sm text-muted-foreground">Carregando seus pedidos…</p>}
            {orders.isError && (
              <p className="mt-8 text-sm text-muted-foreground">
                Não foi possível carregar seus pedidos agora. Tente novamente em instantes.
              </p>
            )}
            {orders.data && orders.data.length === 0 && (
              <div className="py-12 text-center">
                <p className="script text-4xl text-cafe">nenhum pedido ainda</p>
                <p className="mt-2 text-sm text-muted-foreground">Quando você comprar, seus pedidos aparecem aqui.</p>
                <Link to="/categoria/$slug" params={{ slug: "todos" }} className="btn-primary mt-8">Explorar a coleção</Link>
              </div>
            )}

            <ul className="mt-6 space-y-6">
              {orders.data?.map((o) => (
                <li key={o.id} className="border border-border bg-background">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4 text-sm">
                    <div>
                      <p className="font-medium">Pedido #{o.order_number}</p>
                      <p className="text-xs text-muted-foreground">{formatOrderDate(o.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{ORDER_STATUS_LABEL[o.status] ?? o.status}</p>
                      <p className="text-xs text-muted-foreground">Pagamento: {PAYMENT_STATUS_LABEL[o.payment_status] ?? o.payment_status}</p>
                      {o.tracking_code && <p className="text-xs text-muted-foreground">Rastreio: <span className="font-mono">{o.tracking_code}</span></p>}
                    </div>
                  </div>
                  <ul className="divide-y divide-border px-5">
                    {o.order_items.map((i) => (
                      <li key={i.id} className="flex gap-4 py-4">
                        <div className="h-20 w-16 shrink-0 overflow-hidden bg-cream">
                          {i.image_url && <img src={i.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />}
                        </div>
                        <div className="flex flex-1 flex-col text-sm">
                          <p className="leading-snug">{clean(i.name)}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {parseOptions(i.options).map((op) => `${op.name}: ${op.value}`).join(" · ")}
                          </p>
                          <p className="mt-auto text-xs text-muted-foreground">{i.quantity} × {brl(Number(i.unit_price))}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 text-sm">
                    <a
                      href={whatsappUrl(`Olá! Gostaria de ajuda com o pedido #${o.order_number}.`)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs underline underline-offset-4"
                    >
                      Falar sobre este pedido
                    </a>
                    <p><span className="text-muted-foreground">Total </span><span className="font-medium">{brl(Number(o.total))}</span></p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
