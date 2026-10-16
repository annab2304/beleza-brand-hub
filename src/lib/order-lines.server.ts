// Monta as linhas do pedido a partir do banco. SOMENTE servidor.
// O navegador envia só QUAL variante e QUANTAS: nome, foto e preço vêm sempre do banco.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type OrderLine = {
  product_id: string;
  variant_id: string;
  sku: string;
  name: string;
  options: { name: string; value: string }[];
  image_url: string | null;
  unit_price: number;
  quantity: number;
};

type CartInput = { variant_id: string; quantity: number }[];

export async function loadOrderLines(items: CartInput): Promise<OrderLine[]> {
  const ids = [...new Set(items.map((i) => i.variant_id))];
  const { data: variants, error } = await supabaseAdmin
    .from("product_variants")
    .select("id,sku,option1,option2,option3,price,active,image_url,product_id,products(name,status,option1_name,option2_name,option3_name,product_images(url,position))")
    .in("id", ids);
  if (error) throw new Error("Não foi possível validar sua sacola. Tente novamente.");

  const byId = new Map((variants ?? []).map((v) => [v.id, v]));
  return items.map((item) => {
    const v = byId.get(item.variant_id);
    const p = v?.products as unknown as {
      name: string;
      status: string;
      option1_name: string | null;
      option2_name: string | null;
      option3_name: string | null;
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
}

export const sumLines = (lines: OrderLine[]) => Math.round(lines.reduce((s, l) => s + l.unit_price * l.quantity, 0) * 100) / 100;
