import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { quoteShipping } from "@/lib/melhorenvio.server";

const lines = [{ sku: "ANEL-1", unit_price: 89.9, quantity: 2 }];

function mockResponse(body: unknown, status = 200) {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  process.env["MELHORENVIO_TOKEN"] = "token-de-teste";
  process.env["MELHORENVIO_ORIGIN_CEP"] = "01001-000";
  process.env["MELHORENVIO_CONTACT_EMAIL"] = "contato@exemplo.com";
  delete process.env["MELHORENVIO_ENV"];
});
afterEach(() => {
  vi.unstubAllGlobals();
  for (const k of ["MELHORENVIO_TOKEN", "MELHORENVIO_ORIGIN_CEP", "MELHORENVIO_CONTACT_EMAIL", "MELHORENVIO_ENV"]) delete process.env[k];
});

describe("quoteShipping", () => {
  it("monta a requisição certa e devolve as opções da mais barata para a mais cara", async () => {
    const fetchMock = mockResponse([
      { id: 2, name: "SEDEX", price: "40.00", custom_price: "35.50", custom_delivery_time: 2, company: { name: "Correios" } },
      { id: 1, name: "PAC", price: "20.00", custom_price: "18.90", custom_delivery_time: 6, company: { name: "Correios" } },
    ]);

    const options = await quoteShipping("20040-020", lines);

    expect(options.map((o) => [o.id, o.price, o.days])).toEqual([[1, 18.9, 6], [2, 35.5, 2]]);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://melhorenvio.com.br/api/v2/me/shipment/calculate");
    const headers = init.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer token-de-teste");
    expect(headers["User-Agent"]).toContain("contato@exemplo.com");
    const body = JSON.parse(init.body as string);
    expect(body.from.postal_code).toBe("01001000");
    expect(body.to.postal_code).toBe("20040020");
    expect(body.products[0]).toMatchObject({ id: "ANEL-1", insurance_value: 89.9, quantity: 2, width: 11, height: 2, length: 16 });
  });

  it("usa o ambiente de testes quando MELHORENVIO_ENV=sandbox", async () => {
    process.env["MELHORENVIO_ENV"] = "sandbox";
    const fetchMock = mockResponse([{ id: 1, name: "PAC", price: "20.00", delivery_time: 5, company: { name: "Correios" } }]);
    await quoteShipping("20040020", lines);
    expect((fetchMock.mock.calls[0] as unknown as [string])[0]).toContain("sandbox.melhorenvio.com.br");
  });

  it("ignora serviços indisponíveis (com erro) e usa price quando não há custom_price", async () => {
    mockResponse([
      { id: 3, name: ".Package", error: "Serviço indisponível para o trecho", company: { name: "Jadlog" } },
      { id: 1, name: "PAC", price: "21.00", delivery_time: 5, company: { name: "Correios" } },
    ]);
    const options = await quoteShipping("20040020", lines);
    expect(options).toHaveLength(1);
    expect(options[0]).toMatchObject({ id: 1, price: 21, days: 5 });
  });

  it("falha com mensagem amigável quando não há nenhuma opção", async () => {
    mockResponse([{ id: 3, name: ".Package", error: "indisponível", company: { name: "Jadlog" } }]);
    await expect(quoteShipping("20040020", lines)).rejects.toThrow(/opções de entrega/);
  });

  it("falha com mensagem amigável se o Melhor Envio responder erro", async () => {
    mockResponse({ message: "Unauthenticated." }, 401);
    await expect(quoteShipping("20040020", lines)).rejects.toThrow(/Frete indisponível/);
  });

  it("falha se o token, o CEP de origem ou o e-mail não estiverem configurados", async () => {
    delete process.env["MELHORENVIO_TOKEN"];
    await expect(quoteShipping("20040020", lines)).rejects.toThrow(/Frete indisponível/);
  });

  it("recusa CEP de destino inválido", async () => {
    await expect(quoteShipping("123", lines)).rejects.toThrow(/CEP inválido/);
  });
});
