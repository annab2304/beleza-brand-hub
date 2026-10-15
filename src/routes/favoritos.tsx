import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";
import { type ProductCardData } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/favoritos")({
  head: () => ({
    meta: [
      { title: "Favoritos — Beleza em Detalhes" },
      { name: "description", content: "Suas semijoias favoritas da Beleza em Detalhes." },
      { property: "og:title", content: "Favoritos — Beleza em Detalhes" },
      { property: "og:description", content: "Suas semijoias favoritas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Favorites,
});

function Favorites() {
  const { favorites } = useStore();
  const q = useQuery({
    queryKey: ["favs", favorites],
    enabled: favorites.length > 0,
    queryFn: async (): Promise<ProductCardData[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("id,slug,name,is_new,product_images(url,position),product_variants(price,compare_at_price)")
        .in("id", favorites);
      if (error) throw new Error(error.message);
      return (data as any[]).map((r) => ({
        id: r.id, slug: r.slug, name: r.name, is_new: r.is_new,
        price: Math.min(...r.product_variants.map((v: any) => Number(v.price))),
        compare_at_price: null,
        images: [...r.product_images].sort((a: any, b: any) => a.position - b.position).map((i: any) => i.url),
      }));
    },
  });
  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h1 className="text-center text-4xl sm:text-5xl">Meus <span className="script text-cafe">favoritos</span></h1>
        {favorites.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">Toque no coração das peças que você amar para guardá-las aqui.</p>
            <Link to="/categoria/$slug" params={{ slug: "todos" }} className="btn-primary mt-8">Explorar a coleção</Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
            {q.data?.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
