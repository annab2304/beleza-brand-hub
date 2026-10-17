# Beleza Brand Hub

logo em imagem e identidade visual

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://beleza-brand-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5e149696-f5d0-4c94-9f2e-316db5830c43).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Pagamentos (Mercado Pago) e pedidos

A loja usa o **Checkout Pro** do Mercado Pago: a cliente paga no ambiente do Mercado Pago e a loja nunca vê nem guarda dados de cartão.

### Segredos necessários (nunca colocar no código)

Configure como *secrets* do projeto (Lovable Cloud → Secrets) ou como variáveis de ambiente do servidor:

| Variável | Obrigatória | Para quê |
| --- | --- | --- |
| `MERCADOPAGO_ACCESS_TOKEN` | sim | Access Token da aplicação no Mercado Pago (use o de **teste** até validar tudo) |
| `MERCADOPAGO_WEBHOOK_SECRET` | recomendada | "Assinatura secreta" do webhook, para validar os avisos |
| `SITE_URL` | opcional | Endereço público da loja (ex.: `https://www.seudominio.com.br`). Se vazio, usa o endereço de onde a cliente comprou |

### Frete (Melhor Envio)

O frete é cotado no Melhor Envio no checkout: a cliente informa o CEP, escolhe a opção, e o valor entra no total cobrado no Mercado Pago. O valor é recotado no servidor na hora de criar o pedido.

| Variável | Obrigatória | Para quê |
| --- | --- | --- |
| `MELHORENVIO_TOKEN` | sim | Token da API do Melhor Envio (segredo) |
| `MELHORENVIO_ORIGIN_CEP` | sim | CEP de onde você envia os pedidos |
| `MELHORENVIO_CONTACT_EMAIL` | sim | E-mail técnico que o Melhor Envio exige no cabeçalho das requisições |
| `MELHORENVIO_ENV` | opcional | `sandbox` para testar no ambiente de testes deles; vazio = produção |

Peso e medidas da embalagem (uma peça) ficam em `src/lib/shipping.config.ts`. A etiqueta ainda é gerada manualmente no painel do Melhor Envio, usando o endereço e o serviço que aparecem no pedido em `/admin`.

### Webhook

No painel do Mercado Pago (Suas integrações → Webhooks), cadastre o evento **Pagamentos** apontando para:

`https://SEU-SITE/api/mercadopago/webhook`

### Banco de dados

As migrações `drizzle/migrations/0001_orders.sql` (pedidos) e `0002_shipping.sql` (frete do pedido) criam as tabelas `orders` e `order_items` (com RLS: a cliente só enxerga os próprios pedidos) e a função `mark_order_paid`, que confirma o pagamento uma única vez e baixa o `own_stock`. Elas precisam ser aplicadas no banco, em ordem, antes de usar o checkout.

### Contato

Número do WhatsApp e Instagram ficam em `src/lib/contact.ts`.

## Segredos adicionais (Lovable → Cloud → Secrets)

| Nome | Obrigatório | Para quê |
|---|---|---|
| `MELHORENVIO_SENDER` | para etiquetas | JSON com os dados de quem envia: `{"name","phone","email","document"(CPF),"address","number","complement","district","city","state_abbr","postal_code"}` |
| `RESEND_API_KEY` | para e-mail de confirmação | Chave do Resend. Sem ela nenhum e-mail é enviado |
| `RESEND_FROM` | opcional | Remetente, ex.: `Beleza em Detalhes <pedidos@seudominio.com.br>` (domínio verificado no Resend) |

## Migrações novas
- `0005_newsletter_e_etiqueta.sql`: tabela da newsletter e colunas de etiqueta/rastreio nos pedidos.
- `0006_remove_kit_revenda.sql`: apaga os produtos "Kit Revenda…".

## Etiqueta de envio
No painel, pedido pago → **Criar etiqueta no Melhor Envio** coloca o envio no carrinho do Melhor Envio (sem gastar saldo). O pagamento e a impressão da etiqueta são feitos no painel deles.
