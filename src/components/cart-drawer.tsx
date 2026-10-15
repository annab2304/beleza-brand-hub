import { Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { brl, clean } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateQty, removeItem, subtotal } = useStore();
  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex w-full flex-col gap-0 bg-ivory p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="font-serif text-2xl font-normal">Sua sacola</SheetTitle>
        </SheetHeader>
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="script text-4xl text-cafe">vazia por enquanto</p>
            <p className="mt-3 text-sm text-muted-foreground">Que tal escolher um detalhe especial?</p>
            <button type="button" onClick={() => setCartOpen(false)} className="btn-primary mt-8">Continuar comprando</button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-6">
              {cart.map((i) => (
                <li key={i.variant_id} className="flex gap-4 py-5">
                  <Link to="/produto/$slug" params={{ slug: i.slug }} onClick={() => setCartOpen(false)} className="h-24 w-20 shrink-0 overflow-hidden bg-cream">
                    {i.image && <img src={i.image} alt="" className="h-full w-full object-cover" />}
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <p className="text-sm leading-snug">{clean(i.name)}</p>
                      <button type="button" aria-label="Remover" onClick={() => removeItem(i.variant_id)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" strokeWidth={1.25} />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{i.options.map((o) => `${o.name}: ${o.value}`).join(" · ")}</p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-border">
                        <button type="button" aria-label="Diminuir" onClick={() => updateQty(i.variant_id, i.quantity - 1)} className="p-2"><Minus className="h-3 w-3" /></button>
                        <span className="w-6 text-center text-sm">{i.quantity}</span>
                        <button type="button" aria-label="Aumentar" onClick={() => updateQty(i.variant_id, i.quantity + 1)} className="p-2"><Plus className="h-3 w-3" /></button>
                      </div>
                      <span className="text-sm font-medium">{brl(i.price * i.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-border px-6 py-5">
              <div className="flex justify-between text-sm">
                <span className="uppercase tracking-[0.15em]">Subtotal</span>
                <span className="font-medium">{brl(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Frete calculado na finalização.</p>
              <Link to="/checkout" onClick={() => setCartOpen(false)} className="btn-primary mt-5 w-full text-center">Finalizar compra</Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
