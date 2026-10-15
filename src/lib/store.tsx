import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  product_id: string;
  variant_id: string;
  sku: string;
  slug: string;
  name: string;
  options: { name: string; value: string }[];
  image: string | null;
  price: number;
  quantity: number;
};

type Store = {
  cart: CartItem[];
  favorites: string[];
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  addToCart: (item: CartItem) => void;
  updateQty: (variantId: string, qty: number) => void;
  removeItem: (variantId: string) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  cartCount: number;
  subtotal: number;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem("bd-cart") || "[]"));
      setFavorites(JSON.parse(localStorage.getItem("bd-favs") || "[]"));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem("bd-cart", JSON.stringify(cart));
  }, [cart, loaded]);
  useEffect(() => {
    if (loaded) localStorage.setItem("bd-favs", JSON.stringify(favorites));
  }, [favorites, loaded]);

  const value: Store = {
    cart,
    favorites,
    cartOpen,
    setCartOpen,
    addToCart: (item) =>
      setCart((c) => {
        const ex = c.find((i) => i.variant_id === item.variant_id);
        if (ex) return c.map((i) => (i.variant_id === item.variant_id ? { ...i, quantity: i.quantity + item.quantity } : i));
        return [...c, item];
      }),
    updateQty: (id, qty) => setCart((c) => c.map((i) => (i.variant_id === id ? { ...i, quantity: Math.max(1, qty) } : i))),
    removeItem: (id) => setCart((c) => c.filter((i) => i.variant_id !== id)),
    toggleFavorite: (id) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])),
    isFavorite: (id) => favorites.includes(id),
    cartCount: cart.reduce((s, i) => s + i.quantity, 0),
    subtotal: cart.reduce((s, i) => s + i.quantity * i.price, 0),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore fora do StoreProvider");
  return c;
}
