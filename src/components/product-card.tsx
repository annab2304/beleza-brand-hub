import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import { brl, clean, type ProductCardData } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProductCard({ p }: { p: ProductCardData }) {
  const { toggleFavorite, isFavorite } = useStore();
  const fav = isFavorite(p.id);
  const [img1, img2] = p.images;
  return (
    <div className="group relative">
      <Link to="/produto/$slug" params={{ slug: p.slug }} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-cream">
          {img1 && (
            <img
              src={img1}
              alt={clean(p.name)}
              loading="lazy"
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.04]",
                img2 && "lg:group-hover:opacity-0",
              )}
            />
          )}
          {img2 && (
            <img src={img2} alt="" aria-hidden loading="lazy" className="absolute inset-0 hidden h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100 lg:block" />
          )}
          <div className="absolute left-2.5 top-2.5 flex gap-1.5">
            {p.is_new && <span className="bg-ivory px-2 py-1 text-[0.58rem] font-medium uppercase tracking-[0.18em]">Novo</span>}
            {p.compare_at_price && p.compare_at_price > p.price && (
              <span className="bg-cafe px-2 py-1 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-primary-foreground">Oferta</span>
            )}
          </div>
          <span className="absolute inset-x-3 bottom-3 hidden translate-y-2 bg-ivory/95 py-2.5 text-center text-[0.62rem] font-medium uppercase tracking-[0.2em] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 lg:block">
            Ver detalhes
          </span>
        </div>
        <div className="pt-3">
          <h3 className="line-clamp-2 font-sans text-[0.8125rem] font-normal leading-snug text-foreground sm:text-sm">{clean(p.name)}</h3>
          <div className="mt-1.5 flex items-baseline gap-2 text-sm">
            <span className="font-medium">{brl(p.price)}</span>
            {p.compare_at_price && p.compare_at_price > p.price && (
              <span className="text-xs text-muted-foreground line-through">{brl(p.compare_at_price)}</span>
            )}
          </div>
        </div>
      </Link>
      <button
        type="button"
        aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        onClick={() => toggleFavorite(p.id)}
        className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center bg-ivory/85 transition-all hover:bg-ivory active:scale-90"
      >
        <Heart className={cn("h-4 w-4 transition-colors", fav && "fill-cafe text-cafe")} strokeWidth={1.25} />
      </button>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[4/5]" />
      <div className="skeleton mt-3 h-3 w-3/4" />
      <div className="skeleton mt-2 h-3 w-1/3" />
    </div>
  );
}
