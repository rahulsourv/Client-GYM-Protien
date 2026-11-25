"use client";

/**
 * Client-side UI state shared across the site: search overlay and mobile menu.
 * HV Nutrition doesn't sell online, so there is no cart — products are shown
 * with their price, and customers buy by calling, emailing or visiting the store.
 */
import { createContext, useContext, useState } from "react";

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const value = { searchOpen, setSearchOpen, menuOpen, setMenuOpen };
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside <ShopProvider>");
  return ctx;
}
