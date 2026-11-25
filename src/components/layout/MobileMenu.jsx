"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useShop } from "@/store/shop";
import { brands, categories } from "@/lib/catalog";
import { store } from "@/data/catalog";
import { lockScroll, unlockScroll } from "@/lib/lenis";

const ease = [0.16, 1, 0.3, 1];

export default function MobileMenu() {
  const { menuOpen, setMenuOpen } = useShop();

  useEffect(() => {
    if (!menuOpen) return;
    lockScroll();
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, setMenuOpen]);

  const primary = [
    { href: "/shop", label: "Shop all" },
    ...brands.map((b) => ({ href: `/collections/${b.slug}`, label: b.name })),
    { href: "/about", label: "About" },
  ];

  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          data-lenis-prevent
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.7, ease }}
          className="fixed inset-0 z-[55] flex flex-col overflow-y-auto bg-obsidian pt-20 lg:hidden"
        >
          <nav aria-label="Mobile" className="shell flex-1">
            <ul>
              {primary.map((l, i) => (
                <li key={l.href} className="overflow-hidden border-b border-line">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, delay: 0.15 + i * 0.05, ease }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-baseline justify-between py-3 active:text-lime"
                    >
                      <span className="display text-[13vw] leading-[0.9] xs:text-6xl">{l.label}</span>
                      <span className="font-mono text-xs text-mute">{String(i + 1).padStart(2, "0")}</span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-wrap gap-2"
            >
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/collections/${c.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="border border-line px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-warm active:border-lime active:text-lime"
                >
                  {c.name}
                </Link>
              ))}
            </motion.div>
          </nav>
          <div className="shell flex flex-col gap-1 py-8 font-mono text-xs text-mute">
            <a href={store.phoneHref} className="text-warm">{store.phone}</a>
            <a href={`mailto:${store.email}`} className="break-all">{store.email}</a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
