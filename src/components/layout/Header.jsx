"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ShoppingBag, ChevronDown } from "lucide-react";
import Wordmark from "@/components/ui/Wordmark";
import MegaMenu from "./MegaMenu";
import { useShop } from "@/store/shop";

const links = [
  { href: "/collections/hv-nutrition", label: "HV Nutrition" },
  { href: "/collections/wellcore", label: "Wellcore" },
  { href: "/collections/muscleblaze", label: "MuscleBlaze" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const pathname = usePathname();
  const { count, setCartOpen, setSearchOpen, setMenuOpen, menuOpen, hydrated } = useShop();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mega, setMega] = useState(false);
  const lastY = useRef(0);
  const closeTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 300 && y > lastY.current + 4);
      if (y < lastY.current - 4) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mega menu on navigation (state adjusted during render, not in an effect).
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMega(false);
  }

  // Keyboard shortcuts: "/" or Ctrl/Cmd+K open search.
  useEffect(() => {
    const onKey = (e) => {
      const typing = /input|textarea|select/i.test(document.activeElement?.tagName ?? "");
      if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  const openMega = () => {
    clearTimeout(closeTimer.current);
    setMega(true);
  };
  const closeMega = () => {
    closeTimer.current = setTimeout(() => setMega(false), 120);
  };

  const solid = scrolled || mega;
  const active = (href) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[60] transition-transform duration-500 ease-[var(--ease-out-expo)] ${
        hidden && !mega && !menuOpen ? "-translate-y-full" : "translate-y-0"
      }`}
      onMouseLeave={closeMega}
    >
      <div
        className={`absolute inset-0 -z-10 border-b transition-colors duration-500 ${
          solid ? "border-line bg-obsidian/85 backdrop-blur-md" : "border-transparent bg-transparent"
        }`}
      />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-lime focus:px-4 focus:py-2 focus:text-obsidian">
        Skip to content
      </a>
      <nav aria-label="Primary" className="shell flex h-16 items-center justify-between gap-6 md:h-20">
        <Link href="/" className="text-[0.95rem] text-warm" aria-label="HV Nutrition — home">
          <Wordmark />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          <li onMouseEnter={openMega}>
            <button
              type="button"
              aria-expanded={mega}
              aria-controls="mega-menu"
              onClick={() => setMega((m) => !m)}
              className={`group flex items-center gap-1.5 px-4 py-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] transition-colors hover:text-lime ${
                mega || active("/shop") ? "text-lime" : "text-warm"
              }`}
            >
              Shop
              <ChevronDown aria-hidden className={`size-3.5 transition-transform duration-300 ${mega ? "rotate-180" : ""}`} />
            </button>
          </li>
          {links.map((l) => (
            <li key={l.href} onMouseEnter={closeMega}>
              <Link
                href={l.href}
                aria-current={active(l.href) ? "page" : undefined}
                className="group relative block px-4 py-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-warm transition-colors hover:text-lime aria-[current=page]:text-lime"
              >
                {l.label}
                <span
                  aria-hidden
                  className={`absolute inset-x-4 bottom-1 h-px origin-left bg-lime transition-transform duration-500 ease-[var(--ease-out-expo)] ${
                    active(l.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-11 items-center gap-3 px-3 text-warm transition-colors hover:text-lime"
            aria-label="Search products"
          >
            <Search className="size-[1.15rem]" aria-hidden />
            <kbd className="hidden border border-line px-1.5 py-0.5 font-mono text-[0.6rem] text-mute xl:inline">/</kbd>
          </button>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex h-11 items-center gap-2 px-3 text-warm transition-colors hover:text-lime"
            aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            <ShoppingBag className="size-[1.15rem]" aria-hidden />
            <span className="relative h-4 min-w-4 overflow-hidden font-mono text-[0.72rem] tabular-nums">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={hydrated ? count : "x"}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={`block ${count ? "text-lime" : ""}`}
                >
                  {hydrated ? String(count).padStart(2, "0") : "00"}
                </motion.span>
              </AnimatePresence>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="relative ml-1 flex size-11 flex-col items-center justify-center gap-[5px] lg:hidden"
          >
            <span className={`h-px w-6 bg-warm transition-transform duration-500 ${menuOpen ? "translate-y-[3px] rotate-45" : ""}`} />
            <span className={`h-px w-6 bg-warm transition-transform duration-500 ${menuOpen ? "-translate-y-[3px] -rotate-45" : ""}`} />
          </button>
        </div>
      </nav>

      <MegaMenu open={mega} onEnter={openMega} onClose={() => setMega(false)} />
    </header>
  );
}
