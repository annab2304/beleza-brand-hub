import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

const FIELD = "w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground";

type VariantRow = { sku: string; option1: string; option2: string; price: string; compare: string; stock: string };
const emptyVariant = (): VariantRow => ({ sku: "", option1: "", option2: "", price: "", compare: "", stock: "0" });

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);
const rand = () => Math.random().toString(36).slice(2, 6).toUpperCase();

export function AdminProductForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const cats = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => (await supabase.from("categories").select("id,name").order("position")).data ?? [],
  });
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [opt1Name, setOpt1Name] = useState("Banho");
  const [opt2Name, setOpt2Name] = useState("");
  const [images, setImages] = useState("");
  const [isNew, setIsNew] = useState(true);
  const [variants, setVariants] = useState<VariantRow[]>([emptyVariant()]);
  const [busy, setBusy] = useState(false);

  const setV = (i: number, k: keyof VariantRow, v: string) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const rows = variants.map((v) => ({ ...v, priceN: Number(v.price.replace(",", ".")), compareN: v.compare ? Number(v.compare.replace(",", ".")) : null, stockN: Math.max(0, Math.floor(Number(v.stock) || 0)) }));
    if (rows.some((r) => !Number.isFinite(r.priceN) || r.priceN <= 0)) { toast.error("Informe o preço de cada variante."); return; }
    const urls = images.split(/\s+/).map((u) => u.trim()).filter(Boolean);
    if (urls.some((u) => !/^https?:\/\//i.test(u))) { toast.error("As imagens precisam ser links começando com http:// ou https://"); return; }

    setBusy(true);
    let productId: string | null = null;
    try {
      const { data: p, error } = await supabase
        .from("products")
        .insert({
          name: name.trim(),
          slug: `${slugify(name)}-${rand().toLowerCase()}`,
          description: description.trim() || null,
          category_id: categoryId || null,
          option1_name: opt1Name.trim() || null,
          option2_name: opt2Name.trim() || null,
          status: "active",
          is_new: isNew,
        })
        .select("id")
        .single();
      if (error || !p) throw new Error(error?.message ?? "Não foi possível criar o produto.");
      productId = p.id;

      const { error: vErr } = await supabase.from("product_variants").insert(
        rows.map((r, i) => ({
          product_id: p.id,
          sku: r.sku.trim() || `BD-${slugify(name).slice(0, 12).toUpperCase()}-${rand()}${i + 1}`,
          option1: r.option1.trim() || null,
          option2: r.option2.trim() || null,
          price: r.priceN,
          compare_at_price: r.compareN && r.compareN > r.priceN ? r.compareN : null,
          own_stock: r.stockN,
          position: i,
        })),
      );
      if (vErr) throw new Error(vErr.message.includes("sku") ? "Já existe uma variante com esse SKU." : vErr.message);

      if (urls.length) {
        const { error: iErr } = await supabase.from("product_images").insert(urls.map((url, i) => ({ product_id: p.id, url, position: i })));
        if (iErr) throw new Error(iErr.message);
      }
      toast.success("Produto cadastrado");
      onDone();
    } catch (err) {
      // Não deixa um produto pela metade no catálogo.
      if (productId) await supabase.from("products").delete().eq("id", productId);
      toast.error(err instanceof Error ? err.message : "Não foi possível cadastrar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="mt-6 space-y-5 border border-border p-5">
      <h2 className="text-lg font-medium">Novo produto</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do produto" className={`${FIELD} sm:col-span-2`} />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={FIELD}>
          <option value="">Sem categoria</option>
          {cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} /> Mostrar em Novidades</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição (opcional)" rows={3} className={`${FIELD} sm:col-span-2`} />
        <input value={opt1Name} onChange={(e) => setOpt1Name(e.target.value)} placeholder="Nome da opção 1 (ex.: Banho)" className={FIELD} />
        <input value={opt2Name} onChange={(e) => setOpt2Name(e.target.value)} placeholder="Nome da opção 2 (ex.: Tamanho) — opcional" className={FIELD} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Variantes (cada combinação que você vende)</p>
        <div className="space-y-2">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-2 items-center gap-2 sm:grid-cols-[1fr_1fr_1fr_6rem_6rem_5rem_auto]">
              <input value={v.sku} onChange={(e) => setV(i, "sku", e.target.value)} placeholder="SKU (opcional)" className={FIELD} />
              <input value={v.option1} onChange={(e) => setV(i, "option1", e.target.value)} placeholder={opt1Name || "Opção 1"} className={FIELD} />
              <input value={v.option2} onChange={(e) => setV(i, "option2", e.target.value)} placeholder={opt2Name || "Opção 2"} className={FIELD} />
              <input required inputMode="decimal" value={v.price} onChange={(e) => setV(i, "price", e.target.value)} placeholder="Preço" className={FIELD} />
              <input inputMode="decimal" value={v.compare} onChange={(e) => setV(i, "compare", e.target.value)} placeholder="De (riscado)" className={FIELD} />
              <input type="number" min={0} value={v.stock} onChange={(e) => setV(i, "stock", e.target.value)} placeholder="Estoque" className={FIELD} />
              <button type="button" aria-label="Remover variante" disabled={variants.length === 1} onClick={() => setVariants((vs) => vs.filter((_, j) => j !== i))} className="justify-self-start disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setVariants((vs) => [...vs, emptyVariant()])} className="mt-2 flex items-center gap-1 text-xs underline"><Plus className="h-3 w-3" /> Adicionar variante</button>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Imagens (um link por linha; a primeira é a capa)</p>
        <textarea value={images} onChange={(e) => setImages(e.target.value)} rows={3} placeholder="https://…" className={FIELD} />
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={busy} className="btn-primary disabled:opacity-50">{busy ? "Salvando…" : "Cadastrar produto"}</button>
        <button type="button" onClick={onCancel} className="btn-outline">Cancelar</button>
      </div>
    </form>
  );
}
