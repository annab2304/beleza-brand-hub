import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { brl, clean, productQuery, productsQuery } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/produto/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(productQuery(params.slug)),
  head: ({ loaderData }) => {
    const name = loaderData ? clean(loaderData.name) : "Semijoia";
    const desc = clean(loaderData?.description).slice(0, 155) || "Semijoia Beleza em Detalhes.";
    const img = loaderData?.images[0];
    return {
      meta: [
        { title: `${name} — Beleza em Detalhes` },
        { name: "description", content: desc },
        { property: "og:title", content: `${name} — Beleza em Detalhes` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
    };
  },
  errorComponent: ({ error }) => <div className="p-10 text-center">Não foi possível carregar: {error instanceof Error ? error.message : String(error)}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Produto não encontrado.</div>,
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: p } = useQuery(productQuery(slug));
  const { addToCart, setCartOpen, toggleFavorite, isFavorite } = useStore();
  const [sel, setSel] = useState<(string | null)[]>([null, null, null]);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);

  const optNames = p ? [p.option1_name, p.option2_name, p.option3_name] : [];
  const keys = ["option1", "option2", "option3"] as const;
  const values = useMemo(
    () => keys.map((k) => (p ? Array.from(new Set(p.variants.map((v) => v[k]).filter(Boolean))) as string[] : [])),
    [p],
  );

  useEffect(() => {
    if (!p) return;
    // pré-seleciona opções que têm um único valor e a primeira variante
    const first = p.variants[0];
    setSel(keys.map((k, i) => { const vs = values[i] ?? []; return vs.length === 1 ? (vs[0] ?? null) : vs.length && i === 0 ? (first?.[k] ?? null) : null; }));
    setImgIdx(0);
    setQty(1);
  }, [p?.id]);

  if (!p) return null;

  const required = values.map((v) => v.length > 0);
  const K = (i: number) => keys[i] as (typeof keys)[number];
  const variant = p.variants.find((v) => keys.every((k, i) => !required[i] || v[k] === sel[i]));
  const complete = required.every((r, i) => !r || sel[i]);
  const isAvailable = (i: number, val: string) =>
    p.variants.some((v) => v[K(i)] === val && keys.every((k, j) => j === i || j > i || !required[j] || !sel[j] || v[k] === sel[j]));

  const isAvailableAfter = (j: number, s: (string | null)[], i: number, val: string) =>
    !s[j] || p.variants.some((v) => v[K(i)] === val && v[K(j)] === s[j]);
  const gallery = [...p.images];
  if (variant?.image_url && !gallery.includes(variant.image_url)) gallery.unshift(variant.image_url);
  const shown = gallery[imgIdx] ?? gallery[0];

  const price = variant?.price ?? Math.min(...p.variants.map((v) => v.price));
  const fav = isFavorite(p.id);

  const add = (buyNow: boolean) => {
    if (!complete || !variant) {
      toast.error(`Selecione ${optNames.filter((n, i) => required[i] && !sel[i]).join(" e ").toLowerCase()}`);
      return;
    }
    addToCart({
      product_id: p.id,
      variant_id: variant.id,
      sku: variant.sku,
      slug: p.slug,
      name: p.name,
      options: keys.flatMap((k, i) => (variant[k] ? [{ name: optNames[i] ?? "Opção", value: variant[k]! }] : [])),
      image: variant.image_url ?? p.images[0] ?? null,
      price: variant.price,
      quantity: qty,
    });
    toast.success("Adicionado à sacola");
    if (buyNow) setCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-0 sm:px-6 lg:py-10">
        <nav className="hidden px-4 pb-6 text-xs text-muted-foreground sm:block sm:px-0">
          <Link to="/">Início</Link>
          {p.category && (<> <span className="mx-2">/</span><Link to="/categoria/$slug" params={{ slug: p.category.slug }}>{p.category.name}</Link></>)}
          <span className="mx-2">/</span><span className="text-foreground">{clean(p.name)}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <div className="flex flex-col-reverse gap-3 lg:flex-row">
              <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 sm:px-0 lg:w-20 lg:flex-col">
                {gallery.map((g, i) => (
                  <button key={g} type="button" onClick={() => setImgIdx(i)} className={cn("aspect-square w-16 shrink-0 overflow-hidden border transition-colors lg:w-full", (shown === g) ? "border-foreground" : "border-transparent opacity-70 hover:opacity-100")}>
                    <img src={g} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="relative aspect-square flex-1 overflow-hidden bg-cream">
                {shown && <img key={shown} src={shown} alt={clean(p.name)} className="reveal h-full w-full object-cover" />}
                {p.is_new && <span className="absolute left-3 top-3 bg-ivory px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.18em]">Novo</span>}
              </div>
            </div>
          </div>

          <div className="px-4 pb-10 sm:px-0 lg:col-span-5">
            {p.category && <p className="eyebrow">{p.category.name}</p>}
            <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">{clean(p.name)}</h1>
            <div className="mt-4 flex items-baseline gap-3">
              <span key={price} className="reveal text-xl font-medium">{brl(price)}</span>
              {variant?.compare_at_price && variant.compare_at_price > price && <span className="text-sm text-muted-foreground line-through">{brl(variant.compare_at_price)}</span>}
            </div>

            <div className="mt-8 space-y-6">
              {keys.map((_, i) =>
                values[i]?.length ? (
                  <div key={i}>
                    <p className="mb-3 text-xs uppercase tracking-[0.18em]">
                      {optNames[i] ?? "Opção"}: <span className="text-muted-foreground normal-case tracking-normal">{sel[i] ?? "selecione"}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(values[i] ?? []).map((val) => {
                        const ok = isAvailable(i, val);
                        return (
                          <button
                            key={val}
                            type="button"
                            disabled={!ok}
                            onClick={() => { setSel((s) => s.map((x, j) => (j === i ? val : j > i && !isAvailableAfter(j, s, i, val) ? null : x))); setImgIdx(0); }}
                            className={cn(
                              "min-w-12 border px-4 py-2.5 text-sm transition-all",
                              sel[i] === val ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground",
                              !ok && "cursor-not-allowed opacity-30 line-through",
                            )}
                          >
                            {optNames[i] === "Banho" && <span className={cn("mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle", val === "Ouro" ? "bg-gold" : "bg-nude")} />}
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null,
              )}

              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border">
                  <button type="button" aria-label="Diminuir" onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3.5"><Minus className="h-3.5 w-3.5" /></button>
                  <span className="w-8 text-center text-sm">{qty}</span>
                  <button type="button" aria-label="Aumentar" onClick={() => setQty((q) => q + 1)} className="p-3.5"><Plus className="h-3.5 w-3.5" /></button>
                </div>
                <button type="button" aria-label="Favoritar" onClick={() => { toggleFavorite(p.id); toast(fav ? "Removido dos favoritos" : "Salvo nos favoritos"); }} className="flex h-[50px] w-[50px] items-center justify-center border border-border transition-all hover:border-foreground active:scale-95">
                  <Heart className={cn("h-4 w-4", fav && "fill-cafe text-cafe")} strokeWidth={1.25} />
                </button>
              </div>

              <div className="grid gap-3">
                <button type="button" onClick={() => add(false)} className="btn-primary w-full py-4">Adicionar à sacola</button>
                <button type="button" onClick={() => add(true)} className="btn-outline w-full py-4">Comprar agora</button>
              </div>
            </div>

            <Accordion type="multiple" defaultValue={["desc"]} className="mt-10 border-t border-border">
              <AccordionItem value="desc">
                <AccordionTrigger className="text-xs uppercase tracking-[0.18em] hover:no-underline">Descrição</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{clean(p.description) || "—"}</AccordionContent>
              </AccordionItem>
              {["Cuidados", "Entrega", "Trocas"].map((t) => (
                <AccordionItem key={t} value={t}>
                  <AccordionTrigger className="text-xs uppercase tracking-[0.18em] hover:no-underline">{t}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">Informações em breve.</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
      {p.category && <Related category={p.category.slug} exclude={p.id} />}
      <SiteFooter />
    </div>
  );
}

function Related({ category, exclude }: { category: string; exclude: string }) {
  const q = useQuery(productsQuery({ category, pageSize: 5 }));
  const items = q.data?.items.filter((x) => x.id !== exclude).slice(0, 4) ?? [];
  if (!items.length) return null;
  return (
    <section className="bg-cream py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="mb-8 text-3xl sm:text-4xl">Você também vai <span className="script text-cafe">amar</span></h2>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
          {items.map((x) => <ProductCard key={x.id} p={x} />)}
        </div>
      </div>
    </section>
  );
}
