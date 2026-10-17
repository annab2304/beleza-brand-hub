import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import logoBd from "@/assets/logo-bd.png";
import { supabase } from "@/integrations/supabase/client";
import { brl, clean } from "@/lib/catalog";
import { formatOrderDate, ORDER_STATUS_LABEL, ORDER_STATUSES, parseOptions, PAYMENT_STATUS_LABEL } from "@/lib/orders";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel — Beleza em Detalhes" },
      { name: "description", content: "Área administrativa da Beleza em Detalhes." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Painel — Beleza em Detalhes" },
      { property: "og:description", content: "Área administrativa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [session, setSession] = useState<{ userId: string; email?: string | undefined } | null | undefined>(undefined);
  useEffect(() => {
    const sync = async () => {
      const { data } = await supabase.auth.getUser();
      setSession(data.user ? { userId: data.user.id, email: data.user.email } : null);
    };
    sync();
    const { data: sub } = supabase.auth.onAuthStateChange((e) => {
      if (e === "SIGNED_IN" || e === "SIGNED_OUT" || e === "USER_UPDATED") sync();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const role = useQuery({
    queryKey: ["is-admin", session?.userId],
    enabled: !!session,
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", session!.userId).eq("role", "admin");
      return (data?.length ?? 0) > 0;
    },
  });

  if (session === undefined) return <div className="p-10 text-center text-sm text-muted-foreground">Carregando…</div>;
  if (!session) return <Login />;
  if (role.isLoading) return <div className="p-10 text-center text-sm text-muted-foreground">Verificando acesso…</div>;
  if (!role.data)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p>Esta conta ({session.email}) não tem acesso administrativo.</p>
        <button type="button" className="btn-outline" onClick={() => supabase.auth.signOut()}>Sair</button>
      </div>
    );
  return <Dashboard email={session.email} />;
}

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error, data } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    if (mode === "up" && !data.session) toast.success("Conta criada! Confirme pelo link enviado ao seu e-mail.");
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-ivory p-8">
        <img src={logoBd} alt="Beleza em Detalhes" className="mx-auto h-16 w-16" />
        <h1 className="mt-4 text-center text-3xl">Área administrativa</h1>
        <div className="mt-8 space-y-3">
          <input type="email" required placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground" />
          <input type="password" required minLength={6} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground" />
        </div>
        <button type="submit" disabled={busy} className="btn-primary mt-6 w-full">{mode === "in" ? "Entrar" : "Criar conta"}</button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 w-full text-center text-xs text-muted-foreground underline">
          {mode === "in" ? "Primeiro acesso? Criar conta" : "Já tenho conta"}
        </button>
        <Link to="/" className="mt-6 block text-center text-xs text-muted-foreground">← Voltar à loja</Link>
      </form>
    </div>
  );
}

type AdminVariant = {
  id: string; sku: string; option1: string | null; option2: string | null; option3: string | null;
  price: number; own_stock: number;
  variant_supplier_info: { cost_price: number | null; supplier_stock: number | null; supplier_available: boolean | null; supplier_link: string | null } | null;
};
type AdminProduct = {
  id: string; name: string; status: string; option1_name: string | null; option2_name: string | null;
  categories: { name: string } | null;
  product_images: { url: string; position: number }[];
  product_variants: AdminVariant[];
};

function Dashboard({ email }: { email?: string | undefined }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<string | null>(null);
  const [tab, setTab] = useState<"produtos" | "pedidos" | "problemas">("produtos");
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const size = 30;

  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [p, v, i] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("product_variants").select("id", { count: "exact", head: true }),
        supabase.from("import_issues").select("id", { count: "exact", head: true }),
      ]);
      return { products: p.count ?? 0, variants: v.count ?? 0, issues: i.count ?? 0 };
    },
  });

  const list = useQuery({
    queryKey: ["admin-products", search, page],
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select("id,name,status,option1_name,option2_name,categories(name),product_images(url,position),product_variants(id,sku,option1,option2,option3,price,own_stock,variant_supplier_info(cost_price,supplier_stock,supplier_available,supplier_link))", { count: "exact" })
        .order("name");
      if (search) q = q.ilike("name", `%${search}%`);
      const { data, error, count } = await q.range((page - 1) * size, page * size - 1);
      if (error) throw new Error(error.message);
      return { items: data as unknown as AdminProduct[], total: count ?? 0 };
    },
  });

  const issues = useQuery({
    queryKey: ["admin-issues"],
    enabled: tab === "problemas",
    queryFn: async () => (await supabase.from("import_issues").select("*").order("row_number")).data ?? [],
  });

  const orders = useQuery({
    queryKey: ["admin-orders"],
    enabled: tab === "pedidos",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,order_number,created_at,customer_name,customer_phone,email,shipping_address,status,payment_status,total,shipping_cost,shipping_service,shipping_days,order_items(id,sku,name,options,quantity,unit_price)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      return data;
    },
  });
  const setOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Pedido atualizado");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const setStock = async (id: string, v: number) => {
    const { error } = await supabase.from("product_variants").update({ own_stock: v }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Estoque próprio atualizado");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };
  const setPrice = async (id: string, v: number) => {
    const { error } = await supabase.from("product_variants").update({ price: v }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Preço atualizado");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const pages = Math.max(1, Math.ceil((list.data?.total ?? 0) / size));

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoBd} alt="" className="h-9 w-9" />
          <span className="text-sm font-medium uppercase tracking-[0.2em]">Painel</span>
        </Link>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="hidden sm:inline">{email}</span>
          <button type="button" aria-label="Sair" onClick={async () => { qc.clear(); await supabase.auth.signOut(); }}><LogOut className="h-4 w-4" /></button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-3 gap-3">
          {[["Produtos", stats.data?.products], ["Variantes", stats.data?.variants], ["Problemas na importação", stats.data?.issues]].map(([l, v]) => (
            <div key={l as string} className="border border-border p-4">
              <p className="text-xs text-muted-foreground">{l}</p>
              <p className="mt-1 text-2xl font-medium">{v ?? "—"}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-6 border-b border-border text-sm">
          {(["produtos", "pedidos", "problemas"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`pb-3 capitalize ${tab === t ? "border-b-2 border-foreground font-medium" : "text-muted-foreground"}`}>{t}</button>
          ))}
        </div>

        {tab === "pedidos" ? (
          <ul className="mt-6 divide-y divide-border border border-border">
            {orders.isLoading && <li className="p-6 text-sm text-muted-foreground">Carregando…</li>}
            {orders.isError && <li className="p-6 text-sm text-muted-foreground">Não foi possível carregar os pedidos (a migração 0001_orders já foi aplicada?).</li>}
            {orders.data?.length === 0 && <li className="p-6 text-sm text-muted-foreground">Nenhum pedido ainda.</li>}
            {orders.data?.map((o) => {
              const a = (o.shipping_address ?? {}) as Record<string, string>;
              return (
                <li key={o.id}>
                  <button type="button" onClick={() => setOpenOrder(openOrder === o.id ? null : o.id)} className="flex w-full flex-wrap items-center justify-between gap-2 p-3 text-left hover:bg-muted/50">
                    <span className="text-sm"><span className="font-medium">#{o.order_number}</span> · {o.customer_name}</span>
                    <span className="text-xs text-muted-foreground">{formatOrderDate(o.created_at)} · {ORDER_STATUS_LABEL[o.status] ?? o.status} · pagamento {PAYMENT_STATUS_LABEL[o.payment_status] ?? o.payment_status} · {brl(Number(o.total))}</span>
                  </button>
                  {openOrder === o.id && (
                    <div className="space-y-3 bg-muted/30 p-4 text-sm">
                      <p>{o.email} · {o.customer_phone ?? "sem telefone"}</p>
                      <p className="text-muted-foreground">{a["street"]}, {a["number"]}{a["complement"] ? ` — ${a["complement"]}` : ""} · {a["neighborhood"]} · {a["city"]}/{a["state"]} · CEP {a["cep"]}</p>
                      <p>Frete: {o.shipping_service ?? "—"}{o.shipping_days ? ` (até ${o.shipping_days} dias úteis)` : ""} · {brl(Number(o.shipping_cost))}</p>
                      <ul className="space-y-1">
                        {o.order_items.map((i) => (
                          <li key={i.id}>{i.quantity}× {clean(i.name)} <span className="text-xs text-muted-foreground">({parseOptions(i.options).map((x) => x.value).join(" / ")}) · SKU {i.sku} · {brl(Number(i.unit_price))}</span></li>
                        ))}
                      </ul>
                      <label className="flex items-center gap-2 text-xs">
                        Andamento:
                        <select value={o.status} onChange={(e) => setOrderStatus(o.id, e.target.value)} className="border border-border bg-background px-2 py-1">
                          {ORDER_STATUSES.map((st) => <option key={st} value={st}>{ORDER_STATUS_LABEL[st]}</option>)}
                        </select>
                      </label>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : tab === "problemas" ? (
          <table className="mt-6 w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground"><tr><th className="py-2">Linha</th><th>SKU</th><th>Produto</th><th>Problema</th></tr></thead>
            <tbody>
              {issues.data?.map((i) => (
                <tr key={i.id} className="border-t border-border"><td className="py-2">{i.row_number ?? "—"}</td><td>{i.sku}</td><td>{clean(i.product_name)}</td><td>{i.issue}</td></tr>
              ))}
            </tbody>
          </table>
        ) : (
          <>
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar produto…" className="mt-6 w-full border border-border bg-transparent px-4 py-2.5 text-sm outline-none focus:border-foreground" />
            <ul className="mt-4 divide-y divide-border border border-border">
              {list.isLoading && <li className="p-6 text-sm text-muted-foreground">Carregando…</li>}
              {list.data?.items.map((p) => {
                const img = [...p.product_images].sort((a, b) => a.position - b.position)[0]?.url;
                return (
                  <li key={p.id}>
                    <button type="button" onClick={() => setOpen(open === p.id ? null : p.id)} className="flex w-full items-center gap-4 p-3 text-left hover:bg-muted/50">
                      <div className="h-14 w-14 shrink-0 overflow-hidden bg-muted">{img && <img src={img} alt="" className="h-full w-full object-cover" />}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{clean(p.name)}</p>
                        <p className="text-xs text-muted-foreground">{p.categories?.name ?? "Sem categoria"} · {p.product_variants.length} variante(s) · {p.product_images.length} imagem(ns) · {p.status === "active" ? "Ativo" : "Inativo"}</p>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${open === p.id ? "rotate-180" : ""}`} />
                    </button>
                    {open === p.id && (
                      <div className="overflow-x-auto bg-muted/30 px-3 pb-4">
                        <table className="w-full min-w-[760px] text-left text-xs">
                          <thead className="text-muted-foreground">
                            <tr><th className="py-2">SKU</th><th>{p.option1_name ?? "Opção 1"}</th><th>{p.option2_name ?? "Opção 2"}</th><th>Custo</th><th>Preço de venda</th><th>Estoque próprio</th><th>Estoque fornecedor</th><th>Disp. fornecedor</th><th>Fornecedor</th></tr>
                          </thead>
                          <tbody>
                            {p.product_variants.map((v) => (
                              <tr key={v.id} className="border-t border-border">
                                <td className="py-2 font-mono">{v.sku}</td>
                                <td>{v.option1 ?? "—"}</td>
                                <td>{v.option2 ?? "—"}</td>
                                <td>{v.variant_supplier_info?.cost_price != null ? brl(Number(v.variant_supplier_info.cost_price)) : "—"}</td>
                                <td><input type="number" step="0.01" defaultValue={v.price} onBlur={(e) => Number(e.target.value) !== Number(v.price) && setPrice(v.id, Number(e.target.value))} className="w-24 border border-border bg-background px-2 py-1" /></td>
                                <td><input type="number" min={0} defaultValue={v.own_stock} onBlur={(e) => Number(e.target.value) !== v.own_stock && setStock(v.id, Number(e.target.value))} className="w-20 border border-border bg-background px-2 py-1" /></td>
                                <td>{v.variant_supplier_info?.supplier_stock ?? "—"}</td>
                                <td>{v.variant_supplier_info?.supplier_available ? "Sim" : "Não"}</td>
                                <td>{v.variant_supplier_info?.supplier_link && <a href={v.variant_supplier_info.supplier_link} target="_blank" rel="noreferrer" className="underline">abrir</a>}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex items-center justify-between text-sm">
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="disabled:opacity-30">← Anterior</button>
              <span className="text-muted-foreground">Página {page} de {pages}</span>
              <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className="disabled:opacity-30">Próxima →</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
