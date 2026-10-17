-- Remove os "Kit Revenda" (são do site do fornecedor, não da loja).
-- Variantes e imagens saem junto (on delete cascade); itens de pedidos antigos só perdem o vínculo.
delete from public.products where name ilike 'Kit Revenda%';
