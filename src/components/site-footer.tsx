import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="bg-cafe text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-2xl uppercase tracking-[0.2em]">Beleza em Detalhes</p>
          <p className="script mt-2 text-3xl text-rose">detalhes que contam</p>
        </div>
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.25em] text-primary-foreground/50">Loja</p>
          <ul className="mt-4 space-y-2 text-sm">
            {[["novidades", "Novidades"], ["mais-vendidos", "Mais vendidos"], ["conjuntos", "Conjuntos"], ["berloques", "Berloques"]].map(([s, l]) => s && (
              <li key={s}><Link to="/categoria/$slug" params={{ slug: s }} className="text-primary-foreground/80 hover:text-primary-foreground">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.25em] text-primary-foreground/50">Categorias</p>
          <ul className="mt-4 space-y-2 text-sm">
            {[["brincos", "Brincos"], ["colares", "Colares"], ["pulseiras", "Pulseiras"], ["aneis", "Anéis"]].map(([s, l]) => s && (
              <li key={s}><Link to="/categoria/$slug" params={{ slug: s }} className="text-primary-foreground/80 hover:text-primary-foreground">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.25em] text-primary-foreground/50">Conta</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/favoritos" className="text-primary-foreground/80 hover:text-primary-foreground">Favoritos</Link></li>
            <li><Link to="/faq" className="text-primary-foreground/80 hover:text-primary-foreground">Dúvidas frequentes</Link></li>
            <li><Link to="/admin" className="text-primary-foreground/80 hover:text-primary-foreground">Área administrativa</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-primary-foreground/10 py-5 text-center text-[0.62rem] uppercase tracking-[0.25em] text-primary-foreground/50">© Beleza em Detalhes</p>
    </footer>
  );
}
