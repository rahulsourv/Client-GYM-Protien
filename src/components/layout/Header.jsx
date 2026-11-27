"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogIn, Search, ShieldCheck, UserRound } from "lucide-react";
import { useAccount } from "@/store/account";
import Wordmark from "@/components/ui/Wordmark";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useShop } from "@/store/shop";
import { categories } from "@/lib/catalog";

const categoryPaths = categories.map((c) => `/collections/${c.slug}`);

// `match` lists the other routes that should light up the link as the current section.
const links = [
  { href: "/categories", label: "Categories", match: categoryPaths },
  { href: "/shop", label: "Products", match: ["/products"] },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const { session } = useAccount();
  const accountHref = session ? "/profile" : "/login";
  const accountLabel = session ? "Profile" : "Login";
  const AccountIcon = session ? UserRound : LogIn;
  const { setSearchOpen, setMenuOpen, menuOpen } = useShop();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

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

  const solid = scrolled;
  const under = (href) => pathname === href || pathname.startsWith(href + "/");
  const active = (l) => under(l.href) || (l.match ?? []).some(under);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[60] transition-transform duration-500 ease-[var(--ease-out-expo)] ${
        hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div
        className={`absolute inset-0 -z-10 border-b transition-colors duration-500 ${
          solid ? "border-line bg-obsidian/85 backdrop-blur-md" : "border-transparent bg-transparent"
        }`}
      />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-lime focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <nav aria-label="Primary" className="shell flex h-[4.5rem] items-center justify-between gap-3 md:h-24 md:gap-6">
        <Link href="/" className="shrink-0 text-[1rem] text-warm sm:text-[1.15rem] md:text-[1.35rem]" aria-label="HV Nutrition — home">
          <Wordmark />
        </Link>

        <ul className="hidden items-center gap-2 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active(l) ? "page" : undefined}
                className="group relative block px-5 py-3 font-mono text-[0.95rem] font-medium uppercase tracking-[0.08em] text-warm transition-colors hover:text-lime aria-[current=page]:text-lime"
              >
                {l.label}
                <span
                  aria-hidden
                  className={`absolute inset-x-5 bottom-1.5 h-0.5 origin-left bg-lime transition-transform duration-500 ease-[var(--ease-out-expo)] ${
                    active(l) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            </li>
          ))}
          <li className="ml-2">
            <Link
              href="/verified"
              aria-current={under("/verified") ? "page" : undefined}
              className="group relative flex items-center gap-2 overflow-hidden bg-lime px-5 py-3 font-mono text-[0.95rem] font-bold uppercase tracking-[0.08em] text-ink shadow-[0_0_24px_-6px_var(--color-lime)] transition-shadow hover:shadow-[0_0_34px_-4px_var(--color-lime)]"
            >
              <ShieldCheck className="size-5" aria-hidden />
              Verified
              {/* sheen */}
              <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 animate-[sheen_3.2s_ease-in-out_infinite] bg-white/45" />
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <Link
            href="/contact"
            aria-current={under("/contact") ? "page" : undefined}
            className="hidden h-10 items-center border border-line px-3 font-mono text-[0.8rem] font-medium uppercase tracking-[0.08em] text-warm transition-colors hover:border-lime hover:text-lime aria-[current=page]:text-lime sm:flex lg:hidden"
          >
            Contact
          </Link>
          <Link
            href="/verified"
            className="flex h-10 items-center gap-1.5 bg-lime px-2 font-mono text-[0.8rem] font-bold uppercase tracking-[0.08em] text-ink xs:px-3 lg:hidden"
            aria-label="FSSAI verified — view registration"
          >
            <ShieldCheck className="size-[1.15rem]" aria-hidden />
            <span className="hidden sm:inline">FSSAI</span>
          </Link>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-11 items-center gap-2.5 px-2 text-warm transition-colors hover:border-lime hover:text-lime xs:px-3 md:border md:border-line md:px-4"
            aria-label="Search products"
          >
            <Search className="size-5" aria-hidden />
            <span className="hidden font-mono text-[0.9rem] uppercase tracking-[0.08em] md:inline">Search</span>
            <kbd className="hidden border border-line px-1.5 py-0.5 font-mono text-[0.7rem] text-mute xl:inline">/</kbd>
          </button>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="ml-1 flex h-11 items-center gap-2.5 pl-2 text-warm lg:hidden"
          >
            <span aria-hidden className="hidden font-mono text-[0.85rem] font-medium uppercase tracking-[0.08em] xs:inline">
              {menuOpen ? "Close" : "Menu"}
            </span>
            <span aria-hidden className="flex size-7 flex-col items-center justify-center gap-[6px]">
              <span className={`h-0.5 w-6 bg-warm transition-transform duration-500 ${menuOpen ? "translate-y-[4px] rotate-45" : ""}`} />
              <span className={`h-0.5 w-6 bg-warm transition-transform duration-500 ${menuOpen ? "-translate-y-[4px] -rotate-45" : ""}`} />
            </span>
          </button>
          <Link
            href={accountHref}
            aria-label={accountLabel}
            aria-current={under(accountHref) ? "page" : undefined}
            className="ml-1 flex h-10 shrink-0 items-center justify-center gap-2 border border-line px-2 font-mono text-[0.8rem] font-medium uppercase tracking-[0.08em] text-warm transition-colors hover:border-lime hover:text-lime aria-[current=page]:text-lime sm:px-3"
          >
            <AccountIcon className="size-4 sm:hidden" aria-hidden />
            <span className="hidden sm:inline">{accountLabel}</span>
          </Link>
        </div>
      </nav>

    </header>
  );
}
