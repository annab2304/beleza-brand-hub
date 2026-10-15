import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Dúvidas Frequentes — Beleza em Detalhes" },
      {
        name: "description",
        content:
          "Tire suas dúvidas sobre semijoias Beleza em Detalhes: banhos, garantia, cuidados, trocas, entrega e pagamento.",
      },
      { property: "og:title", content: "Dúvidas Frequentes — Beleza em Detalhes" },
      {
        property: "og:description",
        content:
          "Tire suas dúvidas sobre semijoias Beleza em Detalhes: banhos, garantia, cuidados, trocas, entrega e pagamento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FaqPage,
});

const FAQ_GROUPS: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "Sobre as semijoias",
    items: [
      {
        q: "O que são semijoias?",
        a: "Semijoias são peças feitas com materiais de qualidade que recebem banho de ouro, prata ou ródio sobre uma base metálica. Elas têm aparência de joia, com preço muito mais acessível.",
      },
      {
        q: "As peças escurecem ou perdem a cor?",
        a: "Com os cuidados certos, as semijoias mantêm o brilho por muito tempo. Evite contato com água, perfume, cremes e produtos de limpeza, e guarde as peças separadas em local seco.",
      },
      {
        q: "As peças são antialérgicas?",
        a: "A maioria das nossas peças recebe banho hipoalergênico e é livre de níquel. Se você tem alergia conhecida a algum metal, fale com a gente antes de comprar.",
      },
      {
        q: "Qual a diferença entre banho de ouro, prata e ródio?",
        a: "O banho de ouro dá o tom dourado clássico; o de prata, o tom prateado; e o de ródio, um prateado mais brilhante e resistente à oxidação. A escolha é de estilo — a qualidade é a mesma.",
      },
    ],
  },
  {
    title: "Pedidos e pagamento",
    items: [
      {
        q: "Como faço meu pedido?",
        a: "Escolha a peça, selecione o banho e o tamanho (quando houver) e adicione à sacola. Depois é só finalizar o pedido pelo carrinho.",
      },
      {
        q: "Quais formas de pagamento vocês aceitam?",
        a: "Aceitamos as principais formas de pagamento. As opções disponíveis aparecem na finalização do pedido.",
      },
      {
        q: "Posso trocar ou devolver?",
        a: "Sim. Você pode solicitar troca ou devolução em até 7 dias após o recebimento, com a peça sem sinais de uso e na embalagem original.",
      },
    ],
  },
  {
    title: "Entrega",
    items: [
      {
        q: "Qual o prazo de entrega?",
        a: "O prazo depende da sua região e é informado na finalização do pedido. Assim que o pedido sai, você recebe o código de rastreio.",
      },
      {
        q: "Vocês entregam para todo o Brasil?",
        a: "Sim, enviamos para todo o território nacional.",
      },
    ],
  },
  {
    title: "Cuidados com as peças",
    items: [
      {
        q: "Como limpar minhas semijoias?",
        a: "Use uma flanela macia e seca após o uso. Não use produtos químicos, álcool ou escovas, pois podem danificar o banho.",
      },
      {
        q: "Posso tomar banho ou entrar no mar com as peças?",
        a: "Não recomendamos. Água, suor, cloro e sal aceleram o desgaste do banho. Retire as peças antes de banho, piscina, mar e academia.",
      },
    ],
  },
];

function FaqPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <p className="eyebrow text-center">Central de ajuda</p>
        <h1 className="mt-3 text-center font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          Dúvidas frequentes
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-relaxed text-muted-foreground">
          Reunimos aqui as perguntas mais comuns sobre nossas semijoias, pedidos e entregas.
          Não encontrou sua resposta? Fale com a gente pelo Instagram.
        </p>

        <div className="mt-12 space-y-12">
          {FAQ_GROUPS.map((group) => (
            <section key={group.title}>
              <h2 className="font-serif text-xl font-semibold tracking-tight">{group.title}</h2>
              <div className="gold-rule mt-3 w-10" />
              <Accordion type="single" collapsible className="mt-4">
                {group.items.map((item, i) => (
                  <AccordionItem key={item.q} value={`${group.title}-${i}`}>
                    <AccordionTrigger className="text-left text-sm font-medium">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>

        <div className="mt-16 border border-border bg-cream px-6 py-10 text-center">
          <p className="script text-3xl text-cafe">ainda com dúvida?</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Chame a gente no Instagram{" "}
            <a
              href="https://instagram.com/belezaemdetalhes"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline underline-offset-4"
            >
              @belezaemdetalhes
            </a>
          </p>
          <Link to="/" className="btn-primary mt-6">
            Voltar à loja
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
