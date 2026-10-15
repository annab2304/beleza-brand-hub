import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Instagram } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import hero from "@/assets/hero.jpg";
import banner from "@/assets/banner.jpg";
import brincos from "@/assets/cat-brincos.jpg";
import colares from "@/assets/cat-colares.jpg";
import pulseiras from "@/assets/cat-pulseiras.jpg";
import aneis from "@/assets/cat-aneis.jpg";
import tornozeleiras from "@/assets/cat-tornozeleiras.jpg";
import conjuntos from "@/assets/cat-conjuntos.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Beleza em Detalhes — Semijoias delicadas e sofisticadas" },
      { name: "description", content: "Semijoias delicadas e sofisticadas: brincos, colares, pulseiras, anéis e conjuntos. Detalhes que fazem parte da sua história." },
      { property: "og:title", content: "Beleza em Detalhes — Semijoias delicadas e sofisticadas" },
      { property: "og:description", content: "Semijoias delicadas e sofisticadas. Detalhes que fazem parte da sua história." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const CATEGORIAS = [
  { nome: "Brincos", img: brincos },
  { nome: "Colares", img: colares },
  { nome: "Pulseiras", img: pulseiras },
  { nome: "Anéis", img: aneis },
  { nome: "Tornozeleiras", img: tornozeleiras },
  { nome: "Conjuntos", img: conjuntos },
];

type Produto = { nome: string; preco: number; promo?: number; img: string; img2: string; novo?: boolean };

// Produtos de demonstração (serão substituídos pelo catálogo real)
const NOVIDADES: Produto[] = [
  { nome: "Brinco Gota de Pérolas", preco: 129.9, img: brincos, img2: hero, novo: true },
  { nome: "Colar Duplo Ponto de Luz", preco: 159.9, promo: 139.9, img: colares, img2: banner, novo: true },
  { nome: "Pulseira Trio Delicada", preco: 119.9, img: pulseiras, img2: aneis, novo: true },
  { nome: "Kit Anéis Minimal", preco: 99.9, img: aneis, img2: pulseiras, novo: true },
];
const MAIS_VENDIDOS: Produto[] = [
  { nome: "Conjunto Halo Cristal", preco: 249.9, promo: 219.9, img: conjuntos, img2: colares },
  { nome: "Tornozeleira Pontos de Luz", preco: 89.9, img: tornozeleiras, img2: pulseiras },
  { nome: "Colar Medalha Oval", preco: 149.9, img: hero, img2: colares },
  { nome: "Brinco Argola Gota", preco: 109.9, img: banner, img2: brincos },
];

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function ProductCard({ p }: { p: Produto }) {
  return (
    <Link to="/" className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-cream">
        <img src={p.img} alt={p.nome} loading="lazy" width={896} height={1152} className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.03] lg:group-hover:opacity-0" />
        <img src={p.img2} alt="" aria-hidden loading="lazy" className="absolute inset-0 hidden h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100 lg:block" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {p.novo && <span className="bg-background px-2 py-1 text-[0.6rem] font-medium uppercase tracking-[0.18em]">Novo</span>}
          {p.promo && <span className="bg-primary px-2 py-1 text-[0.6rem] font-medium uppercase tracking-[0.18em] text-primary-foreground">Oferta</span>}
        </div>
        <span role="button" aria-label="Favoritar" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center bg-background/80 transition-colors hover:bg-background">
          <Heart className="h-4 w-4" strokeWidth={1.25} />
        </span>
        <span className="absolute inset-x-3 bottom-3 hidden translate-y-2 bg-background/95 py-2.5 text-center text-[0.65rem] font-medium uppercase tracking-[0.2em] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 lg:block">
          Ver detalhes
        </span>
      </div>
      <div className="pt-3">
        <h3 className="font-sans text-sm font-normal text-foreground">{p.nome}</h3>
        <div className="mt-1 flex items-baseline gap-2 text-sm">
          {p.promo ? (
            <>
              <span className="font-medium">{brl(p.promo)}</span>
              <span className="text-xs text-muted-foreground line-through">{brl(p.preco)}</span>
            </>
          ) : (
            <span className="font-medium">{brl(p.preco)}</span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">ou 3x de {brl((p.promo ?? p.preco) / 3)}</p>
      </div>
    </Link>
  );
}

function SectionHead({ eyebrow, title, link = true }: { eyebrow: string; title: string; link?: boolean }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 text-3xl leading-none sm:text-4xl lg:text-5xl">{title}</h2>
      </div>
      {link && <Link to="/" className="link-underline shrink-0">Ver todas</Link>}
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-12">
          <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:col-span-7 lg:aspect-auto lg:min-h-[640px]">
            <img src={hero} alt="Colar e brinco dourados Beleza em Detalhes" width={1600} height={1104} className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:col-span-5 lg:px-16">
            <p className="eyebrow">Nova coleção · Semijoias banhadas</p>
            <div className="gold-rule mt-5 w-12" />
            <h1 className="mt-6 text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-[4.25rem]">
              Detalhes que fazem parte <em className="italic text-foreground/80">da sua história.</em>
            </h1>
            <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed text-muted-foreground">
              Semijoias delicadas, com acabamento impecável, para acompanhar cada momento — do dia a dia às ocasiões especiais.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/" className="btn-primary">Conheça a coleção <ArrowRight className="h-3.5 w-3.5" /></Link>
              <Link to="/" className="btn-outline">Novidades</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="border-b border-border">
        <ul className="no-scrollbar mx-auto flex max-w-7xl gap-10 overflow-x-auto px-6 py-4 text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground sm:justify-center">
          {["Banho de alta durabilidade", "Antialérgicas", "Embalagem para presente", "Troca facilitada"].map((b) => (
            <li key={b} className="flex shrink-0 items-center gap-3"><span className="h-1 w-1 rounded-full bg-gold" />{b}</li>
          ))}
        </ul>
      </section>

      {/* CATEGORIAS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <SectionHead eyebrow="Compre por categoria" title="Encontre o seu detalhe" link={false} />
        <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 lg:grid-cols-6">
          {CATEGORIAS.map((c) => (
            <li key={c.nome} className="w-[62vw] shrink-0 snap-start sm:w-auto">
              <Link to="/" className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-cream">
                  <img src={c.img} alt={c.nome} loading="lazy" width={896} height={1152} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/45 via-transparent to-transparent" />
                  <span className="absolute inset-x-0 bottom-4 text-center font-serif text-2xl text-primary-foreground">{c.nome}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* NOVIDADES */}
      <section className="bg-secondary py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead eyebrow="Acabaram de chegar" title="Novidades" />
          <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-4 lg:gap-6">
            {NOVIDADES.map((p) => (
              <div key={p.nome} className="w-[68vw] shrink-0 snap-start sm:w-auto"><ProductCard p={p} /></div>
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-3 aspect-[3/4] overflow-hidden">
            <img src={aneis} alt="Anéis dourados delicados" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="col-span-2 mt-16 aspect-[3/4] overflow-hidden">
            <img src={pulseiras} alt="Pulseiras delicadas" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>
        <div className="lg:pl-6">
          <p className="eyebrow">Editorial</p>
          <div className="gold-rule mt-5 w-12" />
          <h2 className="mt-6 text-4xl leading-[1.05] sm:text-5xl">
            Peças que transformam o <em className="italic">detalhe</em> em protagonista.
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
            Combine, sobreponha, crie a sua composição. Semijoias pensadas para conversar entre si e com o seu estilo.
          </p>
          <Link to="/" className="btn-outline mt-9">Montar meu mix</Link>
        </div>
      </section>

      {/* BANNER */}
      <section className="relative h-[520px] overflow-hidden sm:h-[560px]">
        <img src={banner} alt="Campanha Beleza em Detalhes" loading="lazy" width={1920} height={912} className="absolute inset-0 h-full w-full object-cover object-[70%_center]" />
        <div className="absolute inset-0 bg-gradient-to-r from-champagne/90 via-champagne/40 to-transparent sm:via-champagne/20" />
        <div className="relative mx-auto flex h-full max-w-7xl items-end px-6 pb-12 sm:items-center sm:pb-0">
          <div className="max-w-md">
            <p className="eyebrow text-champagne-foreground">Coleção Dourada</p>
            <h2 className="mt-4 text-5xl leading-[1] sm:text-6xl">Luz em <em className="italic">cada gesto.</em></h2>
            <Link to="/" className="link-underline mt-8 inline-block">Descobrir coleção</Link>
          </div>
        </div>
      </section>

      {/* MAIS VENDIDOS — layout com destaque */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <SectionHead eyebrow="As queridinhas" title="Mais vendidos" />
        <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
          <Link to="/" className="group relative block aspect-[4/5] overflow-hidden lg:col-span-5 lg:aspect-auto">
            <img src={conjuntos} alt="Conjuntos Beleza em Detalhes" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 to-transparent" />
            <div className="absolute bottom-6 left-6 text-primary-foreground">
              <p className="text-[0.65rem] uppercase tracking-[0.25em] opacity-80">Presenteie</p>
              <p className="mt-2 font-serif text-3xl">Conjuntos que encantam</p>
            </div>
          </Link>
          <div className="grid grid-cols-2 gap-4 lg:col-span-7 lg:gap-6">
            {MAIS_VENDIDOS.map((p) => <ProductCard key={p.nome} p={p} />)}
          </div>
        </div>
      </section>

      {/* INSTITUCIONAL */}
      <section className="bg-champagne">
        <div className="mx-auto grid max-w-7xl items-center lg:grid-cols-2">
          <div className="aspect-[4/3] overflow-hidden lg:aspect-auto lg:h-full">
            <img src={colares} alt="Colares delicados sobre pedra" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="px-6 py-14 sm:px-12 lg:px-20 lg:py-20">
            <p className="eyebrow text-champagne-foreground">Sobre nós</p>
            <h2 className="mt-4 text-4xl sm:text-5xl">Beleza em Detalhes</h2>
            <div className="gold-rule mt-6 w-12" />
            <p className="mt-6 max-w-md leading-relaxed text-champagne-foreground/80">
              Espaço reservado para a apresentação da marca. Aqui você poderá contar, com suas palavras, o que torna cada peça especial.
            </p>
            <Link to="/" className="btn-primary mt-8">Conheça a marca</Link>
          </div>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mb-8 text-center">
          <p className="eyebrow">@belezaemdetalhes</p>
          <h2 className="mt-2 text-3xl sm:text-4xl">Siga a Beleza em Detalhes</h2>
        </div>
        <ul className="grid grid-cols-3 gap-1.5 sm:gap-2 lg:grid-cols-6">
          {[brincos, hero, aneis, tornozeleiras, conjuntos, pulseiras].map((img, i) => (
            <li key={i}>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="group relative block aspect-square overflow-hidden">
                <img src={img} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 flex items-center justify-center bg-foreground/0 text-primary-foreground opacity-0 transition-all group-hover:bg-foreground/30 group-hover:opacity-100">
                  <Instagram className="h-5 w-5" strokeWidth={1.25} />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* RODAPÉ */}
      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-serif text-2xl uppercase tracking-[0.2em]">Beleza em Detalhes</p>
            <p className="mt-3 text-sm text-primary-foreground/60">Semijoias delicadas para todos os momentos.</p>
          </div>
          {[
            ["Loja", ["Novidades", "Mais vendidos", "Conjuntos"]],
            ["Ajuda", ["Trocas e devoluções", "Cuidados com a peça", "Contato"]],
            ["Conta", ["Minha conta", "Favoritos", "Carrinho"]],
          ].map(([t, items]) => (
            <div key={t as string}>
              <p className="text-[0.65rem] uppercase tracking-[0.25em] text-primary-foreground/50">{t as string}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {(items as string[]).map((i) => <li key={i}><Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground">{i}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <p className="border-t border-primary-foreground/10 py-5 text-center text-[0.65rem] uppercase tracking-[0.25em] text-primary-foreground/50">© Beleza em Detalhes</p>
      </footer>
    </div>
  );
}
