import { describe, expect, it, vi } from "vitest";

const rows = [
  { id: "1", slug: "a", name: "Anel A", is_new: false, product_images: [], product_variants: [{ price: 50, compare_at_price: null }, { price: 30, compare_at_price: null }] },
  { id: "2", slug: "b", name: "Brinco B", is_new: false, product_images: [], product_variants: [{ price: 20, compare_at_price: null }] },
  { id: "3", slug: "c", name: "Colar C", is_new: false, product_images: [], product_variants: [{ price: 90, compare_at_price: null }] },
];

vi.mock("@/integrations/supabase/client", () => {
  const q: Record<string, unknown> = {};
  const chain = () => q;
  q["select"] = chain; q["eq"] = chain; q["ilike"] = chain; q["order"] = chain;
  q["range"] = async () => ({ data: rows, error: null, count: rows.length });
  return { supabase: { from: () => q } };
});

import { fetchProducts } from "@/lib/catalog";

describe("ordenar por preço", () => {
  it("menor preço primeiro (usa o menor preço entre as variantes)", async () => {
    const r = await fetchProducts({ sort: "preco-asc" });
    expect(r.items.map((i) => i.price)).toEqual([20, 30, 90]);
    expect(r.total).toBe(3);
  });
  it("maior preço primeiro e paginação", async () => {
    const r = await fetchProducts({ sort: "preco-desc", pageSize: 2, page: 2 });
    expect(r.items.map((i) => i.price)).toEqual([20]);
    expect(r.total).toBe(3);
  });
});
