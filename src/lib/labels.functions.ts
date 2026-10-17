import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

// Só o administrador pode usar. Código sensível fica dentro do handler (import dinâmico).
export const createShippingLabel = createServerFn({ method: "POST" })
  .inputValidator(z.object({ orderId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { addShipmentToCart } = await import("@/lib/melhorenvio.server");

    const bearer = getRequestHeader("authorization");
    const { data: u } = bearer?.startsWith("Bearer ") ? await supabaseAdmin.auth.getUser(bearer.slice(7)) : { data: { user: null } };
    if (!u.user) throw new Error("Entre como administradora.");
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (!isAdmin) throw new Error("Sem permissão.");

    const { data: o } = await supabaseAdmin
      .from("orders")
      .select("id,order_number,customer_name,customer_phone,email,shipping_address,shipping_service_id,payment_status,me_shipment_id,order_items(name,quantity,unit_price)")
      .eq("id", data.orderId)
      .maybeSingle();
    if (!o) throw new Error("Pedido não encontrado.");
    if (o.payment_status !== "approved") throw new Error("O pagamento deste pedido ainda não foi aprovado.");
    if (o.me_shipment_id) throw new Error("Este pedido já foi enviado ao Melhor Envio.");
    if (!o.shipping_service_id) throw new Error("Este pedido não guardou o serviço de frete (é anterior à atualização). Crie a etiqueta direto no Melhor Envio.");

    const a = (o.shipping_address ?? {}) as Record<string, string>;
    if (!a["document"]) throw new Error("Este pedido não tem o CPF do cliente. Crie a etiqueta direto no Melhor Envio.");

    const { id, panelUrl } = await addShipmentToCart({
      orderNumber: o.order_number,
      serviceId: o.shipping_service_id,
      customerName: o.customer_name,
      phone: (o.customer_phone ?? "").replace(/\D/g, ""),
      email: o.email,
      address: {
        cep: a["cep"] ?? "", street: a["street"] ?? "", number: a["number"] ?? "", complement: a["complement"],
        neighborhood: a["neighborhood"] ?? "", city: a["city"] ?? "", state: a["state"] ?? "", document: a["document"],
      },
      items: o.order_items.map((i) => ({ name: i.name, quantity: i.quantity, unit_price: Number(i.unit_price) })),
    });

    await supabaseAdmin.from("orders").update({ me_shipment_id: id, status: "preparing" }).eq("id", o.id);
    return { shipmentId: id, panelUrl };
  });
