<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Customer profiles are owner-only; checkout requires validated authentication and address lookup runs through a public server function, keeping saved customer data private.
- Catalog lives in Lovable Cloud: products → product_variants (one row per SKU) → product_images; categories normalized. Never store a variant as its own product.
- Supplier/cost data lives only in variant_supplier_info (admin-only RLS); public queries must never select it.
- own_stock (variants) is the store's stock and stays independent from supplier_stock.
- Product image URLs are external for now; product_images.storage_path is reserved for a future move to Cloud storage.
- Cart and favorites are client-side (localStorage) in src/lib/store.tsx; cart items keep product_id, variant_id, SKU, options, image, price.
- The first account that signs up becomes admin (DB trigger); admin page is /admin.
