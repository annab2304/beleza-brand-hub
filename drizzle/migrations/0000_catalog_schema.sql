create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  position int not null default 0,
  image_url text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  option1_name text,
  option2_name text,
  option3_name text,
  status text not null default 'active',
  is_new boolean not null default false,
  is_bestseller boolean not null default false,
  source_category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.products(category_id);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  position int not null default 0,
  storage_path text
);
create index on public.product_images(product_id);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text unique not null,
  option1 text,
  option2 text,
  option3 text,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  own_stock int not null default 0,
  image_url text,
  position int not null default 0,
  active boolean not null default true
);
create index on public.product_variants(product_id);

-- Somente administrativo: custo e dados do fornecedor
create table public.variant_supplier_info (
  variant_id uuid primary key references public.product_variants(id) on delete cascade,
  cost_price numeric(10,2),
  supplier_stock int,
  supplier_available boolean,
  supplier_link text
);

create table public.import_issues (
  id uuid primary key default gen_random_uuid(),
  row_number int,
  sku text,
  product_name text,
  issue text not null,
  created_at timestamptz not null default now()
);

grant select on public.categories, public.products, public.product_images, public.product_variants to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.product_images, public.product_variants to authenticated;
grant select, insert, update, delete on public.variant_supplier_info, public.import_issues to authenticated;
grant all on public.categories, public.products, public.product_images, public.product_variants, public.variant_supplier_info, public.import_issues to service_role;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.variant_supplier_info enable row level security;
alter table public.import_issues enable row level security;

create policy "public read categories" on public.categories for select to anon, authenticated using (true);
create policy "public read active products" on public.products for select to anon, authenticated using (status = 'active' or public.has_role(auth.uid(), 'admin'));
create policy "public read images" on public.product_images for select to anon, authenticated using (true);
create policy "public read variants" on public.product_variants for select to anon, authenticated using (true);

create policy "admin write categories" on public.categories for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "admin write products" on public.products for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "admin write images" on public.product_images for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "admin write variants" on public.product_variants for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "admin all supplier" on public.variant_supplier_info for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "admin all issues" on public.import_issues for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Primeiro usuário cadastrado vira administrador
create or replace function public.handle_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_first_admin after insert on auth.users for each row execute function public.handle_first_admin();