-- Pedidos da loja (pagamento via Mercado Pago).
-- Os pedidos são CRIADOS e ATUALIZADOS apenas pelo servidor (service_role),
-- depois de validar preços e estoque no banco. O cliente só LÊ os próprios pedidos.

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity,
  user_id uuid, -- conta opcional; sem FK para auth.users
  email text not null,
  customer_name text not null,
  customer_phone text,
  shipping_address jsonb,
  subtotal numeric(10,2) not null check (subtotal >= 0),
  shipping_cost numeric(10,2) not null default 0 check (shipping_cost >= 0),
  total numeric(10,2) not null check (total >= 0),
  -- andamento do pedido na loja
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled')),
  -- situação do pagamento no Mercado Pago
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'in_process', 'approved', 'rejected', 'cancelled', 'refunded')),
  mp_preference_id text,
  mp_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.orders(user_id, created_at desc);
create index on public.orders(email);
create unique index on public.orders(order_number);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  sku text,
  name text not null,
  options jsonb not null default '[]'::jsonb,
  image_url text,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity int not null check (quantity > 0)
);
create index on public.order_items(order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

grant select on public.orders, public.order_items to authenticated;
grant update (status) on public.orders to authenticated; -- só o admin passa na policy abaixo
grant all on public.orders, public.order_items to service_role;

create policy "customer reads own orders" on public.orders
  for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "admin updates orders" on public.orders
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "customer reads own order items" on public.order_items
  for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and (o.user_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
  ));

-- Confirma o pagamento de um pedido UMA única vez e baixa o estoque próprio.
-- Idempotente: o Mercado Pago pode avisar a mesma aprovação várias vezes.
create or replace function public.mark_order_paid(p_order_id uuid, p_payment_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.orders
     set payment_status = 'approved',
         status = case when status = 'pending' then 'paid' else status end,
         mp_payment_id = p_payment_id,
         updated_at = now()
   where id = p_order_id
     and payment_status <> 'approved';

  if not found then
    return false;
  end if;

  update public.product_variants v
     set own_stock = greatest(0, v.own_stock - i.quantity)
    from public.order_items i
   where i.order_id = p_order_id
     and i.variant_id = v.id;

  return true;
end $$;

revoke all on function public.mark_order_paid(uuid, text) from public, anon, authenticated;
grant execute on function public.mark_order_paid(uuid, text) to service_role;
