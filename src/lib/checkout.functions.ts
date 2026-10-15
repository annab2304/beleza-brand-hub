import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

// Este arquivo vai para o bundle do navegador: o código sensível fica dentro dos
// handlers e é carregado com import() dinâmico (somente no servidor).

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
  items: z
    .array(z.object({ variant_id: z.string().uuid(), quantity: z.number().int().min(1).max(20) }))
    .min(1, "Sua sacola está vazia")
    .max(50),
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

    // Login é opcional: se houver sessão válida, o pedido fica ligado à conta.
    let userId: string | null = null;
    const bearer = getRequestHeader("authorization");
    if (bearer?.startsWith("Bearer ")) {
      const { data: u } = await supabaseAdmin.auth.getUser(bearer.slice(7));
      userId = u.user?.id ?? null;
    }

    // Preços e dados do produto SEMPRE do banco — nunca confiar no que o navegador manda.
    const ids = [...new Set(data.items.map((i) => i.variant_id))];
    const { data: variants, error } = await supabaseAdmin
      .from("product_variants")
      .select("id,sku,option1,option2,option3,price,active,image_url,product_id,products(name,status,option1_name,option2_name,option3_name,product_images(url,position))")
      .in("id", ids);
    if (error) throw new Error("Não foi possível validar sua sacola. Tente novamente.");

    const byId = new Map((variants ?? []).map((v) => [v.id, v]));
    const lines = data.items.map((item) => {
      const v = byId.get(item.variant_id);
      const p = v?.products as unknown as {
        name: string; status: string;
        option1_name: string | null; option2_name: string | null; option3_name: string | null;
        product_images: { url: string; position: number }[];
      } | null;
      if (!v || !p || !v.active || p.status !== "active") {
        throw new Error("Um dos itens da sacola não está mais disponível. Remova-o e tente de novo.");
      }
      const options = [
        { name: p.option1_name ?? "Opção", value: v.option1 },
        { name: p.option2_name ?? "Opção", value: v.option2 },
        { name: p.option3_name ?? "Opção", value: v.option3 },
      ].filter((o): o is { name: string; value: string } => !!o.value);
      const image = v.image_url ?? [...p.product_images].sort((a, b) => a.position - b.position)[0]?.url ?? null;
      return {
        product_id: v.product_id,
        variant_id: v.id,
        sku: v.sku,
        name: p.name,
        options,
        image_url: image,
        unit_price: Number(v.price),
        quantity: item.quantity,
      };
    });

    const subtotal = Math.round(lines.reduce((s, l) => s + l.unit_price * l.quantity, 0) * 100) / 100;
    const shippingCost = 0; // frete ainda não definido pela loja
    const total = subtotal + shippingCost;
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
        items: lines.map((l) => ({
          id: l.sku,
          title: [l.name, ...l.options.map((o) => o.value)].join(" - ").slice(0, 250),
          quantity: l.quantity,
          unit_price: l.unit_price,
        })),
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
