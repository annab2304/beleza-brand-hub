import { createFileRoute } from "@tanstack/react-router";

// Endereço que o Mercado Pago avisa quando um pagamento muda de situação:
//   https://SEU-SITE/api/mercadopago/webhook
export const Route = createFileRoute("/api/mercadopago/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { syncPayment, verifyWebhookSignature } = await import("@/lib/mercadopago.server");

        const url = new URL(request.url);
        let type = url.searchParams.get("type") ?? url.searchParams.get("topic");
        let dataId = url.searchParams.get("data.id") ?? url.searchParams.get("id");

        if (!dataId) {
          const body = (await request.json().catch(() => null)) as { type?: string; data?: { id?: string | number } } | null;
          type = type ?? body?.type ?? null;
          dataId = body?.data?.id != null ? String(body.data.id) : null;
        }

        // Só nos interessam avisos de pagamento; os demais são confirmados e ignorados.
        if (type !== "payment" || !dataId) return new Response("ignored", { status: 200 });

        if (!(await verifyWebhookSignature(request, dataId))) {
          return new Response("invalid signature", { status: 401 });
        }

        try {
          await syncPayment(dataId);
          return new Response("ok", { status: 200 });
        } catch (err) {
          console.error("[MercadoPago] erro no webhook", err);
          return new Response("error", { status: 500 }); // o Mercado Pago tenta de novo
        }
      },
      GET: async () => new Response("ok", { status: 200 }),
    },
  },
});
