import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/legal-page";
import { CONTACT_EMAIL, mailtoUrl } from "@/lib/contact";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade — Beleza em Detalhes" },
      { name: "description", content: "Como a Beleza em Detalhes trata os seus dados pessoais." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <LegalPage title="Política de privacidade" updated="outubro de 2026">
      <p>Esta política explica quais dados coletamos, para que usamos e quais são os seus direitos, conforme a Lei Geral de Proteção de Dados (LGPD).</p>
      <h2>Quais dados coletamos</h2>
      <ul>
        <li>Dados de cadastro e compra: nome, e-mail, telefone e endereço de entrega.</li>
        <li>Dados do pedido: itens comprados, valores, frete e situação do pagamento.</li>
        <li>E-mail, se você se inscrever para receber novidades.</li>
      </ul>
      <p>Não guardamos dados do seu cartão: o pagamento é feito no ambiente do Mercado Pago.</p>
      <h2>Para que usamos</h2>
      <ul>
        <li>Processar e entregar o seu pedido e avisar sobre ele.</li>
        <li>Calcular o frete e emitir a etiqueta de envio.</li>
        <li>Atender você em dúvidas, trocas e devoluções.</li>
        <li>Enviar novidades, apenas se você pediu, com possibilidade de cancelar quando quiser.</li>
      </ul>
      <h2>Com quem compartilhamos</h2>
      <p>Somente com quem é necessário para concluir a compra: o Mercado Pago (pagamento) e o Melhor Envio e as transportadoras (entrega). Não vendemos os seus dados.</p>
      <h2>Seus direitos</h2>
      <p>Você pode pedir acesso, correção ou exclusão dos seus dados, ou cancelar o recebimento de novidades, escrevendo para <a href={mailtoUrl("Meus dados")}>{CONTACT_EMAIL}</a>.</p>
    </LegalPage>
  );
}
