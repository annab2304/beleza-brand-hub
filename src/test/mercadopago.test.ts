import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Banco falso: registra o que o código tenta gravar.
const state = {
  order: { id: "order-1", total: 100, payment_status: "pending" } as { id: string; total: number; payment_status: string } | null,
  updates: [] as Record<string, unknown>[],
  rpcCalls: [] as { fn: string; args: unknown }[],
};

vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: state.order }) }) }),
      update: (values: Record<string, unknown>) => {
        state.updates.push(values);
        return { eq: async () => ({ error: null }) };
      },
    }),
    rpc: async (fn: string, args: unknown) => {
      state.rpcCalls.push({ fn, args });
      return { data: true, error: null };
    },
  },
}));

import { syncPayment, verifyWebhookSignature } from "@/lib/mercadopago.server";

function mockPayment(p: { status: string; amount: number; ref?: string | null }) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(JSON.stringify({ id: 555, status: p.status, transaction_amount: p.amount, external_reference: p.ref === undefined ? "order-1" : p.ref }), { status: 200 }),
    ),
  );
}

beforeEach(() => {
  state.order = { id: "order-1", total: 100, payment_status: "pending" };
  state.updates = [];
  state.rpcCalls = [];
  process.env["MERCADOPAGO_ACCESS_TOKEN"] = "TEST-token";
});
afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env["MERCADOPAGO_WEBHOOK_SECRET"];
});

describe("syncPayment", () => {
  it("confirma o pedido (e baixa estoque via função) quando o pagamento é aprovado e cobre o total", async () => {
    mockPayment({ status: "approved", amount: 100 });
    const r = await syncPayment("555");
    expect(r).toEqual({ orderId: "order-1", changed: true });
    expect(state.rpcCalls).toEqual([{ fn: "mark_order_paid", args: { p_order_id: "order-1", p_payment_id: "555" } }]);
  });

  it("NÃO confirma se o valor pago for menor que o total do pedido", async () => {
    mockPayment({ status: "approved", amount: 40 });
    const r = await syncPayment("555");
    expect(r.changed).toBe(false);
    expect(state.rpcCalls).toHaveLength(0);
  });

  it("não rebaixa um pedido já aprovado por causa de um aviso 'pending' atrasado", async () => {
    state.order = { id: "order-1", total: 100, payment_status: "approved" };
    mockPayment({ status: "pending", amount: 100 });
    const r = await syncPayment("555");
    expect(r.changed).toBe(false);
    expect(state.updates).toHaveLength(0);
  });

  it("registra pagamento recusado sem cancelar o pedido (a cliente pode tentar de novo)", async () => {
    mockPayment({ status: "rejected", amount: 100 });
    await syncPayment("555");
    expect(state.updates[0]).toMatchObject({ payment_status: "rejected" });
    expect(state.updates[0]).not.toHaveProperty("status");
  });

  it("marca reembolso como cancelado", async () => {
    state.order = { id: "order-1", total: 100, payment_status: "approved" };
    mockPayment({ status: "refunded", amount: 100 });
    await syncPayment("555");
    expect(state.updates[0]).toMatchObject({ payment_status: "refunded", status: "cancelled" });
  });

  it("ignora pagamento sem pedido associado ou id inválido", async () => {
    mockPayment({ status: "approved", amount: 100, ref: null });
    expect((await syncPayment("555")).orderId).toBeNull();
    expect((await syncPayment("abc")).orderId).toBeNull();
    expect(state.rpcCalls).toHaveLength(0);
  });
});

describe("verifyWebhookSignature", () => {
  async function sign(secret: string, id: string, requestId: string, ts: string) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`id:${id};request-id:${requestId};ts:${ts};`));
    return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  const req = (signature: string) => new Request("https://x.test/api", { headers: { "x-signature": signature, "x-request-id": "req-1" } });

  it("aceita tudo quando não há secret configurado (o pagamento é reconsultado no Mercado Pago)", async () => {
    expect(await verifyWebhookSignature(req(""), "123")).toBe(true);
  });

  it("aceita assinatura correta e rejeita adulterada", async () => {
    process.env["MERCADOPAGO_WEBHOOK_SECRET"] = "segredo";
    const v1 = await sign("segredo", "123", "req-1", "1700000000");
    expect(await verifyWebhookSignature(req(`ts=1700000000,v1=${v1}`), "123")).toBe(true);
    expect(await verifyWebhookSignature(req(`ts=1700000000,v1=${v1}`), "999")).toBe(false);
    expect(await verifyWebhookSignature(req("ts=1700000000,v1=deadbeef"), "123")).toBe(false);
    expect(await verifyWebhookSignature(req(""), "123")).toBe(false);
  });
});
