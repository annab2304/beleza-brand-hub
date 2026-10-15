import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export const CATEGORY_ORDER = ["brincos", "colares", "pulseiras", "aneis", "tornozeleiras", "conjuntos", "berloques"] as const;

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  is_new: boolean;
  price: number;
  compare_at_price: number | null;
  images: string[];
};

type Raw = {
  id: string;
  slug: string;
  name: string;
  is_new: boolean;
  product_images: { url: string; position: number }[];
  product_variants: { price: number; compare_at_price: number | null }[];
};

const CARD_SELECT = "id,slug,name,is_new,product_images(url,position),product_variants(price,compare_at_price)";

function toCard(r: Raw): ProductCardData {
  const prices = r.product_variants.map((v) => Number(v.price));
  const min = prices.length ? Math.min(...prices) : 0;
  const v = r.product_variants.find((x) => Number(x.price) === min);
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    is_new: r.is_new,
    price: min,
    compare_at_price: v?.compare_at_price ? Number(v.compare_at_price) : null,
    images: [...r.product_images].sort((a, b) => a.position - b.position).map((i) => i.url),
  };
}

export type ListParams = {
  category?: string;
  flag?: "new" | "bestseller";
  search?: string;
  sort?: "recentes" | "nome";
  page?: number;
  pageSize?: number;
};

export async function fetchProducts(p: ListParams) {
  const pageSize = p.pageSize ?? 24;
  const page = p.page ?? 1;
  const select = p.category ? `${CARD_SELECT},categories!inner(slug)` : CARD_SELECT;
  let q = supabase.from("products").select(select, { count: "exact" }).eq("status", "active");
  if (p.category) q = q.eq("categories.slug", p.category);
  if (p.flag === "new") q = q.eq("is_new", true);
  if (p.flag === "bestseller") q = q.eq("is_bestseller", true);
  if (p.search) q = q.ilike("name", `%${p.search}%`);
  q = p.sort === "nome" ? q.order("name") : q.order("created_at", { ascending: false }).order("name");
  const { data, error, count } = await q.range((page - 1) * pageSize, page * pageSize - 1);
  if (error) throw new Error(error.message);
  return { items: (data as unknown as Raw[]).map(toCard), total: count ?? 0 };
}

export const productsQuery = (p: ListParams) =>
  queryOptions({ queryKey: ["products", p], queryFn: () => fetchProducts(p), staleTime: 60_000 });

export type Category = { id: string; slug: string; name: string; image: string | null };

export const categoriesQuery = () =>
  queryOptions({
    queryKey: ["categories"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase.from("categories").select("id,slug,name,position").order("position");
      if (error) throw new Error(error.message);
      const out: Category[] = [];
      for (const c of data ?? []) {
        if (c.slug === "outros") continue;
        const { data: img } = await supabase
          .from("product_images")
          .select("url,products!inner(category_id,is_bestseller)")
          .eq("products.category_id", c.id)
          .eq("position", 0)
          .order("products(is_bestseller)", { ascending: false })
          .limit(1);
        out.push({ id: c.id, slug: c.slug, name: c.name, image: img?.[0]?.url ?? null });
      }
      return out;
    },
  });

export type Variant = {
  id: string;
  sku: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  position: number;
  active: boolean;
};

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  is_new: boolean;
  option1_name: string | null;
  option2_name: string | null;
  option3_name: string | null;
  category: { id: string; slug: string; name: string } | null;
  images: string[];
  variants: Variant[];
};

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    staleTime: 60_000,
    queryFn: async (): Promise<ProductDetail | null> => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id,slug,name,description,is_new,option1_name,option2_name,option3_name,categories(id,slug,name),product_images(url,position),product_variants(id,sku,option1,option2,option3,price,compare_at_price,image_url,position,active)",
        )
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
      const d = data as any;
      return {
        ...d,
        category: d.categories,
        images: [...d.product_images].sort((a: any, b: any) => a.position - b.position).map((i: any) => i.url),
        variants: [...d.product_variants]
          .filter((v: Variant) => v.active)
          .sort((a: Variant, b: Variant) => a.position - b.position)
          .map((v: Variant) => ({ ...v, price: Number(v.price), compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : null })),
      };
    },
  });

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Remove entidades HTML que vieram do fornecedor (&amp; etc.) */
export const clean = (s: string | null | undefined) =>
  (s ?? "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
