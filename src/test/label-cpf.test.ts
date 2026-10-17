import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { isValidCpf } from "@/lib/cpf";
import { addShipmentToCart } from "@/lib/melhorenvio.server";

describe("isValidCpf", () => {
  it("aceita CPF válido, com ou sem pontuação", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("52998224725")).toBe(true);
  });
  it("recusa inválidos", () => {
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("529.982.247-24")).toBe(false);
    expect(isValidCpf("123")).toBe(false);
  });
});

const sender = { name: "Anna", phone: "(11) 98826-6483", email: "bemdetalhes@gmail.com", document: "529.982.247-25", address: "Rua A", number: "1", district: "Centro", city: "São Paulo", state_abbr: "sp", postal_code: "01001-000" };
const order = {
  orderNumber: 7, serviceId: 1, customerName: "Maria", phone: "11999999999", email: "m@x.com",
  address: { cep: "20040-020", street: "Rua B", number: "2", neighborhood: "Centro", city: "Rio", state: "RJ", document: "52998224725" },
  items: [{ name: "Anel", quantity: 2, unit_price: 44.04 }],
};

beforeEach(() => {
  process.env["MELHORENVIO_TOKEN"] = "t";
  process.env["MELHORENVIO_ORIGIN_CEP"] = "01001000";
  process.env["MELHORENVIO_CONTACT_EMAIL"] = "c@x.com";
  process.env["MELHORENVIO_SENDER"] = JSON.stringify(sender);
});
afterEach(() => {
  vi.unstubAllGlobals();
  for (const k of ["MELHORENVIO_TOKEN", "MELHORENVIO_ORIGIN_CEP", "MELHORENVIO_CONTACT_EMAIL", "MELHORENVIO_SENDER"]) delete process.env[k];
});

describe("addShipmentToCart", () => {
  it("monta o envio e devolve o id", async () => {
    const f = vi.fn(async () => new Response(JSON.stringify({ id: "abc-123" }), { status: 201 }));
    vi.stubGlobal("fetch", f);
    const r = await addShipmentToCart(order);
    expect(r.id).toBe("abc-123");
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://melhorenvio.com.br/api/v2/me/cart");
    const b = JSON.parse(init.body as string);
    expect(b.service).toBe(1);
    expect(b.from).toMatchObject({ document: "52998224725", postal_code: "01001000", state_abbr: "SP", phone: "11988266483" });
    expect(b.to).toMatchObject({ document: "52998224725", postal_code: "20040020", state_abbr: "RJ" });
    expect(b.products).toEqual([{ name: "Anel", quantity: 2, unitary_value: 44.04 }]);
    expect(b.volumes[0]).toMatchObject({ length: 16, width: 11, height: 3, weight: 0.2 });
    expect(b.options.insurance_value).toBe(88.08);
  });
  it("mostra o motivo quando o Melhor Envio recusa", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ message: "Dados inválidos", errors: { "to.document": ["CPF inválido"] } }), { status: 422 })));
    await expect(addShipmentToCart(order)).rejects.toThrow(/422.*CPF inválido/);
  });
  it("avisa se faltar o segredo do remetente", async () => {
    delete process.env["MELHORENVIO_SENDER"];
    await expect(addShipmentToCart(order)).rejects.toThrow(/MELHORENVIO_SENDER/);
  });
});
