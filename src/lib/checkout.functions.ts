import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

// Este arquivo vai para o bundle do navegador: o código sensível fica dentro dos
// handlers e é carregado com import() dinâmico (somente no servidor).

const cartItems = z
  .array(z.object({ variant_id: z.string().uuid(), quantity: z.number().int().min(1).max(20) }))
  .min(1, "Sua sacola está vazia")
  .max(50);

const checkoutInput = z.object({
  customer: z.object({
    name: z.string().trim().min(3, "Informe seu nome completo").max(120),
    email: z.string().trim().email("E-mail inválido").max(160),
    phone: z.string().trim().regex(/^\d{10,11}$/, "Telefone com DDD, só números"),
  }),
  address: z.object({
    cep: z.string().trim().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
    street: z.string().trim().min(2).max(160),
    number: z.string().trim().min(1).max(20),
    complement: z.string().trim().max(80).optional(),
    neighborhood: z.string().trim().min(2).max(100),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().length(2).toUpperCase(),
  }),
  // O cliente envia só QUAL variante e QUANTAS. Nome, foto e preço vêm sempre do banco.
  items: cartItems,
  // Só o código do serviço escolhido: o valor do frete é recotado no servidor.
  shipping: z.object({ service_id: z.number().int() }),
});

function siteOrigin(): string {
  const fromEnv = process.env["SITE_URL"];
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  const origin = getRequestHeader("origin");
  if (origin) return origin;
  return new URL(getRequest().url).origin;
}

export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator(checkoutInput)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createPreference } = await import("@/lib/mercadopago.server");
    const { loadOrderLines, sumLines } = await import("@/lib/order-lines.server");
    const { quoteShipping } = await import("@/lib/melhorenvio.server");

    // Login é opcional: se houver sessão válida, o pedido fica ligado à conta.
    let userId: string | null = null;
    const bearer = getRequestHeader("authorization");
    if (bearer?.startsWith("Bearer ")) {
      const { data: u } = await supabaseAdmin.auth.getUser(bearer.slice(7));
      userId = u.user?.id ?? null;
    }

    // Preços e dados do produto SEMPRE do banco — nunca confiar no que o navegador manda.
    const lines = await loadOrderLines(data.items);
    const subtotal = sumLines(lines);

    // O frete também é recotado aqui: o valor que veio do navegador não é usado.
    const options = await quoteShipping(
      data.address.cep,
      lines.map((l) => ({ sku: l.sku, unit_price: l.unit_price, quantity: l.quantity })),
    );
    const shipping = options.find((o) => o.id === data.shipping.service_id);
    if (!shipping) throw new Error("A opção de frete escolhida não está mais disponível. Calcule o frete de novo.");
    const shippingCost = shipping.price;
    const total = Math.round((subtotal + shippingCost) * 100) / 100;
    if (total <= 0) throw new Error("Valor do pedido inválido.");

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        email: data.customer.email.toLowerCase(),
        customer_name: data.customer.name,
        customer_phone: data.customer.phone,
        shipping_address: data.address,
        subtotal,
        shipping_cost: shippingCost,
        shipping_service: `${shipping.company} ${shipping.name}`.trim(),
        shipping_days: shipping.days,
        total,
      })
      .select("id")
      .single();
    if (orderError || !order) throw new Error("Não foi possível registrar o pedido. Tente novamente.");

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(lines.map((l) => ({ ...l, order_id: order.id })));
    if (itemsError) {
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      throw new Error("Não foi possível registrar o pedido. Tente novamente.");
    }

    try {
      const pref = await createPreference({
        orderId: order.id,
        items: [
          ...lines.map((l) => ({
            id: l.sku,
            title: [l.name, ...l.options.map((o) => o.value)].join(" - ").slice(0, 250),
            quantity: l.quantity,
            unit_price: l.unit_price,
          })),
          // O frete entra como um item, para o total cobrado no Mercado Pago bater com o do pedido.
          ...(shippingCost > 0
            ? [{ id: "FRETE", title: `Frete - ${shipping.company} ${shipping.name}`.trim().slice(0, 250), quantity: 1, unit_price: shippingCost }]
            : []),
        ],
        payer: { name: data.customer.name, email: data.customer.email },
        origin: siteOrigin(),
      });
      await supabaseAdmin.from("orders").update({ mp_preference_id: pref.id }).eq("id", order.id);
      return { orderId: order.id, checkoutUrl: pref.init_point };
    } catch (err) {
      await supabaseAdmin
        .from("orders")
        .update({ status: "cancelled", payment_status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", order.id);
      throw err;
    }
  });

const shippingInput = z.object({
  cep: z.string().trim().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  items: cartItems,
});

/** Opções de frete (Melhor Envio) para o CEP e a sacola informados. */
export const getShippingOptions = createServerFn({ method: "POST" })
  .inputValidator(shippingInput)
  .handler(async ({ data }) => {
    const { loadOrderLines } = await import("@/lib/order-lines.server");
    const { quoteShipping } = await import("@/lib/melhorenvio.server");
    const lines = await loadOrderLines(data.items);
    return quoteShipping(
      data.cep,
      lines.map((l) => ({ sku: l.sku, unit_price: l.unit_price, quantity: l.quantity })),
    );
  });

const statusInput = z.object({
  orderId: z.string().uuid(),
  // O Mercado Pago devolve o payment_id na URL de retorno; usamos para confirmar sem esperar o webhook.
  paymentId: z.string().regex(/^\d+$/).optional(),
});

export const getOrderStatus = createServerFn({ method: "GET" })
  .inputValidator(statusInput)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.paymentId) {
      const { syncPayment } = await import("@/lib/mercadopago.server");
      try {
        await syncPayment(data.paymentId);
      } catch (err) {
        console.error("[MercadoPago] falha ao sincronizar no retorno", err); // o webhook ainda confirma
      }
    }

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("order_number,status,payment_status,total,created_at,order_items(name,options,image_url,unit_price,quantity)")
      .eq("id", data.orderId)
      .maybeSingle();
    return order;
  });
