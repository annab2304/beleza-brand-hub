import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";

import logoBd from "@/assets/logo-bd.png";

const NAV_ITEMS = [
  { label: "Novidades", to: "/" },
  { label: "Brincos", to: "/" },
  { label: "Colares", to: "/" },
  { label: "Pulseiras", to: "/" },
  { label: "Anéis", to: "/" },
  { label: "Tornozeleiras", to: "/" },
  { label: "Conjuntos", to: "/" },
  { label: "Berloques", to: "/" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      {/* Faixa superior discreta */}
      <div className="border-b border-border bg-primary text-primary-foreground">
        <p className="eyebrow py-2 text-center">
          Semijoias delicadas para todos os momentos
        </p>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        {/* Mobile: menu hambúrguer */}
        <button
          type="button"
          aria-label="Abrir menu"
          className="text-foreground transition-colors hover:opacity-60 lg:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        </button>

        {/* Logo */}
        <Link to="/" aria-label="Beleza em Detalhes — página inicial" className="flex items-center gap-3">
          <img
            src={logoBd}
            alt="Beleza em Detalhes"
            width={1024}
            height={1024}
            className="h-12 w-12 object-contain sm:h-14 sm:w-14"
          />
          <span className="hidden text-base font-semibold uppercase leading-tight tracking-[0.2em] sm:block">
            Beleza em Detalhes
          </span>
        </Link>

        {/* Ações */}
        <div className="flex items-center gap-4 sm:gap-5">
          <button type="button" aria-label="Buscar" className="text-foreground transition-colors hover:opacity-60">
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button type="button" aria-label="Favoritos" className="text-foreground transition-colors hover:opacity-60">
            <Heart className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="Minha conta"
            className="hidden text-foreground transition-colors hover:opacity-60 sm:block"
          >
            <User className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button type="button" aria-label="Carrinho" className="text-foreground transition-colors hover:opacity-60">
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Navegação desktop */}
      <nav aria-label="Categorias" className="hidden border-t border-border lg:block">
        <ul className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-6 py-3">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <Link
                to={item.to}
                className="text-[0.8125rem] font-normal uppercase tracking-[0.18em] text-foreground/80 transition-colors hover:opacity-60"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
