import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";

import logoBd from "@/assets/logo-bd.png";

const NAV_ITEMS = ["Novidades", "Brincos", "Colares", "Pulseiras", "Anéis", "Tornozeleiras", "Conjuntos", "Mais vendidos"];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur">
      <div className="bg-primary text-primary-foreground">
        <p className="py-1.5 text-center text-[0.625rem] uppercase tracking-[0.25em]">
          Frete grátis acima de R$ 299 · Parcele em até 6x
        </p>
      </div>

      <div className="border-b border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-3 items-center px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-4">
            <button type="button" aria-label="Abrir menu" onClick={() => setOpen(true)} className="lg:hidden">
              <Menu className="h-5 w-5" strokeWidth={1.25} />
            </button>
            <button type="button" aria-label="Buscar" className="hidden items-center gap-2 text-muted-foreground transition-colors hover:text-foreground lg:flex">
              <Search className="h-4 w-4" strokeWidth={1.25} />
              <span className="text-xs tracking-wide">Buscar semijoias</span>
            </button>
          </div>

          <Link to="/" aria-label="Beleza em Detalhes — página inicial" className="flex flex-col items-center">
            <img src={logoBd} alt="Beleza em Detalhes" width={1024} height={1024} className="h-11 w-11 object-contain sm:h-12 sm:w-12" />
            <span className="mt-0.5 hidden font-serif text-sm uppercase tracking-[0.3em] sm:block">Beleza em Detalhes</span>
          </Link>

          <div className="flex items-center justify-end gap-4 sm:gap-5">
            <button type="button" aria-label="Buscar" className="lg:hidden"><Search className="h-5 w-5" strokeWidth={1.25} /></button>
            <button type="button" aria-label="Minha conta" className="hidden transition-opacity hover:opacity-60 sm:block"><User className="h-5 w-5" strokeWidth={1.25} /></button>
            <button type="button" aria-label="Favoritos" className="transition-opacity hover:opacity-60"><Heart className="h-5 w-5" strokeWidth={1.25} /></button>
            <button type="button" aria-label="Carrinho" className="relative transition-opacity hover:opacity-60">
              <ShoppingBag className="h-5 w-5" strokeWidth={1.25} />
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[0.55rem] text-primary-foreground">0</span>
            </button>
          </div>
        </div>

        <nav aria-label="Categorias" className="hidden lg:block">
          <ul className="mx-auto flex max-w-7xl items-center justify-center gap-9 px-6 pb-3">
            {NAV_ITEMS.map((item) => (
              <li key={item}>
                <Link to="/" className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-foreground/75 transition-colors hover:text-foreground">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-background lg:hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <span className="font-serif text-lg uppercase tracking-[0.25em]">Menu</span>
            <button type="button" aria-label="Fechar menu" onClick={() => setOpen(false)}><X className="h-5 w-5" strokeWidth={1.25} /></button>
          </div>
          <ul className="px-6 py-4">
            {NAV_ITEMS.map((item) => (
              <li key={item} className="border-b border-border">
                <Link to="/" onClick={() => setOpen(false)} className="block py-4 font-serif text-2xl">{item}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
