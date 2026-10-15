import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";

import logoBd from "@/assets/logo-bd.png";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Novidades", slug: "novidades" },
  { label: "Brincos", slug: "brincos" },
  { label: "Colares", slug: "colares" },
  { label: "Pulseiras", slug: "pulseiras" },
  { label: "Anéis", slug: "aneis" },
  { label: "Tornozeleiras", slug: "tornozeleiras" },
  { label: "Conjuntos", slug: "conjuntos" },
  { label: "Berloques", slug: "berloques" },
  { label: "Mais vendidos", slug: "mais-vendidos" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, setCartOpen, favorites } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) return;
    setSearchOpen(false);
    navigate({ to: "/categoria/$slug", params: { slug: "todos" }, search: { busca: term.trim() } });
  };

  return (
    <header className={cn("sticky top-0 z-50 bg-background/95 backdrop-blur transition-shadow", scrolled && "shadow-[0_1px_0_var(--color-border)]")}>
      <div className="bg-cafe text-primary-foreground">
        <p className="py-1.5 text-center text-[0.6rem] uppercase tracking-[0.28em]">Semijoias delicadas para todos os momentos</p>
      </div>

      <div className="border-b border-border">
        <div className={cn("mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-all sm:px-6", scrolled ? "py-1.5" : "py-2.5")}>
          <div className="flex items-center gap-4">
            <button type="button" aria-label="Abrir menu" onClick={() => setOpen(true)} className="lg:hidden">
              <Menu className="h-5 w-5" strokeWidth={1.25} />
            </button>
            <Link to="/" aria-label="Beleza em Detalhes — página inicial" className="flex items-center gap-3">
              <img src={logoBd} alt="Beleza em Detalhes" width={1024} height={1024} className={cn("object-contain transition-all", scrolled ? "h-9 w-9" : "h-11 w-11 sm:h-12 sm:w-12")} />
              {!scrolled && <span className="hidden font-serif text-sm font-semibold uppercase tracking-[0.3em] sm:block">Beleza em Detalhes</span>}
            </Link>
          </div>

          <div className="flex items-center justify-end gap-4 sm:gap-5">
            <button type="button" onClick={() => setSearchOpen((v) => !v)} className="hidden items-center gap-2 text-muted-foreground transition-colors hover:text-foreground lg:flex">
              <Search className="h-4 w-4" strokeWidth={1.25} />
              <span className="text-xs tracking-wide">Buscar semijoias</span>
            </button>
            <button type="button" aria-label="Buscar" onClick={() => setSearchOpen((v) => !v)} className="lg:hidden">
              <Search className="h-5 w-5" strokeWidth={1.25} />
            </button>
            <Link to="/admin" aria-label="Minha conta" className="hidden transition-opacity hover:opacity-60 sm:block">
              <User className="h-5 w-5" strokeWidth={1.25} />
            </Link>
            <Link to="/favoritos" aria-label="Favoritos" className="relative transition-opacity hover:opacity-60">
              <Heart className="h-5 w-5" strokeWidth={1.25} />
              {favorites.length > 0 && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-rose" />}
            </Link>
            <button type="button" aria-label="Sacola" onClick={() => setCartOpen(true)} className="relative transition-opacity hover:opacity-60">
              <ShoppingBag className="h-5 w-5" strokeWidth={1.25} />
              {cartCount > 0 && (
                <span key={cartCount} className="reveal absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cafe px-1 text-[0.55rem] text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {searchOpen && (
          <form onSubmit={submit} className="reveal mx-auto flex max-w-2xl items-center gap-3 px-4 pb-4">
            <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.25} />
            <input autoFocus value={term} onChange={(e) => setTerm(e.target.value)} placeholder="O que você procura? Ex.: argola, coração, pérola" className="flex-1 border-b border-foreground/30 bg-transparent py-2 text-sm outline-none focus:border-foreground" />
          </form>
        )}

        <nav aria-label="Categorias" className="hidden lg:block">
          <ul className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-6 pb-3">
            {NAV.map((n) => (
              <li key={n.slug}>
                <Link to="/categoria/$slug" params={{ slug: n.slug }} className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-foreground/75 transition-colors hover:text-foreground" activeProps={{ className: "text-foreground underline underline-offset-8" }}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {open && (
        <div className="reveal fixed inset-0 z-50 overflow-y-auto bg-background lg:hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <span className="script text-3xl text-cafe">menu</span>
            <button type="button" aria-label="Fechar menu" onClick={() => setOpen(false)}><X className="h-5 w-5" strokeWidth={1.25} /></button>
          </div>
          <ul className="px-6 py-2">
            {NAV.map((n) => (
              <li key={n.slug} className="border-b border-border">
                <Link to="/categoria/$slug" params={{ slug: n.slug }} onClick={() => setOpen(false)} className="block py-4 font-serif text-2xl">{n.label}</Link>
              </li>
            ))}
            <li className="border-b border-border">
              <Link to="/favoritos" onClick={() => setOpen(false)} className="block py-4 text-sm uppercase tracking-[0.2em]">Favoritos</Link>
            </li>
            <li className="border-b border-border">
              <Link to="/faq" onClick={() => setOpen(false)} className="block py-4 text-sm uppercase tracking-[0.2em]">Dúvidas frequentes</Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(NAV.map((n) => [n.slug, n.label]));
