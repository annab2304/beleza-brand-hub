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

// ---------------------------------------------------------------------------
// Etiqueta: cria o envio no CARRINHO do Melhor Envio (não gasta saldo).
// Você confere, paga e imprime a etiqueta no painel do Melhor Envio.
// Segredo extra: MELHORENVIO_SENDER = JSON com os dados de quem envia, ex.:
// {"name":"Anna Beatriz","phone":"11988266483","email":"bemdetalhes@gmail.com","document":"00000000000",
//  "address":"Rua X","number":"10","complement":"","district":"Bairro","city":"São Paulo","state_abbr":"SP","postal_code":"01001000"}
// ---------------------------------------------------------------------------
export type Sender = {
  name: string; phone: string; email: string; document: string;
  address: string; number: string; complement?: string; district: string; city: string; state_abbr: string; postal_code: string;
};

function sender(): Sender {
  const raw = process.env["MELHORENVIO_SENDER"];
  if (!raw) throw new Error("Falta configurar o segredo MELHORENVIO_SENDER (dados de quem envia).");
  let s: Partial<Sender>;
  try {
    s = JSON.parse(raw) as Partial<Sender>;
  } catch {
    throw new Error("O segredo MELHORENVIO_SENDER não é um JSON válido.");
  }
  const required: (keyof Sender)[] = ["name", "phone", "email", "document", "address", "number", "district", "city", "state_abbr", "postal_code"];
  const missing = required.filter((k) => !String(s[k] ?? "").trim());
  if (missing.length) throw new Error(`MELHORENVIO_SENDER sem: ${missing.join(", ")}.`);
  return {
    ...(s as Sender),
    document: String(s.document).replace(/\D/g, ""),
    phone: String(s.phone).replace(/\D/g, ""),
    postal_code: String(s.postal_code).replace(/\D/g, ""),
    state_abbr: String(s.state_abbr).toUpperCase(),
  };
}

export type CartOrder = {
  orderNumber: number;
  serviceId: number;
  customerName: string;
  phone: string;
  email: string;
  address: { cep: string; street: string; number: string; complement?: string | undefined; neighborhood: string; city: string; state: string; document: string };
  items: { name: string; quantity: number; unit_price: number }[];
};

export async function addShipmentToCart(o: CartOrder): Promise<{ id: string; panelUrl: string }> {
  const { token, email, base } = config();
  const from = sender();
  const qty = o.items.reduce((n, i) => n + i.quantity, 0);
  const insurance = Math.round(o.items.reduce((n, i) => n + i.unit_price * i.quantity, 0) * 100) / 100;

  const body = {
    service: o.serviceId,
    from: { ...from, country_id: "BR" },
    to: {
      name: o.customerName,
      phone: o.phone,
      email: o.email,
      document: o.address.document,
      address: o.address.street,
      number: o.address.number,
      complement: o.address.complement ?? "",
      district: o.address.neighborhood,
      city: o.address.city,
      state_abbr: o.address.state,
      country_id: "BR",
      postal_code: o.address.cep.replace(/\D/g, ""),
    },
    products: o.items.map((i) => ({ name: i.name.slice(0, 120), quantity: i.quantity, unitary_value: i.unit_price })),
    // Uma embalagem só (Correios/Loggi/J&T não aceitam vários volumes). Confira as medidas no painel antes de pagar.
    volumes: [{
      length: DEFAULT_PACKAGE.length,
      width: DEFAULT_PACKAGE.width,
      height: DEFAULT_PACKAGE.height + Math.max(0, qty - 1),
      weight: Math.round(DEFAULT_PACKAGE.weight * qty * 1000) / 1000,
    }],
    options: { insurance_value: insurance, receipt: false, own_hand: false, reverse: false, tags: [{ tag: `Pedido #${o.orderNumber}`, url: null }] },
  };

  const res = await fetch(`${base}/api/v2/me/cart`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": `Beleza em Detalhes (${email})`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error("[MelhorEnvio] erro ao criar envio no carrinho", res.status, text);
    let detail = "";
    try {
      const j = JSON.parse(text) as { message?: string; errors?: Record<string, string[]> };
      detail = [j.message, ...Object.values(j.errors ?? {}).flat()].filter(Boolean).join(" · ");
    } catch { /* sem JSON */ }
    throw new Error(`O Melhor Envio recusou o envio (${res.status})${detail ? `: ${detail.slice(0, 300)}` : "."}`);
  }
  const json = JSON.parse(text) as { id?: string };
  if (!json.id) throw new Error("Resposta inesperada do Melhor Envio ao criar o envio.");
  return { id: json.id, panelUrl: `${base}/painel/carrinho` };
}
