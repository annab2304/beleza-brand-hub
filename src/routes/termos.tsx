import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/legal-page";
import { CONTACT_EMAIL, mailtoUrl } from "@/lib/contact";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de uso — Beleza em Detalhes" },
      { name: "description", content: "Termos de uso da loja Beleza em Detalhes." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <LegalPage title="Termos de uso" updated="outubro de 2026">
      <p>Ao usar este site e comprar na Beleza em Detalhes, você concorda com os termos abaixo.</p>
      <h2>Produtos e preços</h2>
      <p>As fotos e descrições buscam representar as peças com fidelidade, mas pode haver pequenas variações de tom conforme a tela. Os preços podem mudar sem aviso, e valem os preços mostrados no momento da compra.</p>
      <h2>Conta</h2>
      <p>Para comprar é preciso ter uma conta. Você é responsável por manter a sua senha em segurança e por informar dados verdadeiros.</p>
      <h2>Pagamento e entrega</h2>
      <p>O pagamento é processado pelo Mercado Pago. O frete e o prazo são calculados no checkout e dependem da transportadora escolhida. O pedido é preparado depois da confirmação do pagamento.</p>
      <h2>Trocas e devoluções</h2>
      <p>Veja as regras em <a href="/trocas-e-devolucoes">Trocas e devoluções</a>.</p>
      <h2>Contato</h2>
      <p>Dúvidas: <a href={mailtoUrl()}>{CONTACT_EMAIL}</a> ou WhatsApp.</p>
    </LegalPage>
  );
}
