// E-mail de confirmação do pedido via Resend. SOMENTE servidor.
// Segredos: RESEND_API_KEY (obrigatório para enviar) e RESEND_FROM (opcional; para enviar a qualquer cliente
// o domínio precisa estar verificado no Resend, ex.: "Beleza em Detalhes <pedidos@seudominio.com.br>").
// Sem RESEND_API_KEY nada é enviado e o pedido segue normal.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CONTACT_EMAIL } from "@/lib/contact";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);

export async function sendOrderConfirmation(orderId: string): Promise<void> {
  const key = process.env["RESEND_API_KEY"];
  if (!key) return;
  try {
    const { data: o } = await supabaseAdmin
      .from("orders")
      .select("order_number,email,customer_name,subtotal,shipping_cost,total,shipping_service,shipping_days,order_items(name,quantity,unit_price)")
      .eq("id", orderId)
      .maybeSingle();
    if (!o) return;

    const rows = o.order_items
      .map((i) => `<tr><td style="padding:6px 0">${i.quantity}× ${esc(i.name)}</td><td style="padding:6px 0;text-align:right">${brl(Number(i.unit_price) * i.quantity)}</td></tr>`)
      .join("");
    const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#3b2a22">
      <h2 style="font-weight:normal">Obrigada pela sua compra, ${esc(o.customer_name.split(" ")[0] ?? "")}!</h2>
      <p>Recebemos o pagamento do pedido <strong>#${o.order_number}</strong>. Já estamos preparando tudo com carinho.</p>
      <table style="width:100%;border-collapse:collapse;border-top:1px solid #ddd;border-bottom:1px solid #ddd">${rows}</table>
      <p style="text-align:right">Frete (${esc(o.shipping_service ?? "entrega")}): ${brl(Number(o.shipping_cost))}<br><strong>Total: ${brl(Number(o.total))}</strong></p>
      ${o.shipping_days ? `<p>Prazo estimado de entrega: até ${o.shipping_days} dias úteis após o envio.</p>` : ""}
      <p>Acompanhe o pedido em <em>Minha conta</em> no site. Dúvidas? Responda este e-mail ou chame no WhatsApp.</p>
      <p style="color:#888;font-size:12px">Beleza em Detalhes · ${CONTACT_EMAIL}</p></div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env["RESEND_FROM"] ?? "Beleza em Detalhes <onboarding@resend.dev>",
        to: [o.email],
        bcc: [CONTACT_EMAIL],
        reply_to: CONTACT_EMAIL,
        subject: `Pedido #${o.order_number} confirmado — Beleza em Detalhes`,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error("[email] Resend recusou", res.status, await res.text());
  } catch (err) {
    console.error("[email] falha ao enviar confirmação", err); // nunca derruba o pagamento
  }
}
