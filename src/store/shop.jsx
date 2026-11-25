"use client";

/**
 * Client-side shop state: cart (persisted to localStorage) + UI overlays
 * (cart drawer, search, mobile menu, quick view).
 *
 * The cart stores product IDs and quantities only; prices are always read
 * from the catalog so they can never drift from the source of truth.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { getProductById } from "@/lib/catalog";

const STORAGE_KEY = "hv-cart-v1";
const MAX_QTY = 10;

const ShopContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case "hydrate":
      return action.items;
    case "add": {
      const existing = state.find((i) => i.id === action.id);
      if (existing)
        return state.map((i) => (i.id === action.id ? { ...i, qty: Math.min(MAX_QTY, i.qty + action.qty) } : i));
      return [...state, { id: action.id, qty: Math.min(MAX_QTY, action.qty) }];
    }
    case "set":
      if (action.qty <= 0) return state.filter((i) => i.id !== action.id);
      return state.map((i) => (i.id === action.id ? { ...i, qty: Math.min(MAX_QTY, action.qty) } : i));
    case "swap": {
      // Variant change inside the cart: replace one product with a sibling.
      if (action.from === action.to) return state;
      const from = state.find((i) => i.id === action.from);
      if (!from) return state;
      const rest = state.filter((i) => i.id !== action.from);
      const target = rest.find((i) => i.id === action.to);
      if (target) return rest.map((i) => (i.id === action.to ? { ...i, qty: Math.min(MAX_QTY, i.qty + from.qty) } : i));
      const idx = state.indexOf(from);
      const next = [...state];
      next[idx] = { id: action.to, qty: from.qty };
      return next;
    }
    case "remove":
      return state.filter((i) => i.id !== action.id);
    case "clear":
      return [];
    default:
      return state;
  }
}

export function ShopProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickView, setQuickView] = useState(null); // product id
  const [lastAdded, setLastAdded] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      // Drop items that no longer exist in the catalog.
      dispatch({ type: "hydrate", items: parsed.filter((i) => getProductById(i.id) && i.qty > 0) });
    } catch {
      /* storage unavailable — start empty */
    }
    // One-time sync from browser storage after mount (avoids SSR mismatch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  const lines = useMemo(
    () =>
      items
        .map((i) => {
          const product = getProductById(i.id);
          return product ? { ...i, product, lineTotal: product.price * i.qty } : null;
        })
        .filter(Boolean),
    [items]
  );
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0);

  const addToCart = useCallback((id, qty = 1, { open = true } = {}) => {
    dispatch({ type: "add", id, qty });
    setLastAdded({ id, at: Date.now() });
    setQuickView(null);
    if (open) setCartOpen(true);
  }, []);

  const value = {
    lines,
    count,
    subtotal,
    hydrated,
    maxQty: MAX_QTY,
    addToCart,
    setQty: (id, qty) => dispatch({ type: "set", id, qty }),
    swapVariant: (from, to) => dispatch({ type: "swap", from, to }),
    removeFromCart: (id) => dispatch({ type: "remove", id }),
    clearCart: () => dispatch({ type: "clear" }),
    lastAdded,
    cartOpen,
    setCartOpen,
    searchOpen,
    setSearchOpen,
    menuOpen,
    setMenuOpen,
    quickView,
    setQuickView,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside <ShopProvider>");
  return ctx;
}
