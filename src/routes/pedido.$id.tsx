import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getOrderStatus } from "@/lib/checkout.functions";
import { brl, clean } from "@/lib/catalog";
import { whatsappUrl } from "@/lib/contact";
import { parseOptions, PAYMENT_STATUS_LABEL } from "@/lib/orders";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/pedido/$id")({
  ssr: false,
  // O Mercado Pago devolve payment_id (ou collection_id) na URL de retorno.
  validateSearch: (s: Record<string, unknown>): { payment_id?: string | undefined } => {
    const raw = s["payment_id"] ?? s["collection_id"];
    return { payment_id: typeof raw === "string" || typeof raw === "number" ? String(raw) : undefined };
  },
  head: () => ({
    meta: [
      { title: "Seu pedido — Beleza em Detalhes" },
      { name: "description", content: "Acompanhe seu pedido na Beleza em Detalhes." },
      { property: "og:title", content: "Seu pedido — Beleza em Detalhes" },
      { property: "og:description", content: "Confira o andamento e pagamento do seu pedido." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

const MESSAGES: Record<string, { title: string; text: string }> = {
  approved: { title: "pagamento confirmado!", text: "Obrigada pela compra. Já estamos cuidando do seu pedido com carinho." },
  pending: { title: "aguardando o pagamento", text: "Assim que o Mercado Pago confirmar, atualizamos aqui. Pix e boleto podem levar um pouco mais." },
  in_process: { title: "pagamento em análise", text: "O Mercado Pago está analisando. Avisamos por aqui quando for confirmado." },
  rejected: { title: "pagamento não aprovado", text: "O pagamento foi recusado. Você pode tentar novamente com outro meio de pagamento." },
  cancelled: { title: "pedido cancelado", text: "Este pedido foi cancelado. Se foi engano, fale com a gente." },
  refunded: { title: "pagamento reembolsado", text: "O valor deste pedido foi devolvido." },
};

function OrderPage() {
  const { id } = Route.useParams();
  const { payment_id } = Route.useSearch();
  const { clearCart } = useStore();

  const q = useQuery({
    queryKey: ["order-status", id, payment_id],
    queryFn: () => getOrderStatus({ data: { orderId: id, ...(payment_id ? { paymentId: payment_id } : {}) } }),
    // Enquanto o pagamento não é confirmado, confere de novo a cada poucos segundos.
    refetchInterval: (query) => {
      const s = query.state.data?.payment_status;
      return s === "pending" || s === "in_process" ? 5000 : false;
    },
  });

  const order = q.data;
  const approved = order?.payment_status === "approved";
  useEffect(() => {
    if (approved) clearCart();
  }, [approved]); // eslint-disable-line react-hooks/exhaustive-deps

  const msg = order ? MESSAGES[order.payment_status] ?? MESSAGES["pending"]! : null;

  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        {q.isLoading && <p className="text-center text-sm text-muted-foreground">Carregando seu pedido…</p>}
        {!q.isLoading && !order && (
          <div className="text-center">
            <p className="script text-4xl text-cafe">pedido não encontrado</p>
            <Link to="/" className="btn-primary mt-8">Voltar à loja</Link>
          </div>
        )}
        {order && msg && (
          <>
            <div className="text-center">
              <p className="eyebrow">Pedido #{order.order_number}</p>
              <h1 className="script mt-2 text-5xl text-cafe">{msg.title}</h1>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{msg.text}</p>
              <p className="mt-2 text-xs text-muted-foreground">Pagamento: {PAYMENT_STATUS_LABEL[order.payment_status] ?? order.payment_status}</p>
            </div>

            <ul className="mt-10 divide-y divide-border border border-border bg-background px-5">
              {order.order_items.map((i, idx) => (
                <li key={idx} className="flex gap-4 py-4">
                  <div className="h-20 w-16 shrink-0 overflow-hidden bg-cream">
                    {i.image_url && <img src={i.image_url} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="leading-snug">{clean(i.name)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{parseOptions(i.options).map((o) => `${o.name}: ${o.value}`).join(" · ")}</p>
                    <p className="text-xs text-muted-foreground">{i.quantity} × {brl(Number(i.unit_price))}</p>
                  </div>
                </li>
              ))}
              <li className="flex justify-between py-4 text-sm font-medium"><span>Total</span><span>{brl(Number(order.total))}</span></li>
            </ul>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/minha-conta" className="btn-primary">Ver meus pedidos</Link>
              {(order.payment_status === "rejected" || order.payment_status === "cancelled") && (
                <Link to="/checkout" className="btn-outline">Tentar novamente</Link>
              )}
              <a href={whatsappUrl(`Olá! Gostaria de ajuda com o pedido #${order.order_number}.`)} target="_blank" rel="noreferrer" className="btn-outline">Falar no WhatsApp</a>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
