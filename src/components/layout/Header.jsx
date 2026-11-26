"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, Phone, ChevronDown, ShieldCheck } from "lucide-react";
import Wordmark from "@/components/ui/Wordmark";
import MegaMenu from "./MegaMenu";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useShop } from "@/store/shop";
import { store } from "@/data/catalog";

const links = [
  { href: "/collections/hv-nutrition", label: "HV Nutrition" },
  { href: "/collections/wellcore", label: "Wellcore" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const pathname = usePathname();
  const { setSearchOpen, setMenuOpen, menuOpen } = useShop();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mega, setMega] = useState(false);
  const lastY = useRef(0);
  const closeTimer = useRef(null);

  useEffect(() => {
    // Hide after scrolling down a bit; show again only after a deliberate
    // scroll up. `anchor` is where the current scroll direction began, so
    // tiny smooth-scroll steps never flip the bar back and forth.
    let anchor = window.scrollY;
    let dir = 0;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (y < 120) {
        setHidden(false);
        anchor = y;
        dir = 0;
      } else {
        const d = y > lastY.current ? 1 : y < lastY.current ? -1 : dir;
        if (d !== dir) {
          dir = d;
          anchor = lastY.current;
        }
        if (dir === 1 && y - anchor > 24) setHidden(true);
        else if (dir === -1 && anchor - y > 48) setHidden(false);
      }
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
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-lime focus:px-4 focus:py-2 focus:text-ink">
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
          <li onMouseEnter={closeMega} className="ml-2">
            <Link
              href="/verified"
              aria-current={active("/verified") ? "page" : undefined}
              className="group relative flex items-center gap-2 overflow-hidden bg-lime px-4 py-2 font-mono text-[0.72rem] font-bold uppercase tracking-[0.14em] text-ink shadow-[0_0_24px_-6px_var(--color-lime)] transition-shadow hover:shadow-[0_0_34px_-4px_var(--color-lime)]"
            >
              <ShieldCheck className="size-4" aria-hidden />
              Verified
              {/* sheen */}
              <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 animate-[sheen_3.2s_ease-in-out_infinite] bg-white/45" />
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-1">
          <Link
            href="/verified"
            className="flex h-9 items-center gap-1.5 bg-lime px-2.5 font-mono text-[0.62rem] font-bold uppercase tracking-[0.12em] text-ink lg:hidden"
            aria-label="FSSAI verified — view registration"
          >
            <ShieldCheck className="size-4" aria-hidden />
            <span className="hidden xs:inline">FSSAI</span>
          </Link>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-11 items-center gap-3 px-3 text-warm transition-colors hover:text-lime"
            aria-label="Search products"
          >
            <Search className="size-[1.15rem]" aria-hidden />
            <kbd className="hidden border border-line px-1.5 py-0.5 font-mono text-[0.6rem] text-mute xl:inline">/</kbd>
          </button>
          <ThemeToggle />
          <a
            href={store.phoneHref}
            className="hidden h-11 items-center gap-2 px-3 text-warm transition-colors hover:text-lime xs:flex"
            aria-label={`Call the store, ${store.phone}`}
          >
            <Phone className="size-[1.05rem]" aria-hidden />
            <span className="hidden font-mono text-[0.72rem] tracking-[0.08em] xl:inline">{store.phone}</span>
          </a>
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
