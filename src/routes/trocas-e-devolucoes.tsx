import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/legal-page";
import { CONTACT_EMAIL, mailtoUrl, whatsappUrl } from "@/lib/contact";

export const Route = createFileRoute("/trocas-e-devolucoes")({
  head: () => ({
    meta: [
      { title: "Trocas e devoluções — Beleza em Detalhes" },
      { name: "description", content: "Como pedir troca ou devolução na Beleza em Detalhes." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <LegalPage title="Trocas e devoluções" updated="outubro de 2026">
      <p>Queremos que você ame cada peça. Se algo não saiu como esperado, veja abaixo como resolver.</p>
      <h2>Prazo</h2>
      <p>Você pode pedir troca ou devolução em até <strong>7 dias corridos</strong> após o recebimento do pedido.</p>
      <h2>Condições</h2>
      <ul>
        <li>A peça deve estar sem sinais de uso e na embalagem original.</li>
        <li>Peças com defeito de fabricação devem ser comunicadas assim que percebido, com fotos.</li>
      </ul>
      <h2>Como pedir</h2>
      <p>
        Fale com a gente pelo <a href={whatsappUrl("Olá! Quero pedir troca ou devolução.")} target="_blank" rel="noreferrer">WhatsApp</a> ou pelo e-mail{" "}
        <a href={mailtoUrl("Troca ou devolução")}>{CONTACT_EMAIL}</a>, informando o número do pedido e o motivo.
      </p>
      <h2>Reembolso</h2>
      <p>Em caso de devolução, o valor é devolvido pela mesma forma de pagamento usada na compra, no prazo do Mercado Pago ou do seu cartão.</p>
    </LegalPage>
  );
}
