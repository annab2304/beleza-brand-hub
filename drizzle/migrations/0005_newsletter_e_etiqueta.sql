-- Newsletter: e-mails inscritos pelo site. Inscrição feita pelo servidor (service_role); só admin lê.
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now()
);
create unique index newsletter_subscribers_email_key on public.newsletter_subscribers (lower(email));
alter table public.newsletter_subscribers enable row level security;
grant select, delete on public.newsletter_subscribers to authenticated;
grant all on public.newsletter_subscribers to service_role;
create policy "admin reads newsletter" on public.newsletter_subscribers
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin deletes newsletter" on public.newsletter_subscribers
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Etiqueta de envio (Melhor Envio): guarda o envio criado no carrinho do Melhor Envio.
alter table public.orders add column me_shipment_id text;
alter table public.orders add column tracking_code text;
alter table public.orders add column shipping_service_id int;
-- O painel (admin) pode registrar o código de rastreio.
grant update (tracking_code) on public.orders to authenticated;
