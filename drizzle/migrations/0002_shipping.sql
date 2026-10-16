-- Frete escolhido pela cliente (cotado no Melhor Envio). O valor fica em orders.shipping_cost.
alter table public.orders
  add column if not exists shipping_service text,
  add column if not exists shipping_days int;
