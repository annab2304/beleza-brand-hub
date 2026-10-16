-- Mantém updated_at sempre em dia em orders (o status é atualizado pelo painel sem escrever a data).
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger orders_touch_updated_at
  before update on public.orders
  for each row
  execute function public.touch_updated_at();