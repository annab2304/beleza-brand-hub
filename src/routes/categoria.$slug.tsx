import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";

import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { CATEGORY_LABELS, SiteHeader } from "@/components/site-header";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { productsQuery, type ListParams } from "@/lib/catalog";
import { cn } from "@/lib/utils";

type Search = { busca?: string | undefined; ordem?: "recentes" | "nome" | "preco-asc" | "preco-desc" | undefined; pagina?: number | undefined };

export const Route = createFileRoute("/categoria/$slug")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    busca: typeof s["busca"] === "string" && s["busca"] ? s["busca"] : undefined,
    ordem: s["ordem"] === "nome" || s["ordem"] === "preco-asc" || s["ordem"] === "preco-desc" ? s["ordem"] : undefined,
    pagina: Number(s["pagina"]) > 1 ? Number(s["pagina"]) : undefined,
  }),
  head: ({ params }) => {
    const label = CATEGORY_LABELS[params.slug] ?? "Todas as semijoias";
    return {
      meta: [
        { title: `${label} — Beleza em Detalhes` },
        { name: "description", content: `${label} em semijoias delicadas da Beleza em Detalhes.` },
        { property: "og:title", content: `${label} — Beleza em Detalhes` },
        { property: "og:description", content: `${label} em semijoias delicadas.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryPage,
});

const FILTERS = [["todos", "Todas"], ...Object.entries(CATEGORY_LABELS)] as [string, string][];

function CategoryPage() {
  const { slug } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const page = search.pagina ?? 1;
  const pageSize = 24;

  const params: ListParams = { search: search.busca, sort: search.ordem, page, pageSize };
  if (slug === "novidades") params.flag = "new";
  else if (slug === "mais-vendidos") params.flag = "bestseller";
  else if (slug !== "todos") params.category = slug;

  const q = useQuery(productsQuery(params));
  const total = q.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const label = search.busca ? `“${search.busca}”` : (CATEGORY_LABELS[slug] ?? "Todas as semijoias");

  const filterList = (onPick?: () => void) => (
    <ul className="space-y-1">
      {FILTERS.map(([s, l]) => (
        <li key={s}>
          <Link to="/categoria/$slug" params={{ slug: s }} onClick={onPick} className={cn("block py-1.5 text-sm transition-colors hover:text-foreground", s === slug ? "font-medium text-foreground" : "text-muted-foreground")}>
            {l}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-10 text-center sm:px-6 lg:py-14">
          <p className="eyebrow">{search.busca ? "Resultado da busca" : "Coleção"}</p>
          <h1 className="mt-2 text-4xl sm:text-6xl">{label}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{q.isLoading ? "Carregando…" : `${total} ${total === 1 ? "peça" : "peças"}`}</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[200px_1fr] lg:gap-12 lg:py-12">
        <aside className="hidden lg:block">
          <p className="eyebrow mb-4">Categorias</p>
          {filterList()}
        </aside>
        <div>
          <div className="mb-6 flex items-center justify-between gap-3">
            <Sheet>
              <SheetTrigger className="flex items-center gap-2 border border-border px-4 py-2.5 text-xs uppercase tracking-[0.18em] lg:hidden">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filtrar
              </SheetTrigger>
              <SheetContent side="left" className="bg-ivory">
                <SheetHeader><SheetTitle className="font-serif text-2xl font-normal">Filtrar</SheetTitle></SheetHeader>
                <div className="px-4">{filterList()}</div>
              </SheetContent>
            </Sheet>
            <select
              value={search.ordem ?? "recentes"}
              onChange={(e) => navigate({ search: (p: Search) => ({ ...p, ordem: e.target.value === "recentes" ? undefined : (e.target.value as Search["ordem"]), pagina: undefined }) })}
              className="ml-auto border border-border bg-transparent px-3 py-2.5 text-xs uppercase tracking-[0.12em]"
              aria-label="Ordenar"
            >
              <option value="recentes">Mais recentes</option>
              <option value="preco-asc">Menor preço</option>
              <option value="preco-desc">Maior preço</option>
              <option value="nome">Nome (A–Z)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3">
            {q.isLoading
              ? Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : q.data?.items.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
          {!q.isLoading && total === 0 && (
            <div className="py-20 text-center">
              <p className="script text-4xl text-cafe">nada por aqui</p>
              <p className="mt-2 text-sm text-muted-foreground">Tente outra busca ou categoria.</p>
            </div>
          )}

          {pages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Paginação">
              <button type="button" disabled={page <= 1} onClick={() => { navigate({ search: (p: Search) => ({ ...p, pagina: page - 1 > 1 ? page - 1 : undefined }) }); window.scrollTo({ top: 0 }); }} className="btn-outline px-5 py-2.5 disabled:opacity-30">Anterior</button>
              <span className="px-4 text-sm text-muted-foreground">{page} de {pages}</span>
              <button type="button" disabled={page >= pages} onClick={() => { navigate({ search: (p: Search) => ({ ...p, pagina: page + 1 }) }); window.scrollTo({ top: 0 }); }} className="btn-outline px-5 py-2.5 disabled:opacity-30">Próxima</button>
            </nav>
          )}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
