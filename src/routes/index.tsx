import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Beleza em Detalhes — Semijoias delicadas e sofisticadas" },
      {
        name: "description",
        content:
          "Semijoias delicadas e sofisticadas: brincos, colares, pulseiras, anéis e conjuntos. Detalhes que fazem parte da sua história.",
      },
      {
        property: "og:title",
        content: "Beleza em Detalhes — Semijoias delicadas e sofisticadas",
      },
      {
        property: "og:description",
        content:
          "Semijoias delicadas e sofisticadas. Detalhes que fazem parte da sua história.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero editorial */}
      <section className="relative flex min-h-[70vh] items-center justify-center bg-cream px-4">
        <div className="mx-auto max-w-3xl py-24 text-center">
          <p className="eyebrow">Beleza em Detalhes</p>
          <div className="gold-rule mx-auto mt-6 w-16" />
          <h1 className="mt-8 font-serif text-4xl leading-tight text-foreground sm:text-5xl lg:text-6xl">
            Detalhes que fazem parte
            <br />
            <em className="font-medium">da sua história.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-base font-light leading-relaxed text-muted-foreground">
            Semijoias delicadas e sofisticadas, escolhidas com carinho para
            acompanhar os seus momentos.
          </p>
          <Link
            to="/"
            className="mt-10 inline-block border border-primary bg-primary px-10 py-3.5 text-[0.8125rem] uppercase tracking-[0.22em] text-primary-foreground transition-colors hover:bg-transparent hover:text-primary"
          >
            Conheça a coleção
          </Link>
        </div>
      </section>

      {/* Categorias */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="eyebrow">Nossas semijoias</p>
          <h2 className="mt-4 font-serif text-3xl text-foreground sm:text-4xl">
            Explore por categoria
          </h2>
          <div className="gold-rule mx-auto mt-6 w-12" />
        </div>
        <ul className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {["Brincos", "Colares", "Pulseiras", "Anéis", "Tornozeleiras", "Conjuntos"].map(
            (categoria) => (
              <li key={categoria}>
                <Link
                  to="/"
                  className="group flex flex-col items-center gap-4 border border-border bg-card px-4 py-10 transition-colors hover:border-gold"
                >
                  <span className="h-px w-8 bg-gold opacity-60 transition-all group-hover:w-12" />
                  <span className="font-serif text-lg text-foreground">{categoria}</span>
                </Link>
              </li>
            ),
          )}
        </ul>
      </section>

      {/* Rodapé institucional */}
      <footer className="border-t border-border bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6">
          <p className="font-serif text-2xl text-foreground">Beleza em Detalhes</p>
          <p className="mt-3 text-sm font-light text-muted-foreground">
            Semijoias delicadas para todos os momentos.
          </p>
          <div className="gold-rule mx-auto mt-8 w-16" />
          <p className="eyebrow mt-8">© Beleza em Detalhes</p>
        </div>
      </footer>
    </div>
  );
}
