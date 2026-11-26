"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { searchProducts, categories, brands, formatPrice, getBrand } from "@/lib/catalog";
import ProductImage from "@/components/product/ProductImage";

const suggestions = ["Whey", "Creatine", "Pre-workout", "Kiwi Kick", "Unflavoured"];

/** Shared search UI used by the overlay and the /search page. */
export default function SearchPanel({ onNavigate, onClose, autoFocus = true }) {
  const [q, setQ] = useState("");
  const deferred = useDeferredValue(q);
  const results = useMemo(() => searchProducts(deferred), [deferred]);
  const hasQuery = deferred.trim().length > 0;

  return (
    <div className="flex h-full flex-col">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="flex items-center gap-4 border-b border-line pb-4">
        <Search className="size-6 shrink-0 text-mute" aria-hidden />
        <label htmlFor="site-search" className="sr-only">
          Search products, brands and categories
        </label>
        <input
          id="site-search"
          data-autofocus={autoFocus || undefined}
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search whey, creatine, Wellcore…"
          autoComplete="off"
          spellCheck={false}
          className="display min-w-0 flex-1 bg-transparent text-5xl text-warm outline-none placeholder:text-graphite md:text-7xl"
          aria-controls="search-results"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} className="eyebrow text-mute hover:text-warm">
            Clear
          </button>
        )}
        {onClose && (
          <button type="button" onClick={onClose} className="grid size-11 place-items-center text-warm hover:text-lime" aria-label="Close search">
            <X className="size-6" aria-hidden />
          </button>
        )}
      </form>

      <div id="search-results" className="flex-1 overflow-y-auto py-6" data-lenis-prevent aria-live="polite">
        {!hasQuery ? (
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <p className="eyebrow mb-4 text-mute">Try</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQ(s)}
                    className="border border-line px-3.5 py-2 text-sm text-warm transition-colors hover:border-lime hover:text-lime"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <QuickLinks title="Categories" items={categories.map((c) => ({ href: `/collections/${c.slug}`, label: c.name }))} onNavigate={onNavigate} />
            <QuickLinks title="Brands" items={brands.map((b) => ({ href: `/collections/${b.slug}`, label: b.name }))} onNavigate={onNavigate} />
          </div>
        ) : results.length === 0 ? (
          <div className="py-10">
            <p className="display text-5xl text-soft">No match for “{deferred}”.</p>
            <p className="mt-3 text-sm text-mute">Try a brand (Wellcore, Rebuild), a category (creatine, whey) or a flavour.</p>
          </div>
        ) : (
          <>
            <p className="eyebrow mb-4 text-mute">
              {results.length} result{results.length === 1 ? "" : "s"}
            </p>
            <ul className="grid gap-x-8 sm:grid-cols-2">
              {results.map((p, i) => (
                <motion.li
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 8) * 0.03, duration: 0.4 }}
                >
                  <Link
                    href={`/products/${p.slug}`}
                    onClick={onNavigate}
                    className="group flex items-center gap-4 border-b border-line py-3"
                  >
                    <ProductImage image={p.images[0]} sizes="80px" className="aspect-square w-16 shrink-0" pad="8%" />
                    <span className="min-w-0 flex-1">
                      <span className="eyebrow block text-mute">{getBrand(p.brand)?.name}</span>
                      <span className="block truncate text-warm group-hover:text-lime">
                        {p.name} <span className="text-mute">· {[p.flavour, p.size].filter(Boolean).join(" · ")}</span>
                      </span>
                    </span>
                    <span className="font-mono text-sm tabular-nums">{formatPrice(p.price)}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function QuickLinks({ title, items, onNavigate }) {
  return (
    <div>
      <p className="eyebrow mb-4 text-mute">{title}</p>
      <ul>
        {items.map((it) => (
          <li key={it.href}>
            <Link href={it.href} onClick={onNavigate} className="display block py-1 text-3xl text-warm transition-colors hover:text-lime">
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
