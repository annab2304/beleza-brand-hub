// Integração com o Mercado Pago (Checkout Pro). SOMENTE servidor.
// O token fica em variável de ambiente (secret) — nunca no código nem no navegador.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const MP_API = "https://api.mercadopago.com";

function accessToken(): string {
  const token = process.env["MERCADOPAGO_ACCESS_TOKEN"];
  if (!token) {
    console.error("[MercadoPago] MERCADOPAGO_ACCESS_TOKEN não configurado.");
    throw new Error("Pagamento indisponível no momento. Fale com a gente pelo WhatsApp.");
  }
  return token;
}

export type MpPreferenceItem = { id: string; title: string; quantity: number; unit_price: number };

export async function createPreference(args: {
  orderId: string;
  items: MpPreferenceItem[];
  payer: { name: string; email: string };
  origin: string;
}): Promise<{ id: string; init_point: string }> {
  const { orderId, items, payer, origin } = args;
  const isHttps = origin.startsWith("https://");
  const returnUrl = `${origin}/pedido/${orderId}`;

  const body: Record<string, unknown> = {
    items: items.map((i) => ({ ...i, currency_id: "BRL" })),
    payer: { name: payer.name, email: payer.email },
    external_reference: orderId,
    statement_descriptor: "BELEZA DETALHES", // o Mercado Pago aceita no máximo 16 caracteres
    back_urls: { success: returnUrl, pending: returnUrl, failure: returnUrl },
  };
  // O Mercado Pago só aceita retorno automático e webhook em endereços HTTPS públicos.
  if (isHttps) {
    body["auto_return"] = "approved";
    body["notification_url"] = `${origin}/api/mercadopago/webhook`;
  }

  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": orderId,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error("[MercadoPago] erro ao criar preferência", res.status, await res.text());
    throw new Error("Não foi possível iniciar o pagamento. Tente novamente.");
  }
  const json = (await res.json()) as { id?: string; init_point?: string };
  if (!json.id || !json.init_point) throw new Error("Resposta inesperada do Mercado Pago.");
  return { id: json.id, init_point: json.init_point };
}

type MpPayment = {
  id: number | string;
  status: string;
  external_reference: string | null;
  transaction_amount: number;
};

export async function fetchPayment(paymentId: string): Promise<MpPayment | null> {
  if (!/^\d+$/.test(paymentId)) return null;
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken()}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Mercado Pago respondeu ${res.status} ao consultar o pagamento.`);
  return (await res.json()) as MpPayment;
}

const STATUS_MAP: Record<string, string> = {
  approved: "approved",
  authorized: "in_process",
  pending: "pending",
  in_process: "in_process",
  in_mediation: "in_process",
  rejected: "rejected",
  cancelled: "cancelled",
  refunded: "refunded",
  charged_back: "refunded",
};

/**
 * Lê o pagamento DIRETO no Mercado Pago (fonte de verdade — nunca confia no que veio
 * na notificação) e atualiza o pedido correspondente. Seguro para chamar várias vezes.
 */
export async function syncPayment(paymentId: string): Promise<{ orderId: string | null; changed: boolean }> {
  const payment = await fetchPayment(paymentId);
  const orderId = payment?.external_reference;
  if (!payment || !orderId) return { orderId: null, changed: false };

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id,total,payment_status")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { orderId: null, changed: false };

  const next = STATUS_MAP[payment.status] ?? "pending";

  if (next === "approved") {
    // Só confirma se o valor pago cobre o total do pedido.
    if (Number(payment.transaction_amount) + 0.009 < Number(order.total)) {
      console.error("[MercadoPago] valor pago menor que o total do pedido", orderId, payment.transaction_amount, order.total);
      return { orderId, changed: false };
    }
    const { data, error } = await supabaseAdmin.rpc("mark_order_paid", {
      p_order_id: orderId,
      p_payment_id: String(payment.id),
    });
    if (error) throw new Error(error.message);
    return { orderId, changed: data === true };
  }

  if (next === "refunded") {
    await supabaseAdmin
      .from("orders")
      .update({ payment_status: "refunded", status: "cancelled", mp_payment_id: String(payment.id), updated_at: new Date().toISOString() })
      .eq("id", orderId);
    return { orderId, changed: true };
  }

  // Pagamento ainda não aprovado: nunca "desfaz" um pedido já aprovado.
  if (order.payment_status === "approved" || order.payment_status === next) return { orderId, changed: false };
  await supabaseAdmin
    .from("orders")
    .update({
      payment_status: next,
      ...(next === "cancelled" ? { status: "cancelled" } : {}),
      mp_payment_id: String(payment.id),
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  return { orderId, changed: true };
}

function hex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Valida o header x-signature do webhook. Retorna true se não houver secret configurado. */
export async function verifyWebhookSignature(request: Request, dataId: string): Promise<boolean> {
  const secret = process.env["MERCADOPAGO_WEBHOOK_SECRET"];
  if (!secret) return true; // opcional: o pagamento é sempre reconsultado no Mercado Pago de qualquer forma

  const signature = request.headers.get("x-signature") ?? "";
  const requestId = request.headers.get("x-request-id") ?? "";
  const parts = Object.fromEntries(
    signature.split(",").map((p) => {
      const [k, ...v] = p.trim().split("=");
      return [k, v.join("=")];
    }),
  ) as Record<string, string>;
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
  const manifest = `id:${id};request-id:${requestId};ts:${ts};`;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(manifest)));
  return safeEqual(expected, v1);
}
