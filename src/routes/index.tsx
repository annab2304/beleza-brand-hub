import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Instagram } from "lucide-react";
import { useState } from "react";

import banner from "@/assets/banner.jpg";
import hero from "@/assets/hero.jpg";
import aneisImg from "@/assets/cat-aneis.jpg";
import colaresImg from "@/assets/cat-colares.jpg";
import pulseirasImg from "@/assets/cat-pulseiras.jpg";
import conjuntosImg from "@/assets/cat-conjuntos.jpg";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { categoriesQuery, productsQuery, type ProductCardData } from "@/lib/catalog";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Beleza em Detalhes — Semijoias delicadas e sofisticadas" },
      { name: "description", content: "Brincos, colares, pulseiras, anéis, tornozeleiras, conjuntos e berloques. Semijoias delicadas — detalhes que contam a sua história." },
      { property: "og:title", content: "Beleza em Detalhes — Semijoias" },
      { property: "og:description", content: "Semijoias delicadas e sofisticadas. Detalhes que contam a sua história." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Grid({ items, loading, n = 4 }: { items?: ProductCardData[] | undefined; loading: boolean; n?: number }) {
  if (loading) return <>{Array.from({ length: n }).map((_, i) => <ProductCardSkeleton key={i} />)}</>;
  return <>{items?.map((p) => <ProductCard key={p.id} p={p} />)}</>;
}

function SectionHead({ eyebrow, title, script, to }: { eyebrow: string; title: string; script?: string | undefined; to?: string | undefined }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4 sm:mb-10">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 text-[2rem] leading-none sm:text-5xl">
          {title} {script && <span className="script text-cafe">{script}</span>}
        </h2>
      </div>
      {to && <Link to="/categoria/$slug" params={{ slug: to }} className="link-underline shrink-0">Ver todas</Link>}
    </div>
  );
}

function Index() {
  const cats = useQuery(categoriesQuery());
  const novos = useQuery(productsQuery({ flag: "new", pageSize: 8 }));
  const top = useQuery(productsQuery({ flag: "bestseller", pageSize: 6 }));
  const conjuntos = useQuery(productsQuery({ category: "conjuntos", pageSize: 4 }));
  const berloques = useQuery(productsQuery({ category: "berloques", pageSize: 4 }));
  const insta = useQuery(productsQuery({ category: "brincos", pageSize: 6, sort: "nome" }));
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />

      {/* HERO */}
      <section className="relative bg-cream">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-12">
          <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/11] lg:col-span-7 lg:aspect-auto lg:min-h-[620px]">
            <img src={hero} alt="Colar e argola dourados Beleza em Detalhes" width={1600} height={1104} className="reveal absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-cafe/50 via-transparent to-transparent lg:hidden" />
            <div className="absolute bottom-6 left-5 right-5 text-primary-foreground lg:hidden">
              <p className="text-[0.6rem] uppercase tracking-[0.3em] opacity-85">Semijoias · Nova coleção</p>
              <h1 className="mt-2 font-serif text-[2.6rem] leading-[0.98]">Detalhes que contam a sua <span className="script text-[3.2rem] leading-none">história</span></h1>
            </div>
          </div>
          <div className="relative flex flex-col justify-center px-5 py-8 sm:px-12 lg:col-span-5 lg:px-14 lg:py-12">
            <div className="hidden lg:block">
              <p className="eyebrow">Semijoias · Nova coleção</p>
              <div className="gold-rule mt-5 w-12" />
              <h1 className="reveal mt-6 text-[4.25rem] leading-[0.98]">
                Detalhes que contam a sua <span className="script block text-[5.5rem] leading-[0.9] text-cafe">história.</span>
              </h1>
            </div>
            <p className="max-w-sm text-[0.9375rem] leading-relaxed text-muted-foreground lg:mt-6">
              Brincos, colares, pulseiras e anéis em banho de ouro e prata, para acompanhar cada capítulo — do dia a dia às ocasiões especiais.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:flex lg:mt-9">
              <Link to="/categoria/$slug" params={{ slug: "todos" }} className="btn-primary px-4">Conheça a coleção</Link>
              <Link to="/categoria/$slug" params={{ slug: "novidades" }} className="btn-outline px-4">Ver novidades</Link>
            </div>
            {/* miniaturas reais */}
            <div className="mt-8 hidden grid-cols-3 gap-2 lg:grid">
              {novos.data?.items.slice(0, 3).map((p) => (
                <Link key={p.id} to="/produto/$slug" params={{ slug: p.slug }} className="group aspect-square overflow-hidden bg-ivory">
                  <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <SectionHead eyebrow="Compre por categoria" title="Encontre o seu" script="detalhe" />
        <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-0 lg:grid-cols-7">
          {(cats.data ?? Array.from({ length: 7 }).map((_, i) => ({ id: String(i), slug: "", name: "", image: null }))).map((c) => (
            <li key={c.id} className="w-[40vw] shrink-0 snap-start sm:w-auto">
              {c.slug ? (
                <Link to="/categoria/$slug" params={{ slug: c.slug }} className="group block">
                  <div className="aspect-[3/4] overflow-hidden bg-cream">
                    {c.image && <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                  </div>
                  <p className="mt-3 text-center font-serif text-xl">{c.name}</p>
                </Link>
              ) : (
                <div className="skeleton aspect-[3/4]" />
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* NOVIDADES */}
      <section className="bg-cream py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead eyebrow="Acabaram de chegar" title="Novidades" to="novidades" />
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
            <Grid items={novos.data?.items} loading={novos.isLoading} n={8} />
          </div>
        </div>
      </section>

      {/* BANNER EDITORIAL */}
      <section className="relative h-[480px] overflow-hidden sm:h-[540px]">
        <img src={banner} alt="Campanha Beleza em Detalhes" loading="lazy" width={1920} height={912} className="absolute inset-0 h-full w-full object-cover object-[72%_center]" />
        <div className="absolute inset-0 bg-gradient-to-r from-champagne via-champagne/50 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl items-end px-6 pb-12 sm:items-center sm:pb-0">
          <div className="max-w-md">
            <p className="eyebrow text-champagne-foreground">Banho de ouro</p>
            <h2 className="mt-4 text-5xl leading-[1] sm:text-6xl">Luz em cada <span className="script text-cafe">gesto</span></h2>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-champagne-foreground/80">Argolas, colares e pontos de luz que iluminam o rosto.</p>
            <Link to="/categoria/$slug" params={{ slug: "colares" }} className="link-underline mt-8 inline-block">Descobrir colares</Link>
          </div>
        </div>
      </section>

      {/* MAIS VENDIDOS — destaque + grade */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-24">
        <SectionHead eyebrow="As queridinhas" title="Mais" script="vendidos" to="mais-vendidos" />
        <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
          <Link to="/categoria/$slug" params={{ slug: "mais-vendidos" }} className="group relative block aspect-[4/5] overflow-hidden lg:col-span-5 lg:aspect-auto">
            <img src={pulseirasImg} alt="Pulseiras delicadas" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-cafe/60 to-transparent" />
            <div className="absolute bottom-6 left-6 text-primary-foreground">
              <p className="text-[0.62rem] uppercase tracking-[0.25em] opacity-80">Escolhidas por vocês</p>
              <p className="mt-2 font-serif text-3xl">As favoritas da casa</p>
            </div>
          </Link>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:col-span-7 lg:grid-cols-3">
            <Grid items={top.data?.items} loading={top.isLoading} n={6} />
          </div>
        </div>
      </section>

      {/* COLEÇÕES / DESTAQUES */}
      <section className="bg-champagne/60 py-14 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
          {[
            { slug: "conjuntos", title: "Conjuntos", script: "para presentear", img: conjuntosImg, q: conjuntos },
            { slug: "berloques", title: "Berloques", script: "que contam histórias", img: colaresImg, q: berloques },
          ].map((c) => (
            <div key={c.slug}>
              <Link to="/categoria/$slug" params={{ slug: c.slug }} className="group relative block aspect-[16/10] overflow-hidden">
                <img src={c.img} alt={c.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-cafe/55 to-transparent" />
                <div className="absolute bottom-5 left-5 text-primary-foreground">
                  <p className="font-serif text-3xl sm:text-4xl">{c.title}</p>
                  <p className="script text-3xl text-rose">{c.script}</p>
                </div>
              </Link>
              <div className="mt-5 grid grid-cols-4 gap-2">
                {c.q.isLoading
                  ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton aspect-square" />)
                  : c.q.data?.items.map((p) => (
                      <Link key={p.id} to="/produto/$slug" params={{ slug: p.slug }} className="group aspect-square overflow-hidden bg-ivory">
                        <img src={p.images[0]} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      </Link>
                    ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EDITORIAL / LIFESTYLE */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-3 aspect-[3/4] overflow-hidden">
            <img src={aneisImg} alt="Anéis delicados" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="col-span-2 mt-14 aspect-[3/4] overflow-hidden">
            <img src={pulseirasImg} alt="Pulseiras sobrepostas" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>
        <div>
          <p className="eyebrow">Editorial</p>
          <div className="gold-rule mt-5 w-12" />
          <h2 className="mt-6 text-4xl leading-[1.05] sm:text-5xl">
            Peças que transformam o <span className="script text-[1.25em] text-cafe">detalhe</span> em protagonista.
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
            Sobreponha anéis, misture correntes, combine argolas. Cada peça foi pensada para conversar com as outras — e com o seu estilo.
          </p>
          <Link to="/categoria/$slug" params={{ slug: "aneis" }} className="btn-outline mt-9">Montar meu mix <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
      </section>

      {/* SOBRE */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-7xl items-center lg:grid-cols-2">
          <div className="aspect-[4/3] overflow-hidden lg:aspect-auto lg:h-full">
            <img src={colaresImg} alt="Colares delicados" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="px-6 py-12 sm:px-12 lg:px-20 lg:py-20">
            <p className="eyebrow">Sobre nós</p>
            <h2 className="mt-4 text-4xl sm:text-5xl">Beleza em <span className="script text-cafe">Detalhes</span></h2>
            <div className="gold-rule mt-6 w-12" />
            <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
              {/* Texto provisório — substituir pela apresentação oficial da marca */}
              Espaço reservado para a apresentação da marca. Aqui entra, com as suas palavras, o que torna cada peça especial.
            </p>
          </div>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="mb-8 text-center">
          <p className="eyebrow">@belezaemdetalhes</p>
          <h2 className="mt-2 text-3xl sm:text-4xl">Siga a <span className="script text-cafe">Beleza em Detalhes</span></h2>
        </div>
        <ul className="grid grid-cols-3 gap-1.5 sm:gap-2 lg:grid-cols-6">
          {(insta.data?.items ?? []).map((p) => (
            <li key={p.id}>
              <a href="https://instagram.com/belezaemdetalhes" target="_blank" rel="noreferrer" className="group relative block aspect-square overflow-hidden bg-cream">
                <img src={p.images[0]} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 flex items-center justify-center bg-cafe/0 text-primary-foreground opacity-0 transition-all group-hover:bg-cafe/30 group-hover:opacity-100">
                  <Instagram className="h-5 w-5" strokeWidth={1.25} />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-rose/25">
        <div className="mx-auto max-w-2xl px-6 py-14 text-center">
          <p className="script text-4xl text-cafe">fique por perto</p>
          <h2 className="mt-1 text-3xl sm:text-4xl">Novidades em primeira mão</h2>
          <form
            className="mt-8 flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.includes("@")) { toast.error("Digite um e-mail válido"); return; }
              toast.success("Obrigada! Você receberá nossas novidades.");
              setEmail("");
            }}
          >
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu melhor e-mail" className="flex-1 border border-foreground/20 bg-ivory px-4 py-3.5 text-sm outline-none focus:border-foreground" />
            <button type="submit" className="btn-primary">Quero receber</button>
          </form>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
