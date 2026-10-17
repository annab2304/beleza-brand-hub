// Cotação de frete no Melhor Envio. SOMENTE servidor.
// Segredos/variáveis (nunca no código):
//   MELHORENVIO_TOKEN          token da API (obrigatório)
//   MELHORENVIO_ORIGIN_CEP     CEP de onde você envia os pedidos (obrigatório)
//   MELHORENVIO_CONTACT_EMAIL  e-mail técnico exigido pelo Melhor Envio no User-Agent (obrigatório)
//   MELHORENVIO_ENV            "sandbox" para testes; qualquer outro valor = produção
import { DEFAULT_PACKAGE, type ShippingOption } from "@/lib/shipping.config";

export type QuoteLine = { sku: string; unit_price: number; quantity: number };

const UNAVAILABLE = "Frete indisponível no momento. Fale com a gente pelo WhatsApp.";

function config() {
  const token = process.env["MELHORENVIO_TOKEN"];
  const origin = (process.env["MELHORENVIO_ORIGIN_CEP"] ?? "").replace(/\D/g, "");
  const email = process.env["MELHORENVIO_CONTACT_EMAIL"];
  if (!token || origin.length !== 8 || !email) {
    console.error("[MelhorEnvio] configure MELHORENVIO_TOKEN, MELHORENVIO_ORIGIN_CEP (8 dígitos) e MELHORENVIO_CONTACT_EMAIL.");
    throw new Error(UNAVAILABLE);
  }
  const base = process.env["MELHORENVIO_ENV"] === "sandbox" ? "https://sandbox.melhorenvio.com.br" : "https://melhorenvio.com.br";
  return { token, origin, email, base };
}

type RawService = {
  id?: number;
  name?: string;
  price?: string | number;
  custom_price?: string | number;
  delivery_time?: number;
  custom_delivery_time?: number;
  company?: { name?: string };
  error?: unknown;
};

export async function quoteShipping(toCep: string, lines: QuoteLine[]): Promise<ShippingOption[]> {
  const { token, origin, email, base } = config();
  const to = toCep.replace(/\D/g, "");
  if (to.length !== 8) throw new Error("CEP inválido.");

  const body = {
    from: { postal_code: origin },
    to: { postal_code: to },
    products: lines.map((l) => ({
      id: l.sku,
      width: DEFAULT_PACKAGE.width,
      height: DEFAULT_PACKAGE.height,
      length: DEFAULT_PACKAGE.length,
      weight: DEFAULT_PACKAGE.weight,
      insurance_value: l.unit_price, // valor unitário; a API multiplica pela quantidade
      quantity: l.quantity,
    })),
  };

  let res: Response;
  try {
    res = await fetch(`${base}/api/v2/me/shipment/calculate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": `Beleza em Detalhes (${email})`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(12_000),
    });
  } catch (err) {
    console.error("[MelhorEnvio] falha de rede ao cotar", err);
    throw new Error(UNAVAILABLE);
  }
  if (!res.ok) {
    console.error("[MelhorEnvio] erro ao cotar", res.status, await res.text());
    throw new Error(UNAVAILABLE);
  }

  const raw = (await res.json()) as unknown;
  if (!Array.isArray(raw)) throw new Error(UNAVAILABLE);

  const options = (raw as RawService[])
    .filter((s) => !s.error && typeof s.id === "number")
    // custom_* já considera as taxas/descontos configurados na sua conta do Melhor Envio.
    .map((s) => ({
      id: s.id as number,
      name: s.name ?? "Entrega",
      company: s.company?.name ?? "",
      price: Number(s.custom_price ?? s.price),
      days: Number(s.custom_delivery_time ?? s.delivery_time),
    }))
    .filter((o) => Number.isFinite(o.price) && o.price >= 0)
    .map((o) => ({ ...o, price: Math.round(o.price * 100) / 100, days: Number.isFinite(o.days) ? o.days : 0 }))
    .sort((a, b) => a.price - b.price);

  if (options.length === 0) throw new Error("Não encontramos opções de entrega para esse CEP. Fale com a gente pelo WhatsApp.");
  return options;
}
